import { Request, Response } from 'express';
import { User } from '../models/User';
import { Attendance } from '../models/Attendance';
import { Leave } from '../models/Leave';
import { logError } from '../utils/logger';

export const getEmployeeDemographics = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all employees (excluding password)
    const employees = await User.find().select('-password');
    
    // Get the current date to calculate age and tenure
    const currentDate = new Date();
    
    // Department distribution
    const departmentDistribution = await User.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Gender distribution (assuming we'd add this field to User model in the future)
    // For now, we'll return a placeholder
    const genderDistribution = {
      male: 0,
      female: 0,
      other: 0,
      notSpecified: employees.length
    };
    
    // Age distribution
    const ageGroups = {
      'Under 25': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55+': 0
    };
    
    // Tenure distribution
    const tenureGroups = {
      'Less than 1 year': 0,
      '1-3 years': 0,
      '3-5 years': 0,
      '5-10 years': 0,
      'More than 10 years': 0
    };
    
    // Calculate age and tenure for each employee
    employees.forEach(employee => {
      // Calculate age
      if (employee.dateOfBirth) {
        const birthDate = new Date(employee.dateOfBirth);
        const age = currentDate.getFullYear() - birthDate.getFullYear();
        
        if (age < 25) ageGroups['Under 25']++;
        else if (age < 35) ageGroups['25-34']++;
        else if (age < 45) ageGroups['35-44']++;
        else if (age < 55) ageGroups['45-54']++;
        else ageGroups['55+']++;
      }
      
      // Calculate tenure
      if (employee.hireDate) {
        const hireDate = new Date(employee.hireDate);
        const tenureYears = currentDate.getFullYear() - hireDate.getFullYear();
        const tenureMonths = currentDate.getMonth() - hireDate.getMonth();
        const totalTenureMonths = tenureYears * 12 + tenureMonths;
        
        if (totalTenureMonths < 12) tenureGroups['Less than 1 year']++;
        else if (totalTenureMonths < 36) tenureGroups['1-3 years']++;
        else if (totalTenureMonths < 60) tenureGroups['3-5 years']++;
        else if (totalTenureMonths < 120) tenureGroups['5-10 years']++;
        else tenureGroups['More than 10 years']++;
      }
    });
    
    // Role distribution
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    // Prepare the response
    const demographicsData = {
      totalEmployees: employees.length,
      departmentDistribution,
      roleDistribution,
      ageDistribution: Object.entries(ageGroups).map(([range, count]) => ({ range, count })),
      tenureDistribution: Object.entries(tenureGroups).map(([range, count]) => ({ range, count })),
      genderDistribution
    };
    
    res.json(demographicsData);
  } catch (error) {
    logError('Error fetching employee demographics', { error });
    res.status(500).json({ error: 'Error fetching employee demographics' });
  }
};

// Controller for Time and Attendance report
export const getTimeAndAttendanceReport = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get query parameters for date range filtering
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30)); // Default to last 30 days
    const end = endDate ? new Date(endDate as string) : new Date();
      // Fetch attendance data within the date range
    const attendanceData = await Attendance.find({
      date: { $gte: start, $lte: end }
    }).populate('employee', 'firstName lastName email department role');
    
    // Calculate statistics
    const attendanceSummary = {
      totalRecords: attendanceData.length,
      onTime: 0,
      late: 0,
      earlyDeparture: 0,
      absent: 0,
      workHoursByDepartment: {} as Record<string, { total: number, count: number, average: number }>,

      attendanceByDay: {} as Record<string, number>,
      averageWorkHours: 0,
      latePercentage: 0
    };
    
    let totalWorkHours = 0;    
    // Process attendance data
    attendanceData.forEach(record => {
      // Count attendance status
      if (record.records.length === 0) {
        attendanceSummary.absent++;
      } else if (record.status === 'late') {
        attendanceSummary.late++;
      } else {
        attendanceSummary.onTime++;
      }
      
      if (record.status === 'half-day') {
        attendanceSummary.earlyDeparture++;
      }
      
      // Calculate work hours if records exist with clockIn and clockOut
      if (record.records.length > 0 && record.totalHours > 0) {
        const workHours = record.totalHours;
        totalWorkHours += workHours;
        
        // Group by department
        const user = record.employee as any; // Using any to avoid TypeScript issues with populated fields
        const department = user?.department || 'Unknown';
        
        if (!attendanceSummary.workHoursByDepartment[department]) {
          attendanceSummary.workHoursByDepartment[department] = {
            total: 0,
            count: 0,
            average: 0
          };        }
        
        attendanceSummary.workHoursByDepartment[department].total += workHours;
        attendanceSummary.workHoursByDepartment[department].count++;
      }
      
      // Group by day of week
      const dayOfWeek = new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' });
      attendanceSummary.attendanceByDay[dayOfWeek] = (attendanceSummary.attendanceByDay[dayOfWeek] || 0) + 1;
    });
    
    // Calculate averages
    attendanceSummary.averageWorkHours = totalWorkHours / (attendanceData.length || 1);
    attendanceSummary.latePercentage = (attendanceSummary.late / (attendanceData.length || 1)) * 100;
    
    // Calculate department averages
    Object.keys(attendanceSummary.workHoursByDepartment).forEach(dept => {
      const deptData = attendanceSummary.workHoursByDepartment[dept];
      deptData.average = deptData.total / (deptData.count || 1);
    });
    
    res.json(attendanceSummary);
  } catch (error) {
    logError('Error generating time and attendance report:', error);
    res.status(500).json({ message: 'Error generating time and attendance report' });
  }
};

