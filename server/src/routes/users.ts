import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { avatarUpload } from '../middleware/upload';
import { userActionLogger } from '../middleware/errorHandler';
import { UserRole } from '../models/User';
import { 
  getEmployees, 
  getTeamMembers,
  getManagers,
  updateEmployeeStatus, 
  createUser,
  updateProfile,  changePassword,
  adminChangePassword,
  updateUser,
  deleteUser,
  uploadAvatar,
  deleteAvatar,
  getUsersByBirthMonth
} from '../controllers/userController';

const router = express.Router();

// Define the birthdays route first to ensure it takes precedence
router.get('/birthdays/:month', authenticate, getUsersByBirthMonth);

router.get('/employees', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), getEmployees);
router.get('/team-members', authenticate, getTeamMembers);
router.get('/managers', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), getManagers);
router.patch('/:userId/status', authenticate, authorize(UserRole.ADMIN), updateEmployeeStatus);
router.post('/create', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), createUser);
router.put('/update/:id', authenticate, authorize(UserRole.ADMIN), updateUser);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteUser);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.put('/admin-change-password/:id', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), adminChangePassword);
router.post('/upload-avatar', authenticate, avatarUpload.single('avatar'), uploadAvatar);
router.delete('/avatar', authenticate, deleteAvatar);
router.post('/:id/avatar', authenticate, avatarUpload.single('avatar'), uploadAvatar);
router.delete('/:id/avatar', authenticate, deleteAvatar);
// Ensure the birthdays route is defined before any routes with id parameters
router.get('/birthdays/:month', authenticate, getUsersByBirthMonth);

export default router;
