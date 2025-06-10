import mongoose, { Schema, Document } from 'mongoose';

export enum NotificationType {
  LEAVE_REQUEST = 'LEAVE_REQUEST',
  LEAVE_APPROVED = 'LEAVE_APPROVED',
  LEAVE_REJECTED = 'LEAVE_REJECTED',
  ATTENDANCE_REMINDER = 'ATTENDANCE_REMINDER',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE',
}

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: true,
    index: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  actionUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
