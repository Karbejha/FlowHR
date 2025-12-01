import { Request, Response } from 'express';
import { Goal, GoalStatus, GoalPriority, GoalCategory } from '../models/Goal';
import { PerformanceReview, ReviewStatus, ReviewType, DEFAULT_COMPETENCIES, RATING_DESCRIPTIONS } from '../models/PerformanceReview';
import { Feedback, FeedbackType, FeedbackCategory, FeedbackVisibility, FeedbackStatus, BADGE_DEFINITIONS } from '../models/Feedback';
import { User, UserRole } from '../models/User';
import { getTeamMembers } from '../utils/userUtils';
import { logError, logInfo } from '../utils/logger';
import { createNotification } from './notificationController';
import Notification, { NotificationType } from '../models/Notification';
import mongoose from 'mongoose';

// ==================== GOALS ====================

export const createGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      category,
      priority,
      startDate,
      dueDate,
      weight,
      keyResults,
      parentGoal,
      alignedWith,
      reviewCycle,
      isPrivate,
      employeeId // For managers creating goals for team members
    } = req.body;

    // Determine the employee for the goal
    let targetEmployeeId = req.user._id;
    
    if (employeeId && (req.user.role === UserRole.MANAGER || req.user.role === UserRole.ADMIN)) {
      // Managers can create goals for their team members
      if (req.user.role === UserRole.MANAGER) {
        const teamMembers = await getTeamMembers(req.user._id);
        const teamMemberIds = teamMembers.map((m: any) => m._id.toString());
        if (!teamMemberIds.includes(employeeId)) {
          res.status(403).json({ error: 'Not authorized to create goals for this employee' });
          return;
        }
      }
      targetEmployeeId = employeeId;
    }

    const goal = new Goal({
      employee: targetEmployeeId,
      title,
      description,
      category: category || GoalCategory.PERFORMANCE,
      priority: priority || GoalPriority.MEDIUM,
      status: GoalStatus.DRAFT,
      startDate: new Date(startDate),
      dueDate: new Date(dueDate),
      weight: weight || 100,
      keyResults: keyResults || [],
      parentGoal,
      alignedWith,
      reviewCycle,
      isPrivate: isPrivate || false,
      createdBy: req.user._id,
    });

    await goal.save();
    await goal.populate('employee', 'firstName lastName email department');
    await goal.populate('createdBy', 'firstName lastName');

    logInfo('Goal created', { goalId: goal._id, employeeId: targetEmployeeId, createdBy: req.user._id });
    res.status(201).json(goal);
  } catch (error) {
    logError('Error creating goal', { error: error instanceof Error ? error.message : error });
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error creating goal' });
  }
};

export const getMyGoals = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, reviewCycle, category } = req.query;
    
    const query: any = { employee: req.user._id };
    if (status) query.status = status;
    if (reviewCycle) query.reviewCycle = reviewCycle;
    if (category) query.category = category;

    const goals = await Goal.find(query)
      .sort({ dueDate: 1, priority: -1 })
      .populate('employee', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching goals' });
  }
};

export const getTeamGoals = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    let employeeIds: mongoose.Types.ObjectId[] = [];

    if (req.user.role === UserRole.MANAGER) {
      const teamMembers = await getTeamMembers(req.user._id);
      employeeIds = teamMembers.map(m => m._id as mongoose.Types.ObjectId);
    } else if (req.user.role === UserRole.ADMIN) {
      // Admin can see all goals
      const allUsers = await User.find({ isActive: true }).select('_id');
      employeeIds = allUsers.map(u => u._id as mongoose.Types.ObjectId);
    }

    const { status, reviewCycle, department } = req.query;
    
    const query: any = { 
      employee: { $in: employeeIds },
      isPrivate: false 
    };
    if (status) query.status = status;
    if (reviewCycle) query.reviewCycle = reviewCycle;

    let goals = await Goal.find(query)
      .sort({ dueDate: 1 })
      .populate('employee', 'firstName lastName department')
      .populate('createdBy', 'firstName lastName');

    // Filter by department if specified
    if (department) {
      goals = goals.filter((g: any) => g.employee?.department === department);
    }

    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching team goals' });
  }
};

