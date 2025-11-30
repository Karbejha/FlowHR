import { Request, Response } from 'express';
import { Payroll, PayrollStatus } from '../models/Payroll';
import { User, UserRole } from '../models/User';
import { calculateEmployeeSalary, calculateWorkingDays } from '../utils/payrollCalculator';
import { logError } from '../utils/logger';
import mongoose from 'mongoose';

interface UserDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  managerId?: mongoose.Types.ObjectId;
  role: UserRole;
}

/**
 * Generate payroll for a specific employee and month
 */
export const generatePayroll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, month, year, bonuses, notes } = req.body;
    
    // Validate inputs
    if (!employeeId || !month || !year) {
      res.status(400).json({ error: 'MISSING_REQUIRED_FIELDS', message: 'Employee ID, month, and year are required' });
      return;
    }
    
    if (month < 1 || month > 12) {
      res.status(400).json({ error: 'INVALID_MONTH', message: 'Invalid month. Must be between 1 and 12' });
      return;
    }
    
    // Check if payroll already exists for this employee and month
    const existingPayroll = await Payroll.findOne({ employee: employeeId, month, year });
    if (existingPayroll) {
      res.status(400).json({ error: 'PAYROLL_ALREADY_EXISTS', message: 'Payroll already exists for this employee and month' });
      return;
    }
    
    // Check if employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      res.status(404).json({ error: 'EMPLOYEE_NOT_FOUND', message: 'Employee not found' });
      return;
    }
    
    if (!employee.salaryInfo || !employee.salaryInfo.basicSalary) {
      res.status(400).json({ error: 'SALARY_INFO_NOT_CONFIGURED', message: 'Employee salary information not configured' });
      return;
    }
    
    // Calculate salary
    const salaryCalculation = await calculateEmployeeSalary(
      new mongoose.Types.ObjectId(employeeId),
      month,
      year,
      bonuses || {}
    );
    
    // Create payroll record
    const payroll = new Payroll({
      employee: employeeId,
      month,
      year,
      basicSalary: salaryCalculation.basicSalary,
      allowances: salaryCalculation.allowances,
      workingDays: salaryCalculation.workingDays,
      attendedDays: salaryCalculation.attendedDays,
      absentDays: salaryCalculation.absentDays,
      lateDeductions: salaryCalculation.lateDeductions,
      bonuses: {
        performance: bonuses?.performance || 0,
        project: bonuses?.project || 0,
        other: bonuses?.other || 0
      },
      overtimeHours: salaryCalculation.overtimeHours,
      overtimePay: salaryCalculation.overtimePay,
      deductions: salaryCalculation.deductions,
      grossSalary: salaryCalculation.grossSalary,
      totalDeductions: salaryCalculation.totalDeductions,
      netSalary: salaryCalculation.netSalary,
      status: PayrollStatus.DRAFT,
      notes
    });
    
    await payroll.save();
    
    const populatedPayroll = await Payroll.findById(payroll._id)
      .populate('employee', 'firstName lastName email department jobTitle');
    
    res.status(201).json(populatedPayroll);
  } catch (error) {
    logError('Error generating payroll:', error);
    res.status(500).json({ error: 'Error generating payroll' });
  }
};

/**
 * Generate payroll for all employees
 */
