import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  submitLeaveRequest,
  getMyLeaveRequests,
  getPendingLeaveRequests,
  updateLeaveStatus,
  cancelLeaveRequest,
  getLeaveBalance
} from '../controllers/leaveController';

const router = express.Router();

// Convert async handler to express middleware
const asyncMiddleware = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler => 
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Employee routes
router.get('/balance', authenticate, asyncMiddleware(getLeaveBalance));
router.post('/request', authenticate, asyncMiddleware(submitLeaveRequest));
router.get('/my-requests', authenticate, asyncMiddleware(getMyLeaveRequests));
router.post('/:leaveId/cancel', authenticate, asyncMiddleware(cancelLeaveRequest));

// Manager/Admin routes
router.get(
  '/pending',
  authenticate,
  authorize(UserRole.MANAGER, UserRole.ADMIN),
  asyncMiddleware(getPendingLeaveRequests)
);

router.post(
  '/:leaveId/status',
  authenticate,
  authorize(UserRole.MANAGER, UserRole.ADMIN),
  asyncMiddleware(updateLeaveStatus)
);

export default router;