export const getGoalById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { goalId } = req.params;
    const goal = await Goal.findById(goalId)
      .populate('employee', 'firstName lastName email department')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .populate('comments.author', 'firstName lastName avatar');

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    // Check access permission
    const isOwner = goal.employee._id.toString() === req.user._id.toString();
    const isCreator = goal.createdBy._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;
    
    let isManager = false;
    if (req.user.role === UserRole.MANAGER) {
      const teamMembers = await getTeamMembers(req.user._id);
      isManager = teamMembers.some((m: any) => m._id.toString() === goal.employee._id.toString());
    }

    if (!isOwner && !isCreator && !isAdmin && !isManager && goal.isPrivate) {
      res.status(403).json({ error: 'Not authorized to view this goal' });
      return;
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching goal' });
  }
};

export const updateGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { goalId } = req.params;
    const updates = req.body;

    const goal = await Goal.findById(goalId);
    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    // Check permission
    const isOwner = goal.employee.toString() === req.user._id.toString();
    const isCreator = goal.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isOwner && !isCreator && !isAdmin) {
      res.status(403).json({ error: 'Not authorized to update this goal' });
      return;
    }

    // Update allowed fields
    const allowedUpdates = [
      'title', 'description', 'category', 'priority', 'status',
      'startDate', 'dueDate', 'weight', 'keyResults', 'isPrivate', 'reviewCycle'
    ];

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        (goal as any)[key] = updates[key];
      }
    }

    await goal.save();
    await goal.populate('employee', 'firstName lastName');

    logInfo('Goal updated', { goalId, updatedBy: req.user._id });
    res.json(goal);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error updating goal' });
  }
};

export const updateKeyResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const { goalId, keyResultId } = req.params;
    const { currentValue, notes } = req.body;

    const goal = await Goal.findById(goalId);
    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    // Check permission
    const isOwner = goal.employee.toString() === req.user._id.toString();
    if (!isOwner && req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized to update this key result' });
      return;
    }

    const keyResult = goal.keyResults.find((kr: any) => kr._id.toString() === keyResultId);
    if (!keyResult) {
      res.status(404).json({ error: 'Key result not found' });
      return;
    }

    if (currentValue !== undefined) {
      keyResult.currentValue = currentValue;
    }

    // Add comment about progress update
    if (notes) {
      goal.comments.push({
        author: req.user._id,
        content: `Key Result "${keyResult.title}" updated: ${notes}`,
        createdAt: new Date(),
      } as any);
    }

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(400).json({ error: 'Error updating key result' });
  }
};

export const approveGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { goalId } = req.params;

    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized to approve goals' });
      return;
    }

    const goal = await Goal.findById(goalId);
    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    // Check if manager is authorized for this employee
    if (req.user.role === UserRole.MANAGER) {
      const teamMembers = await getTeamMembers(req.user._id);
      if (!teamMembers.some((m: any) => m._id.toString() === goal.employee.toString())) {
        res.status(403).json({ error: 'Not authorized to approve goals for this employee' });
        return;
      }
    }

    goal.status = GoalStatus.ACTIVE;
    goal.approvedBy = req.user._id;
    await goal.save();

    res.json(goal);
  } catch (error) {
    res.status(400).json({ error: 'Error approving goal' });
  }
};

export const addGoalComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { goalId } = req.params;
    const { content } = req.body;

    const goal = await Goal.findById(goalId);
    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    goal.comments.push({
      author: req.user._id,
      content,
      createdAt: new Date(),
    } as any);

    await goal.save();
    await goal.populate('comments.author', 'firstName lastName avatar');

    res.json(goal);
  } catch (error) {
    res.status(400).json({ error: 'Error adding comment' });
  }
};

export const deleteGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { goalId } = req.params;
    const goal = await Goal.findById(goalId);

    if (!goal) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    // Only allow deletion of draft goals, or by admin
    if (goal.status !== GoalStatus.DRAFT && req.user.role !== UserRole.ADMIN) {
      res.status(400).json({ error: 'Can only delete draft goals' });
      return;
    }

    const isOwner = goal.employee.toString() === req.user._id.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: 'Not authorized to delete this goal' });
      return;
    }

    await Goal.findByIdAndDelete(goalId);
    logInfo('Goal deleted', { goalId, deletedBy: req.user._id });
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Error deleting goal' });
  }
};

// ==================== PERFORMANCE REVIEWS ====================

