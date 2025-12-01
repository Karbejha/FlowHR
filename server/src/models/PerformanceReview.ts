import mongoose, { Document, Schema } from 'mongoose';

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

export enum RatingScale {
  EXCEPTIONAL = 5,
  EXCEEDS_EXPECTATIONS = 4,
  MEETS_EXPECTATIONS = 3,
  NEEDS_IMPROVEMENT = 2,
  UNSATISFACTORY = 1
}

interface ICompetencyRating {
  competency: string;
  selfRating?: number;
  managerRating?: number;
  selfComments?: string;
  managerComments?: string;
  weight: number; // percentage weight
}

interface IGoalRating {
  goal: mongoose.Types.ObjectId;
  selfRating?: number;
  managerRating?: number;
  selfComments?: string;
  managerComments?: string;
  achievement: number; // percentage achieved
}

interface IPerformanceReview extends Document {
  employee: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
  reviewCycle: string; // e.g., "FY 2025", "Q1 2025"
  reviewType: ReviewType;
  status: ReviewStatus;
  
  // Review period
  periodStart: Date;
  periodEnd: Date;
  
  // Ratings
  competencyRatings: ICompetencyRating[];
  goalRatings: IGoalRating[];
  
  // Overall scores
  selfOverallRating?: number;
  managerOverallRating?: number;
  finalRating?: number;
  
  // Feedback sections
  selfStrengths?: string;
  selfAreasForImprovement?: string;
  selfCareerAspirations?: string;
  selfTrainingNeeds?: string;
  
  managerStrengths?: string;
  managerAreasForImprovement?: string;
  managerDevelopmentPlan?: string;
  managerPromotionRecommendation?: string;
  
  // Acknowledgment
  employeeAcknowledged: boolean;
  employeeAcknowledgedAt?: Date;
  employeeAcknowledgmentComments?: string;
  
  // Calibration
  calibratedRating?: number;
  calibrationNotes?: string;
  calibratedBy?: mongoose.Types.ObjectId;
  calibratedAt?: Date;
  
  // Dates
  selfReviewDueDate?: Date;
  selfReviewCompletedAt?: Date;
  managerReviewDueDate?: Date;
  managerReviewCompletedAt?: Date;
  completedAt?: Date;
  
  // Next steps
  nextReviewDate?: Date;
  developmentGoals?: string[];
  
  calculateOverallRating(): number;
}

const competencyRatingSchema = new Schema({
  competency: {
    type: String,
    required: true, // e.g., "Communication", "Leadership", "Technical Skills"
  },
  selfRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  managerRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  selfComments: String,
  managerComments: String,
  weight: {
    type: Number,
    default: 10,
    min: 0,
    max: 100,
  }
}, { _id: true });

const goalRatingSchema = new Schema({
  goal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true,
  },
  selfRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  managerRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  selfComments: String,
  managerComments: String,
  achievement: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  }
}, { _id: true });

const performanceReviewSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reviewCycle: {
    type: String,
    required: true, // e.g., "FY 2025", "Q1 2025", "H1 2025"
    index: true,
  },
  reviewType: {
    type: String,
    enum: Object.values(ReviewType),
    default: ReviewType.ANNUAL,
  },
  status: {
    type: String,
    enum: Object.values(ReviewStatus),
    default: ReviewStatus.DRAFT,
  },
  
  // Review period
  periodStart: {
    type: Date,
    required: true,
  },
  periodEnd: {
    type: Date,
    required: true,
  },
  
  // Ratings
  competencyRatings: [competencyRatingSchema],
  goalRatings: [goalRatingSchema],
  
  // Overall scores
  selfOverallRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  managerOverallRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  finalRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  
  // Self-review feedback
  selfStrengths: String,
  selfAreasForImprovement: String,
  selfCareerAspirations: String,
  selfTrainingNeeds: String,
  
  // Manager feedback
  managerStrengths: String,
  managerAreasForImprovement: String,
  managerDevelopmentPlan: String,
  managerPromotionRecommendation: {
    type: String,
    enum: ['not_ready', 'ready_in_1_year', 'ready_now', 'already_promoted'],
  },
  
  // Employee acknowledgment
  employeeAcknowledged: {
    type: Boolean,
    default: false,
  },
  employeeAcknowledgedAt: Date,
  employeeAcknowledgmentComments: String,
  
  // Calibration
  calibratedRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  calibrationNotes: String,
  calibratedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  calibratedAt: Date,
  
  // Due dates
  selfReviewDueDate: Date,
  selfReviewCompletedAt: Date,
  managerReviewDueDate: Date,
  managerReviewCompletedAt: Date,
  completedAt: Date,
  
  // Next steps
  nextReviewDate: Date,
  developmentGoals: [String],
}, {
  timestamps: true,
});