// Controller for Leave Usage Analysis report
export const getLeaveUsageReport = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get query parameters for date range filtering
    const { year } = req.query;
    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();
      // Fetch leave data for the specified year
    const startDate = new Date(`${currentYear}-01-01`);
    const endDate = new Date(`${currentYear}-12-31`);
    
    const leaveData = await Leave.find({
      $or: [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } }
      ]
    }).populate('employee', 'firstName lastName email department role');
    
    // Initialize report structure
    const leaveUsageSummary = {
      totalLeaveRequests: leaveData.length,
      totalDaysTaken: 0,
      leaveByType: {} as Record<string, number>,
      leaveByDepartment: {} as Record<string, number>,
      leaveByMonth: Array(12).fill(0),
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0
    };
    
    // Process leave data
    leaveData.forEach(record => {
      // Calculate days taken
      const start = new Date(Math.max(record.startDate.getTime(), startDate.getTime()));
      const end = new Date(Math.min(record.endDate.getTime(), endDate.getTime()));
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      leaveUsageSummary.totalDaysTaken += daysDiff;
      
      // Group by leave type
      leaveUsageSummary.leaveByType[record.leaveType] = (leaveUsageSummary.leaveByType[record.leaveType] || 0) + daysDiff;
      
      // Group by department
      const user = record.employee as any; // Using any to avoid TypeScript issues with populated fields
      const department = user?.department || 'Unknown';
      leaveUsageSummary.leaveByDepartment[department] = (leaveUsageSummary.leaveByDepartment[department] || 0) + daysDiff;
        // Group by month
      const month = record.startDate.getMonth();
      leaveUsageSummary.leaveByMonth[month] += daysDiff;
      
      // Count by status
      if (record.status === 'pending') {
        leaveUsageSummary.pendingRequests++;
      } else if (record.status === 'approved') {
        leaveUsageSummary.approvedRequests++;
      } else if (record.status === 'rejected') {
        leaveUsageSummary.rejectedRequests++;
      }
    });
    
    res.json(leaveUsageSummary);
  } catch (error) {
    logError('Error generating leave usage report:', error);
    res.status(500).json({ message: 'Error generating leave usage report' });
  }
};

// Controller for Resource Allocation report
export const getResourceAllocationReport = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all employees with their roles and departments
    const employees = await User.find().select('firstName lastName email role department projects');
    
    // Initialize report structure
    const resourceAllocationSummary = {
      totalEmployees: employees.length,
      employeesByDepartment: {} as Record<string, number>,
      employeesByRole: {} as Record<string, number>,
      departmentAllocation: [] as Array<{ department: string; count: number; percentage: number }>,
      roleDistribution: [] as Array<{ role: string; count: number; percentage: number }>,
      // We will simulate project allocation since we don't have actual project data
      projectAllocation: [
        { projectName: 'Product Development', employees: 15, allocation: 25 },
        { projectName: 'Marketing Campaign', employees: 8, allocation: 15 },
        { projectName: 'IT Infrastructure', employees: 10, allocation: 18 },
        { projectName: 'Customer Support', employees: 12, allocation: 22 },
        { projectName: 'HR Initiatives', employees: 5, allocation: 10 },
        { projectName: 'Administrative', employees: 6, allocation: 10 }
      ]
    };
    
    // Process employee data
    employees.forEach(employee => {
      // Count by department
      const department = employee.department || 'Unassigned';
      resourceAllocationSummary.employeesByDepartment[department] = 
        (resourceAllocationSummary.employeesByDepartment[department] || 0) + 1;
      
      // Count by role
      const role = employee.role || 'Unassigned';
      resourceAllocationSummary.employeesByRole[role] = 
        (resourceAllocationSummary.employeesByRole[role] || 0) + 1;
    });
    
    // Calculate percentages for department allocation
    Object.entries(resourceAllocationSummary.employeesByDepartment).forEach(([department, count]) => {
      resourceAllocationSummary.departmentAllocation.push({
        department,
        count,
        percentage: (count / employees.length) * 100
      });
    });
    
    // Sort by count descending
    resourceAllocationSummary.departmentAllocation.sort((a, b) => b.count - a.count);
    
    // Calculate percentages for role distribution
    Object.entries(resourceAllocationSummary.employeesByRole).forEach(([role, count]) => {
      resourceAllocationSummary.roleDistribution.push({
        role,
        count,
        percentage: (count / employees.length) * 100
      });
    });
    
    // Sort by count descending
    resourceAllocationSummary.roleDistribution.sort((a, b) => b.count - a.count);
    
    res.json(resourceAllocationSummary);
  } catch (error) {
    logError('Error generating resource allocation report:', error);
    res.status(500).json({ message: 'Error generating resource allocation report' });
  }
};