export const createPerformanceReview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized to create performance reviews' });
      return;
    }

    const {
      employeeId,
      reviewCycle,
      reviewType,
      periodStart,
      periodEnd,
      selfReviewDueDate,
      managerReviewDueDate,
      competencyRatings
    } = req.body;

    // Check if manager has access to this employee
    if (req.user.role === UserRole.MANAGER) {
      const teamMembers = await getTeamMembers(req.user._id);
      if (!teamMembers.some((m: any) => m._id.toString() === employeeId)) {
        res.status(403).json({ error: 'Not authorized to create review for this employee' });
        return;
      }
    }

    // Check for existing review in the same cycle
    const existingReview = await PerformanceReview.findOne({
      employee: employeeId,
      reviewCycle,
    });

    if (existingReview) {
      res.status(400).json({ error: 'A performance review already exists for this employee in this cycle' });
      return;
    }

    // Initialize competencies with defaults if not provided
    const initialCompetencies = competencyRatings || DEFAULT_COMPETENCIES.map(c => ({
      competency: c.name,
      weight: c.weight,
    }));

    // Get employee's goals for the review period
    const employeeGoals = await Goal.find({
      employee: employeeId,
      reviewCycle,
    });

    const goalRatings = employeeGoals.map(g => ({
      goal: g._id,
      achievement: g.progress,
    }));

    const review = new PerformanceReview({
      employee: employeeId,
      reviewer: req.user._id,
      reviewCycle,
      reviewType: reviewType || ReviewType.ANNUAL,
      status: ReviewStatus.DRAFT,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      competencyRatings: initialCompetencies,
      goalRatings,
      selfReviewDueDate: selfReviewDueDate ? new Date(selfReviewDueDate) : undefined,
      managerReviewDueDate: managerReviewDueDate ? new Date(managerReviewDueDate) : undefined,
    });

    await review.save();
    await review.populate('employee', 'firstName lastName email department');
    await review.populate('reviewer', 'firstName lastName');

    logInfo('Performance review created', { reviewId: review._id, employeeId, createdBy: req.user._id });
    res.status(201).json(review);
  } catch (error) {
    logError('Error creating performance review', { error: error instanceof Error ? error.message : error });
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error creating performance review' });
  }
};

export const getMyReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await PerformanceReview.find({ employee: req.user._id })
      .sort({ createdAt: -1 })
      .populate('reviewer', 'firstName lastName')
      .populate('calibratedBy', 'firstName lastName');

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
};

export const getTeamReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    let query: any = {};

    if (req.user.role === UserRole.MANAGER) {
      const teamMembers = await getTeamMembers(req.user._id);
      query.employee = { $in: teamMembers.map(m => m._id) };
    }

    const { status, reviewCycle, reviewType } = req.query;
    if (status) query.status = status;
    if (reviewCycle) query.reviewCycle = reviewCycle;
    if (reviewType) query.reviewType = reviewType;

    const reviews = await PerformanceReview.find(query)
      .sort({ createdAt: -1 })
      .populate('employee', 'firstName lastName email department')
      .populate('reviewer', 'firstName lastName');

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching team reviews' });
  }
};

export const getReviewById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const review = await PerformanceReview.findById(reviewId)
      .populate('employee', 'firstName lastName email department')
      .populate('reviewer', 'firstName lastName')
      .populate('calibratedBy', 'firstName lastName')
      .populate('goalRatings.goal', 'title description progress');

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    // Check access
    const isOwner = review.employee._id.toString() === req.user._id.toString();
    const isReviewer = review.reviewer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isOwner && !isReviewer && !isAdmin) {
      res.status(403).json({ error: 'Not authorized to view this review' });
      return;
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching review' });
  }
};

