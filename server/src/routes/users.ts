import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import { 
  getEmployees, 
  updateEmployeeStatus, 
  createUser,
  updateProfile,
  changePassword
} from '../controllers/userController';

const router = express.Router();

router.get('/employees', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), getEmployees);
router.patch('/:userId/status', authenticate, authorize(UserRole.ADMIN), updateEmployeeStatus);
router.post('/create', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), createUser);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;
