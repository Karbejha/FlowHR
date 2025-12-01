import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  // Goals
  createGoal,
  getMyGoals,
  getTeamGoals,
  getGoalById,
  updateGoal,
  updateKeyResult,
  approveGoal,
  addGoalComment,
  deleteGoal,
  // Performance Reviews
  createPerformanceReview,
  getMyReviews,
  getTeamReviews,
  getReviewById,
  submitSelfReview,
  submitManagerReview,
  acknowledgeReview,
  calibrateReview,
  startReviewCycle,
  getReviewAnalytics,
  // Feedback
  giveFeedback,
  getMyReceivedFeedback,
  getMyGivenFeedback,
  getPublicRecognitions,
  getAllFeedback,
  respondToFeedback,
  acknowledgeFeedback,
  likeFeedback,
  moderateFeedback,
  getPendingFeedback,
  request360Feedback,
  // Metadata
  getCompetencies,
  getRatingDescriptions,
  getBadgeDefinitions,
} from '../controllers/performanceController';

const router = express.Router();

// Convert async handler to express middleware
const asyncMiddleware = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler => 
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ==================== METADATA ====================
router.get('/competencies', authenticate, asyncMiddleware(getCompetencies));
router.get('/rating-descriptions', authenticate, asyncMiddleware(getRatingDescriptions));
router.get('/badges', authenticate, asyncMiddleware(getBadgeDefinitions));

// ==================== GOALS ====================
router.post('/goals', authenticate, asyncMiddleware(createGoal));
router.get('/goals', authenticate, asyncMiddleware(getMyGoals)); // Default to my goals
router.get('/goals/my', authenticate, asyncMiddleware(getMyGoals));
router.get('/goals/team', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(getTeamGoals));
router.get('/goals/:goalId', authenticate, asyncMiddleware(getGoalById));
router.put('/goals/:goalId', authenticate, asyncMiddleware(updateGoal));
router.put('/goals/:goalId/key-results/:keyResultId', authenticate, asyncMiddleware(updateKeyResult));
router.post('/goals/:goalId/approve', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(approveGoal));
router.post('/goals/:goalId/comments', authenticate, asyncMiddleware(addGoalComment));
router.delete('/goals/:goalId', authenticate, asyncMiddleware(deleteGoal));

// ==================== PERFORMANCE REVIEWS ====================
router.post('/reviews', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(createPerformanceReview));
router.get('/reviews', authenticate, asyncMiddleware(getMyReviews)); // Default to my reviews
router.get('/reviews/my', authenticate, asyncMiddleware(getMyReviews));
router.get('/reviews/my-reviews', authenticate, asyncMiddleware(getMyReviews)); // Alias for frontend
router.get('/reviews/team', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(getTeamReviews));
router.get('/reviews/analytics', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(getReviewAnalytics));
router.get('/reviews/:reviewId', authenticate, asyncMiddleware(getReviewById));
router.post('/reviews/:reviewId/self-review', authenticate, asyncMiddleware(submitSelfReview));
router.post('/reviews/:reviewId/manager-review', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(submitManagerReview));
router.post('/reviews/:reviewId/acknowledge', authenticate, asyncMiddleware(acknowledgeReview));
router.post('/reviews/:reviewId/calibrate', authenticate, authorize(UserRole.ADMIN), asyncMiddleware(calibrateReview));
router.post('/reviews/:reviewId/start', authenticate, authorize(UserRole.ADMIN), asyncMiddleware(startReviewCycle));

// ==================== FEEDBACK ====================
router.post('/feedback', authenticate, asyncMiddleware(giveFeedback));
router.get('/feedback', authenticate, asyncMiddleware(getMyReceivedFeedback)); // Default to received
router.get('/feedback/my-feedback', authenticate, asyncMiddleware(getMyReceivedFeedback)); // Alias for frontend
router.get('/feedback/received', authenticate, asyncMiddleware(getMyReceivedFeedback));
router.get('/feedback/given', authenticate, asyncMiddleware(getMyGivenFeedback));
router.get('/feedback/recognitions', authenticate, asyncMiddleware(getPublicRecognitions));
router.get('/feedback/all', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(getAllFeedback));
router.get('/feedback/pending', authenticate, authorize(UserRole.ADMIN), asyncMiddleware(getPendingFeedback));
router.post('/feedback/:feedbackId/respond', authenticate, asyncMiddleware(respondToFeedback));
router.post('/feedback/:feedbackId/acknowledge', authenticate, asyncMiddleware(acknowledgeFeedback));
router.post('/feedback/:feedbackId/like', authenticate, asyncMiddleware(likeFeedback));
router.post('/feedback/:feedbackId/moderate', authenticate, authorize(UserRole.ADMIN), asyncMiddleware(moderateFeedback));
router.post('/feedback/360-request', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(request360Feedback));

export default router;