// Calculate overall rating based on competencies and goals
performanceReviewSchema.methods.calculateOverallRating = function(): number {
  let totalWeight = 0;
  let weightedSum = 0;

  // Calculate from competency ratings
  for (const cr of this.competencyRatings) {
    if (cr.managerRating) {
      totalWeight += cr.weight;
      weightedSum += cr.managerRating * cr.weight;
    }
  }

  // Calculate from goal ratings (assuming goals have 50% weight total)
  const goalWeight = 50;
  let goalSum = 0;
  let goalCount = 0;
  
  for (const gr of this.goalRatings) {
    if (gr.managerRating) {
      goalSum += gr.managerRating;
      goalCount++;
    }
  }

  if (goalCount > 0) {
    totalWeight += goalWeight;
    weightedSum += (goalSum / goalCount) * goalWeight;
  }

  if (totalWeight === 0) return 0;
  
  return Math.round((weightedSum / totalWeight) * 10) / 10;
};

// Auto-update status based on review completion
performanceReviewSchema.pre('save', function(next) {
  // Update status based on completion of sections
  if (this.status === ReviewStatus.SELF_REVIEW && this.selfOverallRating) {
    this.selfReviewCompletedAt = new Date();
    this.status = ReviewStatus.MANAGER_REVIEW;
  }
  
  if (this.status === ReviewStatus.MANAGER_REVIEW && this.managerOverallRating) {
    this.managerReviewCompletedAt = new Date();
    this.finalRating = this.managerOverallRating;
  }
  
  if (this.status === ReviewStatus.CALIBRATION && this.calibratedRating) {
    this.finalRating = this.calibratedRating;
    this.status = ReviewStatus.COMPLETED;
    this.completedAt = new Date();
  }
  
  if (this.employeeAcknowledged && this.status === ReviewStatus.COMPLETED) {
    this.status = ReviewStatus.ACKNOWLEDGED;
    this.employeeAcknowledgedAt = new Date();
  }
  
  next();
});

// Compound indexes for efficient queries
performanceReviewSchema.index({ employee: 1, reviewCycle: 1 });
performanceReviewSchema.index({ reviewer: 1, status: 1 });
performanceReviewSchema.index({ status: 1, reviewCycle: 1 });

export const PerformanceReview = mongoose.model<IPerformanceReview>('PerformanceReview', performanceReviewSchema);

// Default competencies for performance reviews
export const DEFAULT_COMPETENCIES = [
  { name: 'Communication', weight: 15, description: 'Ability to clearly convey information and ideas' },
  { name: 'Teamwork', weight: 15, description: 'Collaboration and working effectively with others' },
  { name: 'Problem Solving', weight: 15, description: 'Ability to analyze and resolve issues' },
  { name: 'Technical Skills', weight: 20, description: 'Job-specific technical competencies' },
  { name: 'Leadership', weight: 10, description: 'Ability to guide and influence others' },
  { name: 'Initiative', weight: 10, description: 'Taking proactive action and self-direction' },
  { name: 'Adaptability', weight: 10, description: 'Flexibility in handling change' },
  { name: 'Time Management', weight: 5, description: 'Efficient use of time and meeting deadlines' },
];

// Rating scale descriptions
export const RATING_DESCRIPTIONS = {
  5: { label: 'Exceptional', description: 'Consistently exceeds all expectations and serves as a role model' },
  4: { label: 'Exceeds Expectations', description: 'Regularly exceeds expectations and delivers outstanding results' },
  3: { label: 'Meets Expectations', description: 'Consistently meets all job requirements and expectations' },
  2: { label: 'Needs Improvement', description: 'Occasionally meets expectations but improvement is needed' },
  1: { label: 'Unsatisfactory', description: 'Does not meet minimum job requirements' },
};
