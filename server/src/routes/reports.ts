import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import { 
  getEmployeeDemographics,
  getTimeAndAttendanceReport,
  getLeaveUsageReport,
  getResourceAllocationReport,
  getComprehensiveFinancialReport,
  getTaxDeductionsReport,
  getExpenseComparisonReport
} from '../controllers/reportController';

const router = express.Router();

// Only allow admin users to access these reports
router.get('/demographics', authenticate, authorize(UserRole.ADMIN), getEmployeeDemographics);
router.get('/attendance', authenticate, authorize(UserRole.ADMIN), getTimeAndAttendanceReport);
router.get('/leave-usage', authenticate, authorize(UserRole.ADMIN), getLeaveUsageReport);
router.get('/resource-allocation', authenticate, authorize(UserRole.ADMIN), getResourceAllocationReport);

// Financial reports
router.get('/financial-comprehensive', authenticate, authorize(UserRole.ADMIN), getComprehensiveFinancialReport);
router.get('/tax-deductions', authenticate, authorize(UserRole.ADMIN), getTaxDeductionsReport);
router.get('/expense-comparison', authenticate, authorize(UserRole.ADMIN), getExpenseComparisonReport);

export default router;
