import mongoose, { Document, Schema } from 'mongoose';
import { User } from './User';

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  CASUAL = 'casual',
  UNPAID = 'unpaid',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  OTHER = 'other'
}

interface ILeave extends Document {
  employee: mongoose.Types.ObjectId;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
  totalDays: number;
  // Hourly leave fields
  isHourlyLeave: boolean;
  startTime?: string; // Format: "HH:mm"
  endTime?: string; // Format: "HH:mm"
  totalHours?: number;
  approvedBy?: mongoose.Types.ObjectId;
  approvalDate?: Date;
  approvalNotes?: string;
  calculateTotalDays(): number;
  validateLeaveBalance(): Promise<boolean>;
}

// Working hours per day constant (can be made configurable later)
const WORKING_HOURS_PER_DAY = 8;

const leaveSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  leaveType: {
    type: String,
    enum: Object.values(LeaveType),
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(LeaveStatus),
    default: LeaveStatus.PENDING,
  },
  totalDays: {
    type: Number,
    required: true,
  },
  // Hourly leave fields
  isHourlyLeave: {
    type: Boolean,
    default: false,
  },
  startTime: {
    type: String, // Format: "HH:mm"
    required: function(this: ILeave) {
      return this.isHourlyLeave;
    },
  },
  endTime: {
    type: String, // Format: "HH:mm"
    required: function(this: ILeave) {
      return this.isHourlyLeave;
    },
  },
  totalHours: {
    type: Number,
    required: function(this: ILeave) {
      return this.isHourlyLeave;
    },
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvalDate: Date,
  approvalNotes: String,
}, {
  timestamps: true,
});

leaveSchema.methods.calculateTotalDays = function(): number {
  // For hourly leave, calculate based on hours
  if (this.isHourlyLeave && this.startTime && this.endTime) {
    const [startHour, startMin] = this.startTime.split(':').map(Number);
    const [endHour, endMin] = this.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    const totalMinutes = endMinutes - startMinutes;
    const totalHours = totalMinutes / 60;
    
    this.totalHours = Math.round(totalHours * 100) / 100; // Round to 2 decimal places
    // Convert hours to days (8 hours = 1 day)
    this.totalDays = Math.round((totalHours / WORKING_HOURS_PER_DAY) * 100) / 100;
    return this.totalDays;
  }
  
  // For full-day leave, calculate based on dates
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  this.totalDays = diffDays;
  return diffDays;
};

leaveSchema.methods.validateLeaveBalance = async function(): Promise<boolean> {
  const user = await User.findById(this.employee);
  if (!user) return false;

  // Initialize leave balance if not set
  if (!user.leaveBalance) {
    user.leaveBalance = {
      annual: 20,
      sick: 10,
      casual: 5,
      unpaid: 5,
      maternity: 0,
      paternity: 0,
      other: 0
    };
    await user.save();
  }

  const balanceType = this.leaveType.toLowerCase() as keyof typeof user.leaveBalance;
  const currentBalance = user.leaveBalance[balanceType] || 0;
  return currentBalance >= this.totalDays;
};

leaveSchema.pre('save', async function(next) {
  const leave = this as unknown as ILeave;

  if (leave.isNew || leave.isModified('startDate') || leave.isModified('endDate')) {
    leave.calculateTotalDays();
  }
  
  if (leave.isNew || leave.isModified('status')) {
    if (leave.status === LeaveStatus.APPROVED) {
      const hasBalance = await leave.validateLeaveBalance();
      if (!hasBalance) {
        throw new Error('Insufficient leave balance');
      }
    }
  }
  next();
});

export const Leave = mongoose.model<ILeave>('Leave', leaveSchema);