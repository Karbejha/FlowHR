import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  generatePayroll,
  generateBulkPayroll,
  getPayrollByEmployee,
  getAllPayrolls,
  getPayrollById,
  updatePayroll,
  approvePayroll,
  markAsPaid,
  deletePayroll,
  generatePayrollReport,
  getMyPayslips
} from '../controllers/payrollController';

const router = express.Router();

// Employee routes - get own payslips
router.get('/my-payslips', authenticate, getMyPayslips);

// Generate payroll routes
router.post('/generate', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), generatePayroll);
router.post('/generate/bulk', authenticate, authorize(UserRole.ADMIN), generateBulkPayroll);

// Get payroll routes
router.get('/employee/:employeeId', authenticate, getPayrollByEmployee);
router.get('/report/:month/:year', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), generatePayrollReport);
router.get('/:payrollId', authenticate, getPayrollById);
router.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), getAllPayrolls);

// Update payroll routes
router.put('/:payrollId', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), updatePayroll);
router.patch('/:payrollId/approve', authenticate, authorize(UserRole.ADMIN, UserRole.MANAGER), approvePayroll);
router.patch('/:payrollId/paid', authenticate, authorize(UserRole.ADMIN), markAsPaid);

// Delete payroll route
router.delete('/:payrollId', authenticate, authorize(UserRole.ADMIN), deletePayroll);

export default router;