export const generateBulkPayroll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { month, year } = req.body;
    
    if (!month || !year) {
      res.status(400).json({ error: 'Month and year are required' });
      return;
    }
    
    // Get all active employees with salary info
    const employees = await User.find({ 
      isActive: true,
      'salaryInfo.basicSalary': { $gt: 0 }
    });
    
    const results: {
      success: Array<{ employeeId: mongoose.Types.ObjectId; name: string; payrollId: mongoose.Types.ObjectId }>;
      failed: Array<{ employeeId: mongoose.Types.ObjectId; name: string; reason: string }>;
    } = {
      success: [],
      failed: []
    };
    
    for (const employee of employees) {
      try {
        // Check if payroll already exists
        const existingPayroll = await Payroll.findOne({ 
          employee: employee._id, 
          month, 
          year 
        });
        
        if (existingPayroll) {
          results.failed.push({
            employeeId: employee._id as mongoose.Types.ObjectId,
            name: `${employee.firstName} ${employee.lastName}`,
            reason: 'Payroll already exists'
          });
          continue;
        }
        
        // Calculate salary
        const salaryCalculation = await calculateEmployeeSalary(
          employee._id as mongoose.Types.ObjectId,
          month,
          year
        );
        
        // Create payroll record
        const payroll = new Payroll({
          employee: employee._id,
          month,
          year,
          basicSalary: salaryCalculation.basicSalary,
          allowances: salaryCalculation.allowances,
          workingDays: salaryCalculation.workingDays,
          attendedDays: salaryCalculation.attendedDays,
          absentDays: salaryCalculation.absentDays,
          lateDeductions: salaryCalculation.lateDeductions,
          bonuses: {
            performance: 0,
            project: 0,
            other: 0
          },
          overtimeHours: salaryCalculation.overtimeHours,
          overtimePay: salaryCalculation.overtimePay,
          deductions: salaryCalculation.deductions,
          grossSalary: salaryCalculation.grossSalary,
          totalDeductions: salaryCalculation.totalDeductions,
          netSalary: salaryCalculation.netSalary,
          status: PayrollStatus.DRAFT
        });
        
        await payroll.save();
        
        results.success.push({
          employeeId: employee._id as mongoose.Types.ObjectId,
          name: `${employee.firstName} ${employee.lastName}`,
          payrollId: payroll._id as mongoose.Types.ObjectId
        });
      } catch (error) {
        results.failed.push({
          employeeId: employee._id as mongoose.Types.ObjectId,
          name: `${employee.firstName} ${employee.lastName}`,
          reason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    res.json({
      message: 'Bulk payroll generation completed',
      results
    });
  } catch (error) {
    logError('Error generating bulk payroll:', error);
    res.status(500).json({ error: 'Error generating bulk payroll' });
  }
};

/**
 * Get payroll by employee
 */
export const getPayrollByEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const { year } = req.query;
    
    // Check permission
    if (req.user.role === UserRole.EMPLOYEE && req.user._id.toString() !== employeeId) {
      res.status(403).json({ error: 'Not authorized to view this payroll' });
      return;
    }
    
    const query: any = { employee: employeeId };
    if (year) {
      query.year = parseInt(year as string);
    }
    
    const payrolls = await Payroll.find(query)
      .populate('employee', 'firstName lastName email department jobTitle')
      .populate('approvedBy', 'firstName lastName')
      .sort({ year: -1, month: -1 });
    
    res.json(payrolls);
  } catch (error) {
    logError('Error fetching employee payroll:', error);
    res.status(500).json({ error: 'Error fetching employee payroll' });
  }
};

/**
 * Get all payrolls (admin/manager view)
 */
export const getAllPayrolls = async (req: Request, res: Response): Promise<void> => {
  try {
    const { month, year, status, department } = req.query;
    
    const query: any = {};
    
    if (month) query.month = parseInt(month as string);
    if (year) query.year = parseInt(year as string);
    if (status) query.status = status;
    
    let payrolls = await Payroll.find(query)
      .populate('employee', 'firstName lastName email department jobTitle managerId')
      .populate('approvedBy', 'firstName lastName')
      .sort({ year: -1, month: -1 });
    
    // If manager, filter by their team
    if (req.user.role === UserRole.MANAGER) {
      const teamMembers = await User.find({ managerId: req.user._id });
      const teamIds = teamMembers.map(member => (member._id as mongoose.Types.ObjectId).toString());
      payrolls = payrolls.filter(payroll => 
        teamIds.includes((payroll.employee as any)._id.toString())
      );
    }
    
    // Filter by department if specified
    if (department) {
      payrolls = payrolls.filter(payroll => 
        (payroll.employee as any).department === department
      );
    }
    
    res.json(payrolls);
  } catch (error) {
    logError('Error fetching payrolls:', error);
    res.status(500).json({ error: 'Error fetching payrolls' });
  }
};

/**
 * Get specific payroll details
 */
