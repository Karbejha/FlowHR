import mongoose, { Document, Schema } from 'mongoose';

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

interface IKeyResult {
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  weight: number; // percentage weight for this key result
}

interface IGoalComment {
  author: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

interface IGoal extends Document {
  employee: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  startDate: Date;
  dueDate: Date;
  completedDate?: Date;
  progress: number; // 0-100 percentage
  weight: number; // Weight of this goal in overall performance (percentage)
  keyResults: IKeyResult[];
  comments: IGoalComment[];
  parentGoal?: mongoose.Types.ObjectId; // For cascading goals from manager
  alignedWith?: mongoose.Types.ObjectId; // Company/team goal alignment
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  reviewCycle?: string; // e.g., "Q1 2025", "FY 2025"
  isPrivate: boolean;
  calculateProgress(): number;
}

const keyResultSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  targetValue: {
    type: Number,
    required: true,
    min: 0,
  },
  currentValue: {
    type: Number,
    default: 0,
    min: 0,
  },
  unit: {
    type: String,
    required: true, // e.g., "percentage", "count", "dollars", "hours"
  },
  weight: {
    type: Number,
    default: 100,
    min: 0,
    max: 100,
  }
}, { _id: true });

const goalCommentSchema = new Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, { _id: true });

const goalSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  category: {
    type: String,
    enum: Object.values(GoalCategory),
    default: GoalCategory.PERFORMANCE,
  },
  priority: {
    type: String,
    enum: Object.values(GoalPriority),
    default: GoalPriority.MEDIUM,
  },
  status: {
    type: String,
    enum: Object.values(GoalStatus),
    default: GoalStatus.DRAFT,
  },
  startDate: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  completedDate: {
    type: Date,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  weight: {
    type: Number,
    default: 100,
    min: 0,
    max: 100,
  },
  keyResults: [keyResultSchema],
  comments: [goalCommentSchema],
  parentGoal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
  },
  alignedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewCycle: {
    type: String, // e.g., "Q1 2025", "FY 2025", "H1 2025"
  },
  isPrivate: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

// Calculate progress based on key results
goalSchema.methods.calculateProgress = function(): number {
  if (!this.keyResults || this.keyResults.length === 0) {
    return this.progress;
  }

  let totalWeight = 0;
  let weightedProgress = 0;

  for (const kr of this.keyResults) {
    const weight = kr.weight || 100;
    totalWeight += weight;
    
    if (kr.targetValue > 0) {
      const krProgress = Math.min((kr.currentValue / kr.targetValue) * 100, 100);
      weightedProgress += krProgress * weight;
    }
  }

  if (totalWeight === 0) return 0;
  
  this.progress = Math.round(weightedProgress / totalWeight);
  return this.progress;
};

// Auto-update status based on dates and progress
goalSchema.pre('save', function(next) {
  // Update status based on progress and dates
  if (this.status !== GoalStatus.CANCELLED) {
    if (this.progress >= 100) {
      this.status = GoalStatus.COMPLETED;
      if (!this.completedDate) {
        this.completedDate = new Date();
      }
    } else if (new Date() > this.dueDate && this.progress < 100) {
      this.status = GoalStatus.OVERDUE;
    } else if (this.progress > 0 && this.status === GoalStatus.ACTIVE) {
      this.status = GoalStatus.IN_PROGRESS;
    }
  }

  next();
});

// Index for efficient queries
goalSchema.index({ employee: 1, status: 1 });
goalSchema.index({ employee: 1, reviewCycle: 1 });
goalSchema.index({ dueDate: 1 });

export const Goal = mongoose.model<IGoal>('Goal', goalSchema);
