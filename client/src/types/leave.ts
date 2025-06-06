import { User } from './auth';

export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  CASUAL = 'casual',
  UNPAID = 'unpaid',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  OTHER = 'other'
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export interface Leave {
  _id: string;
  employee: User;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  approvedBy?: User;
  approvalDate?: string;
  approvalNotes?: string;
  totalDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequest {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveStatusUpdate {
  status: LeaveStatus;
  approvalNotes?: string;
}

export interface LeaveFilters {
  employee: string;
  leaveType: string;
  status: string;
  startDate: string;
  endDate: string;
}