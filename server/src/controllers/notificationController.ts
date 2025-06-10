import { Request, Response } from 'express';
import Notification, { NotificationType } from '../models/Notification';
import { logError } from '../utils/logger';

// Define AuthenticatedRequest interface
interface AuthenticatedRequest extends Request {
  user?: any;
}

// Get notifications for the authenticated user
export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get notifications for the user
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get unread count
    const unreadCount = await Notification.countDocuments({ 
      userId, 
      isRead: false 
    });

    // Get total count
    const totalCount = await Notification.countDocuments({ userId });

    res.json({
      notifications,
      unread: unreadCount,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    });  } catch (error) {
    logError('Error fetching notifications', {
      userId: req.user?.id,
      error: error instanceof Error ? error.message : error
    });
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// Mark a notification as read
export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    logError('Error marking notification as read', {
      userId: req.user?.id,
      notificationId: req.params.id,
      error: error instanceof Error ? error.message : error
    });
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    logError('Error marking all notifications as read', {
      userId: req.user?.id,
      error: error instanceof Error ? error.message : error
    });
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
};

// Delete a notification
export const deleteNotification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    logError('Error deleting notification', {
      userId: req.user?.id,
      notificationId: req.params.id,
      error: error instanceof Error ? error.message : error
    });
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};

// Create a notification (for internal use)
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  actionUrl?: string
) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      actionUrl
    });    await notification.save();
    return notification;
  } catch (error) {
    logError('Error creating notification', {
      userId,
      type,
      error: error instanceof Error ? error.message : error
    });
    throw error;
  }
};

// Helper function to create leave request notification
export const createLeaveRequestNotification = async (
  managerId: string,
  employeeName: string,
  leaveType: string,
  startDate: string,
  endDate: string
) => {
  return createNotification(
    managerId,
    'New Leave Request',
    `${employeeName} has submitted a ${leaveType} request from ${startDate} to ${endDate}`,
    NotificationType.LEAVE_REQUEST,
    '/leave'
  );
};

// Helper function to create leave approval notification
export const createLeaveApprovalNotification = async (
  employeeId: string,
  leaveType: string,
  startDate: string,
  endDate: string
) => {
  return createNotification(
    employeeId,
    'Leave Request Approved',
    `Your ${leaveType} request from ${startDate} to ${endDate} has been approved`,
    NotificationType.LEAVE_APPROVED,
    '/leave'
  );
};

// Helper function to create leave rejection notification
export const createLeaveRejectionNotification = async (
  employeeId: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  reason?: string
) => {
  const message = `Your ${leaveType} request from ${startDate} to ${endDate} has been rejected${reason ? `. Reason: ${reason}` : ''}`;
  return createNotification(
    employeeId,
    'Leave Request Rejected',
    message,
    NotificationType.LEAVE_REJECTED,
    '/leave'
  );
};

// Helper function to create attendance reminder notification
export const createAttendanceReminderNotification = async (
  employeeId: string,
  message: string
) => {
  return createNotification(
    employeeId,
    'Attendance Reminder',
    message,
    NotificationType.ATTENDANCE_REMINDER,
    '/attendance'
  );
};

// Helper function to create system update notification
export const createSystemUpdateNotification = async (
  userIds: string[],
  title: string,
  message: string,
  actionUrl?: string
) => {
  const notifications = userIds.map(userId => 
    createNotification(userId, title, message, NotificationType.SYSTEM_UPDATE, actionUrl)
  );
  
  return Promise.all(notifications);
};