export const submitSelfReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const {
      competencyRatings,
      goalRatings,
      selfOverallRating,
      selfStrengths,
      selfAreasForImprovement,
      selfCareerAspirations,
      selfTrainingNeeds
    } = req.body;

    const review = await PerformanceReview.findById(reviewId);
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (review.employee.toString() !== req.user._id.toString()) {
      res.status(403).json({ error: 'Not authorized to submit self review' });
      return;
    }

    if (review.status !== ReviewStatus.SELF_REVIEW && review.status !== ReviewStatus.DRAFT) {
      res.status(400).json({ error: 'Self review is not open for this review' });
      return;
    }

    // Update competency self-ratings
    if (competencyRatings) {
      for (const cr of competencyRatings) {
        const existing = review.competencyRatings.find((r: any) => r.competency === cr.competency);
        if (existing) {
          existing.selfRating = cr.selfRating;
          existing.selfComments = cr.selfComments;
        }
      }
    }

    // Update goal self-ratings
    if (goalRatings) {
      for (const gr of goalRatings) {
        const existing = review.goalRatings.find((r: any) => r.goal.toString() === gr.goalId);
        if (existing) {
          existing.selfRating = gr.selfRating;
          existing.selfComments = gr.selfComments;
        }
      }
    }

    review.selfOverallRating = selfOverallRating;
    review.selfStrengths = selfStrengths;
    review.selfAreasForImprovement = selfAreasForImprovement;
    review.selfCareerAspirations = selfCareerAspirations;
    review.selfTrainingNeeds = selfTrainingNeeds;
    review.selfReviewCompletedAt = new Date();
    review.status = ReviewStatus.MANAGER_REVIEW;

    await review.save();
    logInfo('Self review submitted', { reviewId, employeeId: req.user._id });
    res.json(review);
  } catch (error) {
    res.status(400).json({ error: 'Error submitting self review' });
  }
};

export const submitManagerReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const {
      competencyRatings,
      goalRatings,
      managerOverallRating,
      managerStrengths,
      managerAreasForImprovement,
      managerDevelopmentPlan,
      managerPromotionRecommendation,
      developmentGoals
    } = req.body;

    const review = await PerformanceReview.findById(reviewId);
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (review.reviewer.toString() !== req.user._id.toString() && req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Not authorized to submit manager review' });
      return;
    }

    // Update competency manager-ratings
    if (competencyRatings) {
      for (const cr of competencyRatings) {
        const existing = review.competencyRatings.find((r: any) => r.competency === cr.competency);
        if (existing) {
          existing.managerRating = cr.managerRating;
          existing.managerComments = cr.managerComments;
        }
      }
    }

    // Update goal manager-ratings
    if (goalRatings) {
      for (const gr of goalRatings) {
        const existing = review.goalRatings.find((r: any) => r.goal.toString() === gr.goalId);
        if (existing) {
          existing.managerRating = gr.managerRating;
          existing.managerComments = gr.managerComments;
          existing.achievement = gr.achievement;
        }
      }
    }

    review.managerOverallRating = managerOverallRating;
    review.managerStrengths = managerStrengths;
    review.managerAreasForImprovement = managerAreasForImprovement;
    review.managerDevelopmentPlan = managerDevelopmentPlan;
    review.managerPromotionRecommendation = managerPromotionRecommendation;
    review.developmentGoals = developmentGoals;
    review.managerReviewCompletedAt = new Date();
    review.finalRating = review.calculateOverallRating() || managerOverallRating;
    review.status = ReviewStatus.COMPLETED;
    review.completedAt = new Date();

    await review.save();
    logInfo('Manager review submitted', { reviewId, reviewerId: req.user._id });
    res.json(review);
  } catch (error) {
    res.status(400).json({ error: 'Error submitting manager review' });
  }
};

export const acknowledgeReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const { comments } = req.body;

    const review = await PerformanceReview.findById(reviewId);
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (review.employee.toString() !== req.user._id.toString()) {
      res.status(403).json({ error: 'Not authorized to acknowledge this review' });
      return;
    }

    if (review.status !== ReviewStatus.COMPLETED) {
      res.status(400).json({ error: 'Review must be completed before acknowledgment' });
      return;
    }

    review.employeeAcknowledged = true;
    review.employeeAcknowledgedAt = new Date();
    review.employeeAcknowledgmentComments = comments;
    review.status = ReviewStatus.ACKNOWLEDGED;

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(400).json({ error: 'Error acknowledging review' });
  }
};

export const calibrateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Only admins can calibrate reviews' });
      return;
    }

    const { reviewId } = req.params;
    const { calibratedRating, calibrationNotes } = req.body;

    const review = await PerformanceReview.findById(reviewId);
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    review.calibratedRating = calibratedRating;
    review.calibrationNotes = calibrationNotes;
    review.calibratedBy = req.user._id;
    review.calibratedAt = new Date();
    review.finalRating = calibratedRating;
    review.status = ReviewStatus.COMPLETED;

    await review.save();
    logInfo('Review calibrated', { reviewId, calibratedBy: req.user._id, rating: calibratedRating });
    res.json(review);
  } catch (error) {
    res.status(400).json({ error: 'Error calibrating review' });
  }
};

