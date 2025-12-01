import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  // Onboarding
  createOnboarding,
  getOnboardings,
  getMyOnboarding,
  getOnboardingById,
  updateOnboardingTask,
  addOnboardingTask,
  updateOnboardingDocuments,
  updateOnboardingEquipment,
  updateOnboardingAccess,
  updateOnboardingTraining,
  submitOnboardingFeedback,
  completeOnboarding,
  // Offboarding
  createOffboarding,
  getOffboardings,
  getOffboardingById,
  updateOffboardingTask,
  scheduleExitInterview,
  submitExitInterview,
  updateClearance,
  updateEquipmentReturn,
  revokeAccess,
  calculateFinalSettlement,
  completeOffboarding,
  // Analytics
  getOnboardingAnalytics,
  getOffboardingAnalytics,
  // Templates
  getOnboardingTaskTemplates,
  getOffboardingTaskTemplates,
} from '../controllers/onboardingController';

const router = express.Router();

// Convert async handler to express middleware
const asyncMiddleware = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler => 
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ==================== TEMPLATES ====================
router.get('/templates/onboarding', authenticate, asyncMiddleware(getOnboardingTaskTemplates));
router.get('/templates/offboarding', authenticate, asyncMiddleware(getOffboardingTaskTemplates));

// ==================== ANALYTICS ====================
router.get('/analytics/onboarding', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(getOnboardingAnalytics));
router.get('/analytics/offboarding', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(getOffboardingAnalytics));

// ==================== ONBOARDING ====================
router.post('/onboarding', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(createOnboarding));
router.get('/onboarding', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(getOnboardings));
router.get('/onboarding/my', authenticate, asyncMiddleware(getMyOnboarding));
router.get('/my-onboarding', authenticate, asyncMiddleware(getMyOnboarding)); // Alias for frontend
router.get('/onboarding/:onboardingId', authenticate, asyncMiddleware(getOnboardingById));
router.put('/onboarding/:onboardingId/tasks/:taskId', authenticate, asyncMiddleware(updateOnboardingTask));
router.put('/task/:taskId', authenticate, asyncMiddleware(updateOnboardingTask)); // Alias for frontend
router.post('/onboarding/:onboardingId/tasks', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(addOnboardingTask));
router.put('/onboarding/:onboardingId/documents', authenticate, asyncMiddleware(updateOnboardingDocuments));
router.put('/onboarding/:onboardingId/equipment', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(updateOnboardingEquipment));
router.put('/onboarding/:onboardingId/access', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(updateOnboardingAccess));
router.put('/onboarding/:onboardingId/training', authenticate, asyncMiddleware(updateOnboardingTraining));
router.post('/onboarding/:onboardingId/feedback', authenticate, asyncMiddleware(submitOnboardingFeedback));
router.post('/onboarding/:onboardingId/complete', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(completeOnboarding));

// ==================== OFFBOARDING ====================
router.post('/offboarding', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(createOffboarding));
router.get('/offboarding', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(getOffboardings));
router.get('/offboarding/:offboardingId', authenticate, asyncMiddleware(getOffboardingById));
router.put('/offboarding/:offboardingId/tasks/:taskId', authenticate, asyncMiddleware(updateOffboardingTask));
router.post('/offboarding/:offboardingId/exit-interview/schedule', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(scheduleExitInterview));
router.post('/offboarding/:offboardingId/exit-interview/submit', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(submitExitInterview));
router.put('/offboarding/:offboardingId/clearance', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(updateClearance));
router.put('/offboarding/:offboardingId/equipment', authenticate, asyncMiddleware(updateEquipmentReturn));
router.put('/offboarding/:offboardingId/access', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(revokeAccess));
router.post('/offboarding/:offboardingId/settlement', authenticate, authorize(UserRole.ADMIN), asyncMiddleware(calculateFinalSettlement));
router.post('/offboarding/:offboardingId/complete', authenticate, authorize(UserRole.ADMIN), asyncMiddleware(completeOffboarding));

export default router;
