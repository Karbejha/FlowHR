import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import { getEmployeeDemographics } from '../controllers/reportController';

const router = express.Router();

// Only allow admin users to access the reports
router.get('/demographics', authenticate, authorize(UserRole.ADMIN), getEmployeeDemographics);

export default router;