export const startReviewCycle = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Only admins can start review cycles' });
      return;
    }

    const { reviewId } = req.params;
    const review = await PerformanceReview.findById(reviewId);

    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }

    if (review.status !== ReviewStatus.DRAFT) {
      res.status(400).json({ error: 'Review cycle has already started' });
      return;
    }

    review.status = ReviewStatus.SELF_REVIEW;
    await review.save();

    // Send notification to employee about review cycle starting
    try {
      await review.populate('employee', 'firstName lastName');
      const employee = review.employee as any;
      await createNotification(
        employee._id.toString(),
        'Performance Review Cycle Started 📋',
        `Your ${review.reviewCycle} performance review has started. Please complete your self-review by ${review.selfReviewDueDate ? new Date(review.selfReviewDueDate).toLocaleDateString() : 'the due date'}.`,
        NotificationType.REVIEW_CYCLE_STARTED,
        '/performance'
      );
    } catch (notifError) {
      logError('Failed to create review cycle notification', { error: notifError });
    }

    res.json(review);
  } catch (error) {
    res.status(400).json({ error: 'Error starting review cycle' });
  }
};

export const getReviewAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const { reviewCycle } = req.query;

    const matchQuery: any = { status: ReviewStatus.COMPLETED };
    if (reviewCycle) matchQuery.reviewCycle = reviewCycle;

    // Get rating distribution
    const ratingDistribution = await PerformanceReview.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $round: ['$finalRating', 0] },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get department averages
    const departmentStats = await PerformanceReview.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeData',
        },
      },
      { $unwind: '$employeeData' },
      {
        $group: {
          _id: '$employeeData.department',
          averageRating: { $avg: '$finalRating' },
          count: { $sum: 1 },
        },
      },
      { $sort: { averageRating: -1 } },
    ]);

    // Get completion status
    const completionStats = await PerformanceReview.aggregate([
      { $match: reviewCycle ? { reviewCycle } : {} },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      ratingDistribution: ratingDistribution.map(r => ({
        rating: r._id,
        count: r.count,
        label: RATING_DESCRIPTIONS[r._id as keyof typeof RATING_DESCRIPTIONS]?.label || 'Unknown',
      })),
      departmentStats,
      completionStats,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching analytics' });
  }
};

// ==================== FEEDBACK ====================

export const giveFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      toUserId,
      type,
      category,
      visibility,
      title,
      content,
      rating,
      isAnonymous,
      badge,
      isPublicRecognition
    } = req.body;

    // Validate recipient exists
    const recipient = await User.findById(toUserId);
    if (!recipient) {
      res.status(404).json({ error: 'Recipient not found' });
      return;
    }

    // Can't give feedback to yourself (except self-review)
    if (toUserId === req.user._id.toString() && type !== FeedbackType.SELF) {
      res.status(400).json({ error: 'Cannot give feedback to yourself' });
      return;
    }

    const feedback = new Feedback({
      from: req.user._id,
      to: toUserId,
      type: type || FeedbackType.PEER_REVIEW,
      category: category || FeedbackCategory.GENERAL,
      visibility: visibility || FeedbackVisibility.PRIVATE,
      title,
      content,
      rating,
      isAnonymous: isAnonymous || false,
      badge,
      isPublicRecognition: isPublicRecognition || false,
    });

    await feedback.save();
    
    // Don't populate 'from' if anonymous
    if (!feedback.isAnonymous) {
      await feedback.populate('from', 'firstName lastName avatar');
    }
    await feedback.populate('to', 'firstName lastName');

    // Create notification for the recipient
    try {
      const senderName = feedback.isAnonymous 
        ? 'Someone' 
        : `${req.user.firstName} ${req.user.lastName}`;
      
      const feedbackTypeLabel = type === FeedbackType.PRAISE ? 'recognition' 
        : type === FeedbackType.CONSTRUCTIVE ? 'constructive feedback' 
        : 'suggestion';
      
      await createNotification(
        toUserId,
        `New ${feedbackTypeLabel.charAt(0).toUpperCase() + feedbackTypeLabel.slice(1)} Received! 🎉`,
        `${senderName} has sent you ${feedbackTypeLabel}. Check your feedback wall to see the details!`,
        NotificationType.FEEDBACK_RECEIVED,
        '/performance'
      );
    } catch (notifError) {
      logError('Failed to create feedback notification', { error: notifError });
      // Don't fail the feedback creation if notification fails
    }

    logInfo('Feedback given', { feedbackId: feedback._id, from: req.user._id, to: toUserId, type });
    res.status(201).json(feedback);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error giving feedback' });
  }
};

