import express from 'express';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/notifications - Get user's notifications
router.get('/', getNotifications as express.RequestHandler);

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', markAsRead as express.RequestHandler);

// PATCH /api/notifications/mark-all-read - Mark all notifications as read
router.patch('/mark-all-read', markAllAsRead as express.RequestHandler);

// DELETE /api/notifications/:id - Delete a notification
router.delete('/:id', deleteNotification as express.RequestHandler);

export default router;
