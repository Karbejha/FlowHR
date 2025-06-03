import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import { 
  getEmployees, 
  getManagers,
  updateEmployeeStatus, 
  createUser,
  updateProfile,
  changePassword,
  adminChangePassword,
  updateUser,
  deleteUser
} from '../controllers/userController';

const router = express.Router();

router.get('/employees', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), getEmployees);
router.get('/managers', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), getManagers);
router.patch('/:userId/status', authenticate, authorize(UserRole.ADMIN), updateEmployeeStatus);
router.post('/create', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), createUser);
router.put('/update/:id', authenticate, authorize(UserRole.ADMIN), updateUser);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteUser);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.put('/admin-change-password/:id', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), adminChangePassword);

export default router;
