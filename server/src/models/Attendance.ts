import mongoose, { Document, Schema } from 'mongoose';

export interface AttendanceRecord {
  _id: mongoose.Types.ObjectId;
  clockIn: Date;
  clockOut?: Date;
  duration?: number;
  notes?: string;
}

interface IAttendance extends Document {
  employee: mongoose.Types.ObjectId;
  date: Date;
  records: mongoose.Types.DocumentArray<AttendanceRecord>;
  totalHours: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
  calculateDuration(recordId: string): number;
  calculateTotalHours(): number;
  updateStatus(): void;
}

const attendanceSchema = new Schema<IAttendance>({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  records: [{
    clockIn: {
      type: Date,
      required: true
    },
    clockOut: {
      type: Date
    },
    duration: {
      type: Number
    },
    notes: {
      type: String
    }
  }],
  totalHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day'],
    default: 'present'
  }
}, {
  timestamps: true
});

attendanceSchema.methods.calculateDuration = function(this: IAttendance, recordId: string): number {
  const record = this.records.id(recordId);
  if (record && record.clockIn && record.clockOut) {
    const duration = Math.round((record.clockOut.getTime() - record.clockIn.getTime()) / 1000 / 60);
    record.duration = duration;
    return duration;
  }
  return 0;
};

attendanceSchema.methods.calculateTotalHours = function(this: IAttendance): number {
  const totalMinutes = this.records.reduce((total: number, record: AttendanceRecord) => {
    if (record.duration) {
      return total + record.duration;
    }
    return total;
  }, 0);
  
  this.totalHours = Math.round((totalMinutes / 60) * 100) / 100;
  return this.totalHours;
};

attendanceSchema.methods.updateStatus = function(this: IAttendance): void {
  const firstRecord = this.records[0];
  if (!firstRecord) {
    this.status = 'absent';
    return;
  }

  const workStartHour = 9; // assuming 9 AM is start time
  const clockInHour = firstRecord.clockIn.getHours();
  const totalHours = this.totalHours;

  if (clockInHour > workStartHour + 1) {
    this.status = 'late';
  } else if (totalHours < 4) {
    this.status = 'absent';
  } else if (totalHours < 6) {
    this.status = 'half-day';
  } else {
    this.status = 'present';
  }
};

attendanceSchema.pre('save', function(this: IAttendance & Document, next) {
  if (this.isModified('records')) {
    this.calculateTotalHours();
    this.updateStatus();
  }
  next();
});

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);