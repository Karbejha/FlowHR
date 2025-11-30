import mongoose, { Document, Schema } from 'mongoose';

export enum PayrollStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid'
}

interface Allowances {
  transportation: number;
  housing: number;
  food: number;
  mobile: number;
  other: number;
}

interface Bonuses {
  performance: number;
  project: number;
  other: number;
}

interface Deductions {
  tax: number;
  socialInsurance: number;
  healthInsurance: number;
  unpaidLeave: number;
  other: number;
}

export interface IPayroll extends Document {
  employee: mongoose.Types.ObjectId;
  month: number; // 1-12
  year: number;
  
  // Salary Components
  basicSalary: number;
  allowances: Allowances;
  
  // Attendance-based calculations
  workingDays: number;
  attendedDays: number;
  absentDays: number;
  lateDeductions: number;
  
  // Bonuses and Overtime
  bonuses: Bonuses;
  overtimeHours: number;
  overtimePay: number;
  
  // Deductions
  deductions: Deductions;
  
  // Calculated fields
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  
  status: PayrollStatus;
  paymentDate?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvalDate?: Date;
  notes?: string;
  
  // Methods
  calculateGrossSalary(): number;
  calculateTotalDeductions(): number;
  calculateNetSalary(): number;
}

const payrollSchema = new Schema<IPayroll>({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  basicSalary: {
    type: Number,
    required: true,
    min: 0
  },
  allowances: {
    transportation: {
      type: Number,
      default: 0,
      min: 0
    },
    housing: {
      type: Number,
      default: 0,
      min: 0
    },
    food: {
      type: Number,
      default: 0,
      min: 0
    },
    mobile: {
      type: Number,
      default: 0,
      min: 0
    },
    other: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  workingDays: {
    type: Number,
    required: true,
    min: 0
  },
  attendedDays: {
    type: Number,
    required: true,
    min: 0
  },
  absentDays: {
    type: Number,
    default: 0,
    min: 0
  },
  lateDeductions: {
    type: Number,
    default: 0,
    min: 0
  },
  bonuses: {
    performance: {
      type: Number,
      default: 0,
      min: 0
    },
    project: {
      type: Number,
      default: 0,
      min: 0
    },
    other: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  overtimeHours: {
    type: Number,
    default: 0,
    min: 0
  },
  overtimePay: {
    type: Number,
    default: 0,
    min: 0
  },
  deductions: {
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    socialInsurance: {
      type: Number,
      default: 0,
      min: 0
    },
    healthInsurance: {
      type: Number,
      default: 0,
      min: 0
    },
    unpaidLeave: {
      type: Number,
      default: 0,
      min: 0
    },
    other: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  grossSalary: {
    type: Number,
    required: true,
    min: 0
  },
  totalDeductions: {
    type: Number,
    required: true,
    min: 0
  },
  netSalary: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: Object.values(PayrollStatus),
    default: PayrollStatus.DRAFT
  },
  paymentDate: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
payrollSchema.index({ employee: 1, month: 1, year: 1 });
payrollSchema.index({ status: 1 });
payrollSchema.index({ month: 1, year: 1 });

// Calculate gross salary
payrollSchema.methods.calculateGrossSalary = function(this: IPayroll): number {
  const totalAllowances = 
    this.allowances.transportation +
    this.allowances.housing +
    this.allowances.food +
    this.allowances.mobile +
    this.allowances.other;
  
  const totalBonuses = 
    this.bonuses.performance +
    this.bonuses.project +
    this.bonuses.other;
  
  // Calculate salary based on attendance (basic salary proportional to attended days)
  const dailyRate = this.basicSalary / this.workingDays;
  const attendanceBasedSalary = dailyRate * this.attendedDays;
  
  this.grossSalary = attendanceBasedSalary + totalAllowances + totalBonuses + this.overtimePay;
  return this.grossSalary;
};

// Calculate total deductions
payrollSchema.methods.calculateTotalDeductions = function(this: IPayroll): number {
  this.totalDeductions = 
    this.deductions.tax +
    this.deductions.socialInsurance +
    this.deductions.healthInsurance +
    this.deductions.unpaidLeave +
    this.deductions.other +
    this.lateDeductions;
  
  return this.totalDeductions;
};

// Calculate net salary
payrollSchema.methods.calculateNetSalary = function(this: IPayroll): number {
  this.calculateGrossSalary();
  this.calculateTotalDeductions();
  this.netSalary = this.grossSalary - this.totalDeductions;
  return this.netSalary;
};

// Auto-calculate before saving
payrollSchema.pre('save', function(this: IPayroll, next) {
  if (this.isModified('basicSalary') || 
      this.isModified('allowances') || 
      this.isModified('bonuses') || 
      this.isModified('deductions') ||
      this.isModified('overtimePay') ||
      this.isModified('lateDeductions') ||
      this.isModified('attendedDays') ||
      this.isModified('workingDays')) {
    this.calculateNetSalary();
  }
  next();
});

export const Payroll = mongoose.model<IPayroll>('Payroll', payrollSchema);

