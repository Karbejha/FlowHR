import { User } from './auth';

export interface AttendanceRecord {
  _id: string;
  clockIn: string;
  clockOut?: string;
  duration?: number;
  notes?: string;
}

export interface Attendance {
  _id: string;
  employee: User;
  date: string;
  records: AttendanceRecord[];
  totalHours: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStatusUpdate {
  status: 'present' | 'absent' | 'late' | 'half-day';
  notes?: string;
}

export interface DateRangeQuery {
  startDate: string;
  endDate: string;
}