export const getPayrollById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { payrollId } = req.params;
    
    const payroll = await Payroll.findById(payrollId)
      .populate('employee', 'firstName lastName email department jobTitle managerId')
      .populate('approvedBy', 'firstName lastName');
    
    if (!payroll) {
      res.status(404).json({ error: 'PAYROLL_NOT_FOUND', message: 'Payroll not found' });
      return;
    }
    
    // Check permission
    const employee = payroll.employee as any;
    if (req.user.role === UserRole.EMPLOYEE && req.user._id.toString() !== employee._id.toString()) {
      res.status(403).json({ error: 'Not authorized to view this payroll' });
      return;
    }
    
    if (req.user.role === UserRole.MANAGER && 
        employee.managerId?.toString() !== req.user._id.toString()) {
      res.status(403).json({ error: 'Not authorized to view this payroll' });
      return;
    }
    
    res.json(payroll);
  } catch (error) {
    logError('Error fetching payroll:', error);
    res.status(500).json({ error: 'Error fetching payroll' });
  }
};

/**
 * Update payroll
 */
export const updatePayroll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { payrollId } = req.params;
    const updates = req.body;
    
    const payroll = await Payroll.findById(payrollId);
    
    if (!payroll) {
      res.status(404).json({ error: 'PAYROLL_NOT_FOUND', message: 'Payroll not found' });
      return;
    }
    
    // Only allow updates if status is draft or pending
    if (payroll.status === PayrollStatus.APPROVED || payroll.status === PayrollStatus.PAID) {
      res.status(400).json({ error: 'CANNOT_UPDATE_APPROVED_PAYROLL', message: 'Cannot update approved or paid payroll' });
      return;
    }
    
    // Update allowed fields
    const allowedUpdates = [
      'bonuses', 'deductions', 'notes', 'lateDeductions', 'overtimeHours', 'overtimePay'
    ];
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        (payroll as any)[field] = updates[field];
      }
    });
    
    // Recalculate if necessary
    payroll.calculateNetSalary();
    
    await payroll.save();
    
    const updatedPayroll = await Payroll.findById(payrollId)
      .populate('employee', 'firstName lastName email department jobTitle')
      .populate('approvedBy', 'firstName lastName');
    
    res.json(updatedPayroll);
  } catch (error) {
    logError('Error updating payroll:', error);
    res.status(500).json({ error: 'Error updating payroll' });
  }
};

/**
 * Approve payroll
 */
export const approvePayroll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { payrollId } = req.params;
    const { notes } = req.body;
    
    const payroll = await Payroll.findById(payrollId);
    
    if (!payroll) {
      res.status(404).json({ error: 'PAYROLL_NOT_FOUND', message: 'Payroll not found' });
      return;
    }
    
    if (payroll.status === PayrollStatus.APPROVED || payroll.status === PayrollStatus.PAID) {
      res.status(400).json({ error: 'PAYROLL_ALREADY_APPROVED', message: 'Payroll already approved or paid' });
      return;
    }
    
    payroll.status = PayrollStatus.APPROVED;
    payroll.approvedBy = req.user._id;
    payroll.approvalDate = new Date();
    if (notes) {
      payroll.notes = notes;
    }
    
    await payroll.save();
    
    const updatedPayroll = await Payroll.findById(payrollId)
      .populate('employee', 'firstName lastName email department jobTitle')
      .populate('approvedBy', 'firstName lastName');
    
    res.json(updatedPayroll);
  } catch (error) {
    logError('Error approving payroll:', error);
    res.status(500).json({ error: 'Error approving payroll' });
  }
};

/**
 * Mark payroll as paid
 */
export const markAsPaid = async (req: Request, res: Response): Promise<void> => {
  try {
    const { payrollId } = req.params;
    const { paymentDate } = req.body;
    
    const payroll = await Payroll.findById(payrollId);
    
    if (!payroll) {
      res.status(404).json({ error: 'PAYROLL_NOT_FOUND', message: 'Payroll not found' });
      return;
    }
    
    if (payroll.status !== PayrollStatus.APPROVED) {
      res.status(400).json({ error: 'PAYROLL_NOT_APPROVED', message: 'Payroll must be approved before marking as paid' });
      return;
    }
    
    payroll.status = PayrollStatus.PAID;
    payroll.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
    
    await payroll.save();
    
    const updatedPayroll = await Payroll.findById(payrollId)
      .populate('employee', 'firstName lastName email department jobTitle')
      .populate('approvedBy', 'firstName lastName');
    
    res.json(updatedPayroll);
  } catch (error) {
    logError('Error marking payroll as paid:', error);
    res.status(500).json({ error: 'Error marking payroll as paid' });
  }
};

