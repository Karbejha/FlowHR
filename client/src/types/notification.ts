export enum NotificationType {
  LEAVE_REQUEST = 'LEAVE_REQUEST',
  LEAVE_APPROVED = 'LEAVE_APPROVED',
  LEAVE_REJECTED = 'LEAVE_REJECTED',
  ATTENDANCE_REMINDER = 'ATTENDANCE_REMINDER',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE',
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSummary {
  notifications: Notification[];
  unread: number;
  total: number;
}
