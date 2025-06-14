import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import { 
  getEmployeeDemographics,
  getTimeAndAttendanceReport,
  getLeaveUsageReport,
  getResourceAllocationReport
} from '../controllers/reportController';

const router = express.Router();

// Only allow admin users to access these reports
router.get('/demographics', authenticate, authorize(UserRole.ADMIN), getEmployeeDemographics);
router.get('/attendance', authenticate, authorize(UserRole.ADMIN), getTimeAndAttendanceReport);
router.get('/leave-usage', authenticate, authorize(UserRole.ADMIN), getLeaveUsageReport);
router.get('/resource-allocation', authenticate, authorize(UserRole.ADMIN), getResourceAllocationReport);

export default router;
