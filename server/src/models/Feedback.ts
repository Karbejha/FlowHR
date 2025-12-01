import mongoose, { Document, Schema } from 'mongoose';

export enum FeedbackType {
  PRAISE = 'praise',
  CONSTRUCTIVE = 'constructive',
  SUGGESTION = 'suggestion',
  PEER_REVIEW = 'peer_review',
  UPWARD = 'upward', // Feedback to manager
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
  PRIVATE = 'private', // Only recipient and admin
  MANAGER = 'manager', // Recipient, their manager, and admin
  PUBLIC = 'public' // Visible to team/company
}

export enum FeedbackStatus {
  PENDING = 'pending', // Awaiting review/moderation
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ARCHIVED = 'archived'
}

interface IFeedbackResponse {
  responder: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

interface IFeedback extends Document {
  from: mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId;
  type: FeedbackType;
  category: FeedbackCategory;
  visibility: FeedbackVisibility;
  status: FeedbackStatus;
  
  // Content
  title?: string;
  content: string;
  rating?: number; // Optional 1-5 rating
  
  // For 360 feedback
  isAnonymous: boolean;
  requestedBy?: mongoose.Types.ObjectId; // Who requested this feedback
  performanceReview?: mongoose.Types.ObjectId; // Linked review if part of 360
  
  // Responses/Discussion
  responses: IFeedbackResponse[];
  
  // Recognition/Badge
  badge?: string; // e.g., "team_player", "problem_solver", "innovator"
  isPublicRecognition: boolean;
  
  // Engagement
  likeCount: number;
  likedBy: mongoose.Types.ObjectId[];
  
  // Moderation
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  moderationNotes?: string;
}

const feedbackResponseSchema = new Schema({
  responder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, { _id: true });

const feedbackSchema = new Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: Object.values(FeedbackType),
    required: true,
  },
  category: {
    type: String,
    enum: Object.values(FeedbackCategory),
    default: FeedbackCategory.GENERAL,
  },
  visibility: {
    type: String,
    enum: Object.values(FeedbackVisibility),
    default: FeedbackVisibility.PRIVATE,
  },
  status: {
    type: String,
    enum: Object.values(FeedbackStatus),
    default: FeedbackStatus.APPROVED, // Auto-approve non-anonymous
  },
  
  // Content
  title: {
    type: String,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  
  // For 360 feedback
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  performanceReview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PerformanceReview',
  },
  
  // Responses
  responses: [feedbackResponseSchema],
  
  // Recognition
  badge: {
    type: String,
    enum: [
      'team_player',
      'problem_solver',
      'innovator',
      'mentor',
      'customer_champion',
      'quality_guru',
      'deadline_crusher',
      'communicator',
      'rising_star',
      'subject_matter_expert'
    ],
  },
  isPublicRecognition: {
    type: Boolean,
    default: false,
  },
  
  // Engagement
  likeCount: {
    type: Number,
    default: 0,
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  
  // Moderation
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  moderatedAt: Date,
  moderationNotes: String,
}, {
  timestamps: true,
});

// Auto-set status for anonymous feedback
feedbackSchema.pre('save', function(next) {
  if (this.isNew) {
    // Anonymous feedback requires moderation
    if (this.isAnonymous || this.type === FeedbackType.ANONYMOUS) {
      this.status = FeedbackStatus.PENDING;
      this.isAnonymous = true;
    }
    // Note: Public recognition is auto-approved to allow immediate visibility
    // Admins can still moderate via the moderation endpoint if needed
  }
  next();
});

// Indexes for efficient queries
feedbackSchema.index({ to: 1, createdAt: -1 });
feedbackSchema.index({ from: 1, createdAt: -1 });
feedbackSchema.index({ type: 1, status: 1 });
feedbackSchema.index({ performanceReview: 1 });
feedbackSchema.index({ isPublicRecognition: 1, status: 1 });

export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema);

// Badge definitions
export const BADGE_DEFINITIONS = {
  team_player: { name: 'Team Player', description: 'Exceptional collaboration and support', icon: '🤝' },
  problem_solver: { name: 'Problem Solver', description: 'Creative solutions to complex challenges', icon: '💡' },
  innovator: { name: 'Innovator', description: 'Driving innovation and new ideas', icon: '🚀' },
  mentor: { name: 'Mentor', description: 'Outstanding guidance and mentorship', icon: '🎓' },
  customer_champion: { name: 'Customer Champion', description: 'Exceptional customer focus', icon: '⭐' },
  quality_guru: { name: 'Quality Guru', description: 'Commitment to excellence', icon: '✨' },
  deadline_crusher: { name: 'Deadline Crusher', description: 'Reliable delivery on time', icon: '⏰' },
  communicator: { name: 'Great Communicator', description: 'Clear and effective communication', icon: '💬' },
  rising_star: { name: 'Rising Star', description: 'Rapid growth and potential', icon: '🌟' },
  subject_matter_expert: { name: 'Subject Matter Expert', description: 'Deep expertise in their field', icon: '🏆' },
};
