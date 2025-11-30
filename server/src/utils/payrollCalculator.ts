import { Attendance } from '../models/Attendance';
import { Leave, LeaveStatus, LeaveType } from '../models/Leave';
import { User } from '../models/User';
import mongoose from 'mongoose';
import { startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';

interface AttendanceData {
  workingDays: number;
  attendedDays: number;
  absentDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  totalHoursWorked: number;
  overtimeHours: number;
  lateDays: number;
}

interface SalaryCalculation {
  basicSalary: number;
  allowances: {
    transportation: number;
    housing: number;
    food: number;
    mobile: number;
    other: number;
  };
  workingDays: number;
  attendedDays: number;
  absentDays: number;
  lateDeductions: number;
  overtimeHours: number;
  overtimePay: number;
  deductions: {
    tax: number;
    socialInsurance: number;
    healthInsurance: number;
    unpaidLeave: number;
    other: number;
  };
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
}

/**
 * Calculate total working days in a month (excluding weekends)
 */
export const calculateWorkingDays = (month: number, year: number): number => {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));
  
  const allDays = eachDayOfInterval({ start, end });
  const workingDays = allDays.filter(day => !isWeekend(day));
  
  return workingDays.length;
};

/**
 * Calculate attendance data for an employee in a given month
 */
export const calculateAttendance = async (
  employeeId: mongoose.Types.ObjectId,
  month: number,
  year: number
): Promise<AttendanceData> => {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));
  
  // Calculate total working days (excluding weekends)
  const workingDays = calculateWorkingDays(month, year);
  
  // Get attendance records for the month
  const attendanceRecords = await Attendance.find({
    employee: employeeId,
    date: {
      $gte: start,
      $lte: end
    }
  });
  
  // Get approved leaves for the month
  const leaves = await Leave.find({
    employee: employeeId,
    status: LeaveStatus.APPROVED,
    $or: [
      {
        startDate: { $gte: start, $lte: end }
      },
      {
        endDate: { $gte: start, $lte: end }
      },
      {
        startDate: { $lte: start },
        endDate: { $gte: end }
      }
    ]
  });
  
  // Calculate paid and unpaid leave days
  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;
  
  leaves.forEach(leave => {
    const leaveStart = leave.startDate < start ? start : leave.startDate;
    const leaveEnd = leave.endDate > end ? end : leave.endDate;
    const leaveDays = Math.ceil((leaveEnd.getTime() - leaveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Paid leaves: annual and sick
    if (leave.leaveType === LeaveType.ANNUAL || leave.leaveType === LeaveType.SICK) {
      paidLeaveDays += leaveDays;
    } else if (leave.leaveType === LeaveType.UNPAID) {
      unpaidLeaveDays += leaveDays;
    }
    // Note: You can add logic for other leave types (maternity, paternity, casual) based on company policy
  });
  
  // Calculate attendance metrics
  const attendedDays = attendanceRecords.filter(record => 
    record.status === 'present' || record.status === 'late'
  ).length;
  
  const lateDays = attendanceRecords.filter(record => 
    record.status === 'late'
  ).length;
  
  // Calculate total hours worked and overtime
  let totalHoursWorked = 0;
  let overtimeHours = 0;
  const standardHoursPerDay = 8;
  
  attendanceRecords.forEach(record => {
    totalHoursWorked += record.totalHours;
    const dailyOvertime = Math.max(0, record.totalHours - standardHoursPerDay);
    overtimeHours += dailyOvertime;
  });
  
  // Calculate absent days (working days - attended days - paid leave days)
  const absentDays = Math.max(0, workingDays - attendedDays - paidLeaveDays);
  
  return {
    workingDays,
    attendedDays: attendedDays + paidLeaveDays, // Include paid leave as attended
    absentDays,
    paidLeaveDays,
    unpaidLeaveDays,
    totalHoursWorked,
    overtimeHours,
    lateDays
  };
};

/**
 * Calculate late deductions
 * Deduct a certain amount for each late day
 */
export const calculateLateDeductions = (
  lateDays: number,
  basicSalary: number,
  workingDays: number
): number => {
  // Deduct half day salary for every 3 late days
  const lateDeductionFactor = Math.floor(lateDays / 3);
  const dailyRate = basicSalary / workingDays;
  return lateDeductionFactor * (dailyRate * 0.5);
};

/**
 * Calculate overtime pay
 */
export const calculateOvertime = (
  overtimeHours: number,
  basicSalary: number,
  workingDays: number,
  overtimeRate: number = 1.5
): number => {
  const standardHoursPerDay = 8;
  const hourlyRate = basicSalary / (workingDays * standardHoursPerDay);
  return overtimeHours * hourlyRate * overtimeRate;
};

/**
 * Calculate tax based on gross salary
 */
export const calculateTax = (grossSalary: number, taxRate: number): number => {
  return (grossSalary * taxRate) / 100;
};

/**
 * Calculate social insurance
 */
export const calculateSocialInsurance = (
  basicSalary: number,
  socialInsuranceRate: number
): number => {
  return (basicSalary * socialInsuranceRate) / 100;
};

/**
 * Calculate health insurance
 */
export const calculateHealthInsurance = (
  basicSalary: number,
  healthInsuranceRate: number
): number => {
  return (basicSalary * healthInsuranceRate) / 100;
};

/**
 * Calculate unpaid leave deductions
 */
export const calculateUnpaidLeaveDeduction = (
  unpaidLeaveDays: number,
  basicSalary: number,
  workingDays: number
): number => {
  const dailyRate = basicSalary / workingDays;
  return unpaidLeaveDays * dailyRate;
};

/**
 * Calculate complete salary for an employee
 */
export const calculateEmployeeSalary = async (
  employeeId: mongoose.Types.ObjectId,
  month: number,
  year: number,
  bonuses: {
    performance?: number;
    project?: number;
    other?: number;
  } = {}
): Promise<SalaryCalculation> => {
  // Get employee data
  const employee = await User.findById(employeeId);
  if (!employee || !employee.salaryInfo) {
    throw new Error('Employee or salary information not found');
  }
  
  const { salaryInfo } = employee;
  
  // Get attendance data
  const attendanceData = await calculateAttendance(employeeId, month, year);
  
  // Calculate components
  const basicSalary = salaryInfo.basicSalary;
  const allowances = salaryInfo.allowances;
  
  // Calculate deductions for late days
  const lateDeductions = calculateLateDeductions(
    attendanceData.lateDays,
    basicSalary,
    attendanceData.workingDays
  );
  
  // Calculate overtime pay
  const overtimePay = calculateOvertime(
    attendanceData.overtimeHours,
    basicSalary,
    attendanceData.workingDays,
    salaryInfo.overtimeRate
  );
  
  // Calculate unpaid leave deduction
  const unpaidLeaveDeduction = calculateUnpaidLeaveDeduction(
    attendanceData.unpaidLeaveDays,
    basicSalary,
    attendanceData.workingDays
  );
  
  // Calculate total allowances
  const totalAllowances = 
    allowances.transportation +
    allowances.housing +
    allowances.food +
    allowances.mobile +
    allowances.other;
  
  // Calculate total bonuses
  const totalBonuses = 
    (bonuses.performance || 0) +
    (bonuses.project || 0) +
    (bonuses.other || 0);
  
  // Calculate salary based on attendance
  // Start with full basic salary and deduct only for unpaid absences
  const dailyRate = basicSalary / attendanceData.workingDays;
  
  // Deduct only for actual absent days (not covered by paid leave)
  const absentDaysDeduction = dailyRate * attendanceData.absentDays;
  const attendanceBasedSalary = basicSalary - absentDaysDeduction;
  
  // Calculate gross salary
  const grossSalary = attendanceBasedSalary + totalAllowances + totalBonuses + overtimePay;
  
  // Calculate deductions
  const tax = calculateTax(grossSalary, salaryInfo.taxRate);
  const socialInsurance = calculateSocialInsurance(basicSalary, salaryInfo.socialInsuranceRate);
  const healthInsurance = calculateHealthInsurance(basicSalary, salaryInfo.healthInsuranceRate);
  
  const deductions = {
    tax,
    socialInsurance,
    healthInsurance,
    unpaidLeave: unpaidLeaveDeduction,
    other: lateDeductions
  };
  
  const totalDeductions = 
    tax +
    socialInsurance +
    healthInsurance +
    unpaidLeaveDeduction +
    lateDeductions;
  
  // Calculate net salary
  const netSalary = grossSalary - totalDeductions;
  
  return {
    basicSalary,
    allowances,
    workingDays: attendanceData.workingDays,
    attendedDays: attendanceData.attendedDays,
    absentDays: attendanceData.absentDays,
    lateDeductions,
    overtimeHours: attendanceData.overtimeHours,
    overtimePay,
    deductions,
    grossSalary,
    totalDeductions,
    netSalary
  };
};