export const getMyReceivedFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, category } = req.query;
    
    const query: any = {
      to: req.user._id,
      status: FeedbackStatus.APPROVED,
    };
    if (type) query.type = type;
    if (category) query.category = category;

    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: 'from',
        select: 'firstName lastName avatar',
        // Don't show 'from' for anonymous feedback
        match: { _id: { $exists: true } },
      })
      .populate('responses.responder', 'firstName lastName avatar');

    // Transform to match frontend expected format and filter anonymous
    const processedFeedback = feedback.map(f => {
      const obj = f.toObject();
      return {
        ...obj,
        // Map backend fields to frontend expected names
        giver: f.isAnonymous ? null : obj.from,
        recipient: obj.to,
        feedbackType: obj.type,
        comments: obj.content,
        acknowledged: obj.responses && obj.responses.length > 0,
        // Keep original fields for backward compatibility
        from: f.isAnonymous ? null : obj.from,
      };
    });

    res.json(processedFeedback);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching feedback' });
  }
};

export const getMyGivenFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const feedback = await Feedback.find({ from: req.user._id })
      .sort({ createdAt: -1 })
      .populate('from', 'firstName lastName avatar')
      .populate('to', 'firstName lastName avatar');

    // Transform to match frontend expected format
    const processedFeedback = feedback.map(f => {
      const obj = f.toObject();
      return {
        ...obj,
        giver: obj.from,
        recipient: obj.to,
        feedbackType: obj.type,
        comments: obj.content,
        acknowledged: obj.responses && obj.responses.length > 0,
      };
    });

    res.json(processedFeedback);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching feedback' });
  }
};

export const getPublicRecognitions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 20 } = req.query;

    const recognitions = await Feedback.find({
      isPublicRecognition: true,
      visibility: FeedbackVisibility.PUBLIC,
      status: FeedbackStatus.APPROVED,
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('from', 'firstName lastName avatar')
      .populate('to', 'firstName lastName avatar department');

    // Transform to match frontend expected format
    const processedRecognitions = recognitions.map(r => {
      const obj = r.toObject();
      return {
        ...obj,
        giver: r.isAnonymous ? null : obj.from,
        recipient: obj.to,
        feedbackType: obj.type,
        comments: obj.content,
        acknowledged: obj.responses && obj.responses.length > 0,
        from: r.isAnonymous ? null : obj.from,
      };
    });

    res.json(processedRecognitions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching recognitions' });
  }
};

export const respondToFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { feedbackId } = req.params;
    const { content } = req.body;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      res.status(404).json({ error: 'Feedback not found' });
      return;
    }

    // Only recipient can respond
    if (feedback.to.toString() !== req.user._id.toString()) {
      res.status(403).json({ error: 'Not authorized to respond to this feedback' });
      return;
    }

    feedback.responses.push({
      responder: req.user._id,
      content,
      createdAt: new Date(),
    } as any);

    await feedback.save();
    await feedback.populate('responses.responder', 'firstName lastName avatar');

    res.json(feedback);
  } catch (error) {
    res.status(400).json({ error: 'Error responding to feedback' });
  }
};

export const acknowledgeFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { feedbackId } = req.params;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      res.status(404).json({ error: 'Feedback not found' });
      return;
    }

    // Only recipient can acknowledge
    if (feedback.to.toString() !== req.user._id.toString()) {
      res.status(403).json({ error: 'Not authorized to acknowledge this feedback' });
      return;
    }

    // Add a system response to mark as acknowledged
    feedback.responses.push({
      responder: req.user._id,
      content: '[Acknowledged]',
      createdAt: new Date(),
    } as any);

    await feedback.save();
    
    await feedback.populate('from', 'firstName lastName avatar');
    await feedback.populate('to', 'firstName lastName avatar department');
    await feedback.populate('responses.responder', 'firstName lastName avatar');

    res.json(feedback);
  } catch (error) {
    res.status(400).json({ error: 'Error acknowledging feedback' });
  }
};

