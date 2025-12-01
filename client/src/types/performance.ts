// Performance Management Types

export enum GoalStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue'
}

export enum GoalPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum GoalCategory {
  PERFORMANCE = 'performance',
  DEVELOPMENT = 'development',
  PROJECT = 'project',
  LEARNING = 'learning',
  LEADERSHIP = 'leadership',
  INNOVATION = 'innovation',
  QUALITY = 'quality',
  OTHER = 'other'
}

export type KeyResult = string;

export interface GoalComment {
  _id: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

export interface Goal {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    department?: string;
  };
  title: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  progress: number;
  weight: number;
  keyResults: string[];
  comments: GoalComment[];
  parentGoal?: string;
  alignedWith?: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reviewCycle?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

// Performance Review Types

export enum ReviewStatus {
  DRAFT = 'draft',
  SELF_REVIEW = 'self_review',
  MANAGER_REVIEW = 'manager_review',
  CALIBRATION = 'calibration',
  COMPLETED = 'completed',
  ACKNOWLEDGED = 'acknowledged'
}

export enum ReviewType {
  ANNUAL = 'annual',
  MID_YEAR = 'mid_year',
  QUARTERLY = 'quarterly',
  PROBATION = 'probation',
  PROJECT = 'project',
  PROMOTION = 'promotion',
  AD_HOC = 'ad_hoc'
}

export interface CompetencyRating {
  _id: string;
  competency: string;
  selfRating?: number;
  managerRating?: number;
  selfComments?: string;
  managerComments?: string;
  weight: number;
}

export interface GoalRating {
  _id: string;
  goal: {
    _id: string;
    title: string;
    description?: string;
    progress: number;
  };
  selfRating?: number;
  managerRating?: number;
  selfComments?: string;
  managerComments?: string;
  achievement: number;
}

export interface PerformanceReview {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    department?: string;
  };
  reviewer: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reviewCycle: string;
  reviewType: ReviewType;
  status: ReviewStatus;
  periodStart: string;
  periodEnd: string;
  competencyRatings: CompetencyRating[];
  goalRatings: GoalRating[];
  selfOverallRating?: number;
  managerOverallRating?: number;
  finalRating?: number;
  selfStrengths?: string;
  selfAreasForImprovement?: string;
  selfCareerAspirations?: string;
  selfTrainingNeeds?: string;
  managerStrengths?: string;
  managerAreasForImprovement?: string;
  managerDevelopmentPlan?: string;
  managerPromotionRecommendation?: string;
  employeeAcknowledged: boolean;
  employeeAcknowledgedAt?: string;
  employeeAcknowledgmentComments?: string;
  calibratedRating?: number;
  calibrationNotes?: string;
  calibratedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  calibratedAt?: string;
  selfReviewDueDate?: string;
  selfReviewCompletedAt?: string;
  managerReviewDueDate?: string;
  managerReviewCompletedAt?: string;
  completedAt?: string;
  nextReviewDate?: string;
  developmentGoals?: string[];
  createdAt: string;
  updatedAt: string;
}

// Feedback Types

export enum FeedbackType {
  PRAISE = 'praise',
  CONSTRUCTIVE = 'constructive',
  SUGGESTION = 'suggestion',
  PEER_REVIEW = 'peer_review',
  UPWARD = 'upward',
  SELF = 'self',
  ANONYMOUS = 'anonymous'
}

export enum FeedbackCategory {
  COMMUNICATION = 'communication',
  LEADERSHIP = 'leadership',
  TEAMWORK = 'teamwork',
  TECHNICAL = 'technical',
  PROBLEM_SOLVING = 'problem_solving',
  INITIATIVE = 'initiative',
  CUSTOMER_FOCUS = 'customer_focus',
  INNOVATION = 'innovation',
  QUALITY = 'quality',
  GENERAL = 'general'
}

export enum FeedbackVisibility {
  PRIVATE = 'private',
  MANAGER_ONLY = 'manager_only',
  PUBLIC = 'public'
}

export enum FeedbackStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived'
}

export type BadgeType = 
  | 'team_player'
  | 'problem_solver'
  | 'innovator'
  | 'mentor'
  | 'customer_champion'
  | 'quality_guru'
  | 'deadline_crusher'
  | 'communicator'
  | 'rising_star'
  | 'subject_matter_expert';

export interface FeedbackResponse {
  _id: string;
  responder: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

export interface Feedback {
  _id: string;
  giver: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  recipient: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    department?: string;
  };
  feedbackType: FeedbackType;
  comments: string;
  visibility: FeedbackVisibility;
  acknowledged: boolean;
  performanceReview?: string;
  createdAt: string;
  updatedAt: string;
}

// Default competencies config
export interface DefaultCompetency {
  name: string;
  weight: number;
  description: string;
}

// Rating descriptions
export interface RatingDescription {
  label: string;
  description: string;
}

// Badge definition
export interface BadgeDefinition {
  name: string;
  description: string;
  icon: string;
}

// Review Analytics
export interface ReviewAnalytics {
  ratingDistribution: Array<{
    rating: number;
    count: number;
    label: string;
  }>;
  departmentStats: Array<{
    _id: string;
    averageRating: number;
    count: number;
  }>;
  completionStats: Array<{
    _id: string;
    count: number;
  }>;
}
