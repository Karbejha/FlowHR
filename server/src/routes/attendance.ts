import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  clockIn,
  clockOut,
  getMyAttendance,
  getTeamAttendance,
  updateAttendance
} from '../controllers/attendanceController';

const router = express.Router();

const asyncMiddleware = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler => 
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Employee routes
router.post('/clock-in', authenticate, asyncMiddleware(clockIn));
router.post('/clock-out', authenticate, asyncMiddleware(clockOut));
router.get('/my-records', authenticate, asyncMiddleware(getMyAttendance));

// Manager/Admin routes
router.get(
  '/team',
  authenticate,
  authorize(UserRole.MANAGER, UserRole.ADMIN),
  asyncMiddleware(getTeamAttendance)
);

router.patch(
  '/:attendanceId',
  authenticate,
  authorize(UserRole.MANAGER, UserRole.ADMIN),
  asyncMiddleware(updateAttendance)
);

export default router;