export const likeFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { feedbackId } = req.params;
    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      res.status(404).json({ error: 'Feedback not found' });
      return;
    }

    if (!feedback.isPublicRecognition || feedback.visibility !== FeedbackVisibility.PUBLIC) {
      res.status(400).json({ error: 'Can only like public recognitions' });
      return;
    }

    const userIndex = feedback.likedBy.findIndex(
      (id: any) => id.toString() === req.user._id.toString()
    );

    if (userIndex === -1) {
      feedback.likedBy.push(req.user._id);
      feedback.likeCount += 1;
    } else {
      feedback.likedBy.splice(userIndex, 1);
      feedback.likeCount -= 1;
    }

    await feedback.save();
    res.json(feedback);
  } catch (error) {
    res.status(400).json({ error: 'Error liking feedback' });
  }
};

export const moderateFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Only admins can moderate feedback' });
      return;
    }

    const { feedbackId } = req.params;
    const { status, notes } = req.body;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      res.status(404).json({ error: 'Feedback not found' });
      return;
    }

    feedback.status = status;
    feedback.moderatedBy = req.user._id;
    feedback.moderatedAt = new Date();
    feedback.moderationNotes = notes;

    await feedback.save();
    logInfo('Feedback moderated', { feedbackId, status, moderatedBy: req.user._id });
    res.json(feedback);
  } catch (error) {
    res.status(400).json({ error: 'Error moderating feedback' });
  }
};

export const getPendingFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Only admins can view pending feedback' });
      return;
    }

    const feedback = await Feedback.find({ status: FeedbackStatus.PENDING })
      .sort({ createdAt: -1 })
      .populate('from', 'firstName lastName')
      .populate('to', 'firstName lastName');

    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching pending feedback' });
  }
};

// Get all feedback for admin/manager view
export const getAllFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only admins and managers can view all feedback
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized to view all feedback' });
      return;
    }

    const { type, category, status } = req.query;
    
    const query: any = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;

    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .populate('from', 'firstName lastName avatar department')
      .populate('to', 'firstName lastName avatar department');

    // Transform to match frontend expected format
    const processedFeedback = feedback.map(f => {
      const obj = f.toObject();
      return {
        ...obj,
        giver: f.isAnonymous ? null : obj.from,
        recipient: obj.to,
        feedbackType: obj.type,
        comments: obj.content,
        acknowledged: obj.responses && obj.responses.length > 0,
        from: f.isAnonymous ? null : obj.from,
      };
    });

    res.json(processedFeedback);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching all feedback' });
  }
};

export const request360Feedback = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized to request 360 feedback' });
      return;
    }

    const { employeeId, reviewerIds, performanceReviewId, message } = req.body;

    // Validate employee
    const employee = await User.findById(employeeId);
    if (!employee) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }

    // Create feedback requests for each reviewer
    const feedbackRequests = [];
    for (const reviewerId of reviewerIds) {
      const reviewer = await User.findById(reviewerId);
      if (reviewer && reviewerId !== employeeId) {
        const feedbackRequest = new Feedback({
          from: reviewerId,
          to: employeeId,
          type: FeedbackType.PEER_REVIEW,
          category: FeedbackCategory.GENERAL,
          visibility: FeedbackVisibility.MANAGER,
          content: '', // Will be filled by reviewer
          isAnonymous: true, // 360 feedback is typically anonymous
          requestedBy: req.user._id,
          performanceReview: performanceReviewId,
          status: FeedbackStatus.PENDING,
        });
        await feedbackRequest.save();
        feedbackRequests.push(feedbackRequest);
        
        // Send notification to reviewer
        try {
          await createNotification(
            reviewerId,
            '360 Feedback Request 📝',
            `You have been requested to provide feedback for ${employee.firstName} ${employee.lastName}. Please share your thoughts.`,
            NotificationType.FEEDBACK_REQUEST,
            '/performance'
          );
        } catch (notifError) {
          logError('Failed to create 360 feedback request notification', { error: notifError });
        }
      }
    }

    res.status(201).json({
      message: `360 feedback requested from ${feedbackRequests.length} reviewers`,
      requests: feedbackRequests,
    });
  } catch (error) {
    res.status(400).json({ error: 'Error requesting 360 feedback' });
  }
};

// Export metadata
export const getCompetencies = async (_req: Request, res: Response): Promise<void> => {
  res.json(DEFAULT_COMPETENCIES);
};

export const getRatingDescriptions = async (_req: Request, res: Response): Promise<void> => {
  res.json(RATING_DESCRIPTIONS);
};

export const getBadgeDefinitions = async (_req: Request, res: Response): Promise<void> => {
  res.json(BADGE_DEFINITIONS);
};
