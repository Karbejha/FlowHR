import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  toggleScheduleStatus,
  getDueSchedules,
  testEmailSending
} from '../controllers/scheduleController';

const router = express.Router();

// All schedule routes require admin access
router.use(authenticate, authorize(UserRole.ADMIN));

// Get all schedules
router.get('/', getSchedules);

// Get due schedules (for cron job)
router.get('/due', getDueSchedules);

// Get a single schedule
router.get('/:id', getScheduleById);

// Create a new schedule
router.post('/', createSchedule);

// Update a schedule
router.put('/:id', updateSchedule);

// Delete a schedule
router.delete('/:id', deleteSchedule);

// Toggle schedule status
router.patch('/:id/toggle', toggleScheduleStatus);

// Test email sending
router.post('/test-email', testEmailSending);

export default router;

