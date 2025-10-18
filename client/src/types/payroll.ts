export interface Allowances {
  transportation: number;
  housing: number;
  food: number;
  mobile: number;
  other: number;
}

export interface Bonuses {
  performance: number;
  project: number;
  other: number;
}

export interface Deductions {
  tax: number;
  socialInsurance: number;
  healthInsurance: number;
  unpaidLeave: number;
  other: number;
}

export enum PayrollStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid'
}

export interface SalaryInfo {
  basicSalary: number;
  allowances: Allowances;
  taxRate: number;
  socialInsuranceRate: number;
  healthInsuranceRate: number;
  overtimeRate: number;
}

export interface Payroll {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    jobTitle: string;
  };
  month: number;
  year: number;
  basicSalary: number;
  allowances: Allowances;
  workingDays: number;
  attendedDays: number;
  absentDays: number;
  lateDeductions: number;
  bonuses: Bonuses;
  overtimeHours: number;
  overtimePay: number;
  deductions: Deductions;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: PayrollStatus;
  paymentDate?: string;
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  approvalDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollSummary {
  totalEmployees: number;
  totalGrossSalary: number;
  totalDeductions: number;
  totalNetSalary: number;
  totalOvertimePay: number;
  totalBonuses: number;
  byDepartment: Record<string, {
    count: number;
    totalGrossSalary: number;
    totalNetSalary: number;
    averageSalary: number;
  }>;
  byStatus: {
    draft: number;
    pending: number;
    approved: number;
    paid: number;
  };
  averageSalary: number;
  workingDays: number;
}

export interface PayrollReport {
  month: number;
  year: number;
  summary: PayrollSummary;
  payrolls: Payroll[];
}

export interface GeneratePayrollRequest {
  employeeId: string;
  month: number;
  year: number;
  bonuses?: {
    performance?: number;
    project?: number;
    other?: number;
  };
  notes?: string;
}

export interface BulkPayrollRequest {
  month: number;
  year: number;
}

export interface UpdatePayrollRequest {
  bonuses?: Bonuses;
  deductions?: Partial<Deductions>;
  notes?: string;
  lateDeductions?: number;
  overtimeHours?: number;
  overtimePay?: number;
}