/**
 * Delete payroll (only draft status)
 */
export const deletePayroll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { payrollId } = req.params;
    
    const payroll = await Payroll.findById(payrollId);
    
    if (!payroll) {
      res.status(404).json({ error: 'PAYROLL_NOT_FOUND', message: 'Payroll not found' });
      return;
    }
    
    if (payroll.status !== PayrollStatus.DRAFT) {
      res.status(400).json({ error: 'CAN_ONLY_DELETE_DRAFT', message: 'Can only delete draft payrolls' });
      return;
    }
    
    await Payroll.findByIdAndDelete(payrollId);
    
    res.json({ message: 'Payroll deleted successfully' });
  } catch (error) {
    logError('Error deleting payroll:', error);
    res.status(500).json({ error: 'Error deleting payroll' });
  }
};

/**
 * Generate payroll report
 */
export const generatePayrollReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { month, year } = req.params;
    
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    const payrolls = await Payroll.find({ month: monthNum, year: yearNum })
      .populate('employee', 'firstName lastName email department jobTitle role');
    
    // Calculate summary statistics
    const summary = {
      totalEmployees: payrolls.length,
      totalGrossSalary: 0,
      totalDeductions: 0,
      totalNetSalary: 0,
      totalOvertimePay: 0,
      totalBonuses: 0,
      byDepartment: {} as Record<string, any>,
      byStatus: {
        draft: 0,
        pending: 0,
        approved: 0,
        paid: 0
      },
      averageSalary: 0,
      workingDays: calculateWorkingDays(monthNum, yearNum)
    };
    
    payrolls.forEach(payroll => {
      const employee = payroll.employee as any;
      const dept = employee.department || 'Unknown';
      
      // Update totals
      summary.totalGrossSalary += payroll.grossSalary;
      summary.totalDeductions += payroll.totalDeductions;
      summary.totalNetSalary += payroll.netSalary;
      summary.totalOvertimePay += payroll.overtimePay;
      summary.totalBonuses += 
        payroll.bonuses.performance + 
        payroll.bonuses.project + 
        payroll.bonuses.other;
      
      // Update by department
      if (!summary.byDepartment[dept]) {
        summary.byDepartment[dept] = {
          count: 0,
          totalGrossSalary: 0,
          totalNetSalary: 0,
          averageSalary: 0
        };
      }
      summary.byDepartment[dept].count++;
      summary.byDepartment[dept].totalGrossSalary += payroll.grossSalary;
      summary.byDepartment[dept].totalNetSalary += payroll.netSalary;
      
      // Update by status
      summary.byStatus[payroll.status]++;
    });
    
    // Calculate averages
    summary.averageSalary = summary.totalNetSalary / (summary.totalEmployees || 1);
    
    Object.keys(summary.byDepartment).forEach(dept => {
      const deptData = summary.byDepartment[dept];
      deptData.averageSalary = deptData.totalNetSalary / deptData.count;
    });
    
    res.json({
      month: monthNum,
      year: yearNum,
      summary,
      payrolls
    });
  } catch (error) {
    logError('Error generating payroll report:', error);
    res.status(500).json({ error: 'Error generating payroll report' });
  }
};

/**
 * Get my payslips (employee view)
 */
export const getMyPayslips = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year } = req.query;
    
    const query: any = { employee: req.user._id };
    if (year) {
      query.year = parseInt(year as string);
    }
    
    const payrolls = await Payroll.find(query)
      .populate('employee', 'firstName lastName email department jobTitle')
      .populate('approvedBy', 'firstName lastName')
      .sort({ year: -1, month: -1 });
    
    res.json(payrolls);
  } catch (error) {
    logError('Error fetching payslips:', error);
    res.status(500).json({ error: 'Error fetching payslips' });
  }
};

