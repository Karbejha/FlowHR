import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import { getEmployees, updateEmployeeStatus } from '../controllers/userController';

const router = express.Router();

router.get('/employees', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), getEmployees);
router.patch('/:userId/status', authenticate, authorize(UserRole.ADMIN), updateEmployeeStatus);

export default router;
