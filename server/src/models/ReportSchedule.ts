import mongoose, { Document, Schema } from 'mongoose';

export enum ScheduleFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export enum ReportType {
  DEMOGRAPHICS = 'demographics',
  ATTENDANCE = 'attendance',
  LEAVE_USAGE = 'leave-usage',
  RESOURCE_ALLOCATION = 'resource-allocation',
  PAYROLL = 'payroll',
  FINANCIAL_COMPREHENSIVE = 'financial-comprehensive',
  TAX_DEDUCTIONS = 'tax-deductions',
  EXPENSE_COMPARISON = 'expense-comparison'
}

export interface IReportSchedule extends Document {
  reportType: ReportType;
  reportName: string;
  frequency: ScheduleFrequency;
  sendTime: string; // Format: "HH:MM" (24-hour format)
  recipients: string[]; // Array of email addresses
  filters?: Record<string, unknown>;
  active: boolean;
  createdBy: mongoose.Types.ObjectId;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;
  calculateNextRun(): Date;
}

const reportScheduleSchema = new Schema<IReportSchedule>({
  reportType: {
    type: String,
    enum: Object.values(ReportType),
    required: true
  },
  reportName: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    enum: Object.values(ScheduleFrequency),
    required: true
  },
  sendTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: 'sendTime must be in HH:MM format (24-hour)'
    }
  },
  recipients: {
    type: [String],
    required: true,
    validate: {
      validator: function(v: string[]) {
        return v.length > 0 && v.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      },
      message: 'Recipients must contain at least one valid email address'
    }
  },
  filters: {
    type: Schema.Types.Mixed,
    default: {}
  },
  active: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastRun: {
    type: Date
  },
  nextRun: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
reportScheduleSchema.index({ active: 1, nextRun: 1 });
reportScheduleSchema.index({ createdBy: 1 });

// Method to calculate next run time
reportScheduleSchema.methods.calculateNextRun = function(this: IReportSchedule): Date {
  const now = new Date();
  const [hours, minutes] = this.sendTime.split(':').map(Number);
  
  let nextRun = new Date(now);
  nextRun.setHours(hours, minutes, 0, 0);
  
  // If the time has already passed today, move to next period
  if (nextRun <= now) {
    switch (this.frequency) {
      case ScheduleFrequency.DAILY:
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case ScheduleFrequency.WEEKLY:
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case ScheduleFrequency.MONTHLY:
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
    }
  }
  
  return nextRun;
};

// Auto-calculate nextRun before saving
reportScheduleSchema.pre('save', function(this: IReportSchedule, next) {
  if (this.isNew || this.isModified('sendTime') || this.isModified('frequency')) {
    this.nextRun = this.calculateNextRun();
  }
  next();
});

export const ReportSchedule = mongoose.model<IReportSchedule>('ReportSchedule', reportScheduleSchema);

