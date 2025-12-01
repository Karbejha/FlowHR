import mongoose, { Document, Schema } from 'mongoose';

export enum OnboardingStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  ON_HOLD = 'on_hold'
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  BLOCKED = 'blocked'
}

export enum TaskCategory {
  DOCUMENTATION = 'documentation',
  IT_SETUP = 'it_setup',
  HR_PAPERWORK = 'hr_paperwork',
  TRAINING = 'training',
  ORIENTATION = 'orientation',
  TEAM_INTRODUCTION = 'team_introduction',
  EQUIPMENT = 'equipment',
  ACCESS_PROVISIONING = 'access_provisioning',
  COMPLIANCE = 'compliance',
  BENEFITS = 'benefits',
  MENTORSHIP = 'mentorship',
  OTHER = 'other'
}

export enum OnboardingType {
  NEW_HIRE = 'new_hire',
  TRANSFER = 'transfer',
  PROMOTION = 'promotion',
  REHIRE = 'rehire',
  CONTRACTOR = 'contractor',
  INTERN = 'intern'
}

export enum OffboardingType {
  RESIGNATION = 'resignation',
  TERMINATION = 'termination',
  RETIREMENT = 'retirement',
  CONTRACT_END = 'contract_end',
  TRANSFER = 'transfer'
}

// Task interface
interface IOnboardingTask {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: TaskCategory;
  status: TaskStatus;
  assignedTo: mongoose.Types.ObjectId; // Who is responsible
  dueDate?: Date;
  completedAt?: Date;
  completedBy?: mongoose.Types.ObjectId;
  order: number; // Sequence order
  isRequired: boolean;
  dependsOn?: mongoose.Types.ObjectId[]; // Task dependencies
  attachments?: string[];
  notes?: string;
  reminderSent: boolean;
}

// Main onboarding interface
interface IOnboarding extends Document {
  employee: mongoose.Types.ObjectId;
  type: OnboardingType;
  status: OnboardingStatus;
  
  // Dates
  startDate: Date;
  targetCompletionDate: Date;
  actualCompletionDate?: Date;
  
  // Tasks
  tasks: IOnboardingTask[];
  
  // Progress
  progress: number; // 0-100 percentage
  completedTasksCount: number;
  totalTasksCount: number;
  
  // Assignment
  hrAssignee?: mongoose.Types.ObjectId;
  buddy?: mongoose.Types.ObjectId; // Onboarding buddy/mentor
  
  // Documents required
  requiredDocuments: {
    documentType: string;
    isSubmitted: boolean;
    documentId?: mongoose.Types.ObjectId;
  }[];
  
  // Equipment
  equipmentList: {
    item: string;
    status: string;
    assignedAt?: Date;
    serialNumber?: string;
  }[];
  
  // Access/Accounts
  accessList: {
    system: string;
    status: string;
    grantedAt?: Date;
    grantedBy?: mongoose.Types.ObjectId;
  }[];
  
  // Training
  trainingList: {
    course: string;
    isRequired: boolean;
    isCompleted: boolean;
    completedAt?: Date;
    certificateUrl?: string;
  }[];
  
  // Feedback
  feedbackCollected: boolean;
  feedbackScore?: number;
  feedbackComments?: string;
  feedbackCollectedAt?: Date;
  
  // Notes
  notes?: string;
  
  calculateProgress(): number;
}

// Offboarding interface
interface IOffboarding extends Document {
  employee: mongoose.Types.ObjectId;
  type: OffboardingType;
  status: OnboardingStatus;
  
  // Dates
  lastWorkingDate: Date;
  noticeDate: Date;
  exitDate: Date;
  
  // Tasks
  tasks: IOnboardingTask[];
  progress: number;
  
  // Exit interview
  exitInterviewScheduled: boolean;
  exitInterviewDate?: Date;
  exitInterviewConductedBy?: mongoose.Types.ObjectId;
  exitInterviewCompleted: boolean;
  exitInterviewNotes?: string;
  exitReasons?: string[];
  
  // Knowledge transfer
  knowledgeTransferAssignee?: mongoose.Types.ObjectId;
  knowledgeTransferCompleted: boolean;
  knowledgeTransferNotes?: string;
  
  // Equipment return
  equipmentToReturn: {
    item: string;
    serialNumber?: string;
    status: string;
    returnedAt?: Date;
    condition?: string;
  }[];
  
  // Access revocation
  accessToRevoke: {
    system: string;
    status: string;
    revokedAt?: Date;
    revokedBy?: mongoose.Types.ObjectId;
  }[];
  
  // Final settlements
  finalPaymentCalculated: boolean;
  finalPaymentAmount?: number;
  ptoBalance?: number;
  
  // Clearance
  clearances: {
    department: string;
    status: string;
    clearedBy?: mongoose.Types.ObjectId;
    clearedAt?: Date;
    notes?: string;
  }[];
  
  // Documents
  exitDocuments: {
    documentType: string;
    status: string;
    documentId?: mongoose.Types.ObjectId;
  }[];
  
  // Rehire eligibility
  rehireEligible?: boolean;
  rehireNotes?: string;
}

const onboardingTaskSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200,
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  category: {
    type: String,
    enum: Object.values(TaskCategory),
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.PENDING,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dueDate: Date,
  completedAt: Date,
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  order: {
    type: Number,
    default: 0,
  },
  isRequired: {
    type: Boolean,
    default: true,
  },
  dependsOn: [{
    type: mongoose.Schema.Types.ObjectId,
  }],
  attachments: [String],
  notes: String,
  reminderSent: {
    type: Boolean,
    default: false,
  },
}, { _id: true });

const onboardingSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: Object.values(OnboardingType),
    default: OnboardingType.NEW_HIRE,
  },
  status: {
    type: String,
    enum: Object.values(OnboardingStatus),
    default: OnboardingStatus.NOT_STARTED,
  },
  
  // Dates
  startDate: {
    type: Date,
    required: true,
  },
  targetCompletionDate: {
    type: Date,
    required: true,
  },
  actualCompletionDate: Date,
  
  // Tasks
  tasks: [onboardingTaskSchema],
  
  // Progress
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  completedTasksCount: {
    type: Number,
    default: 0,
  },
  totalTasksCount: {
    type: Number,
    default: 0,
  },
  
  // Assignment
  hrAssignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  buddy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  
  // Documents
  requiredDocuments: [{
    documentType: String,
    isSubmitted: {
      type: Boolean,
      default: false,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmployeeDocument',
    },
  }],
  
  // Equipment
  equipmentList: [{
    item: String,
    status: {
      type: String,
      enum: ['pending', 'ordered', 'assigned', 'returned'],
      default: 'pending',
    },
    assignedAt: Date,
    serialNumber: String,
  }],
  
  // Access
  accessList: [{
    system: String,
    status: {
      type: String,
      enum: ['pending', 'requested', 'granted', 'revoked'],
      default: 'pending',
    },
    grantedAt: Date,
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  
  // Training
  trainingList: [{
    course: String,
    isRequired: {
      type: Boolean,
      default: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    certificateUrl: String,
  }],
  
  // Feedback
  feedbackCollected: {
    type: Boolean,
    default: false,
  },
  feedbackScore: {
    type: Number,
    min: 1,
    max: 5,
  },
  feedbackComments: String,
  feedbackCollectedAt: Date,
  
  notes: String,
}, {
  timestamps: true,
});

// Calculate progress method
onboardingSchema.methods.calculateProgress = function(): number {
  if (!this.tasks || this.tasks.length === 0) {
    return 0;
  }

  const completedTasks = this.tasks.filter(
    (t: IOnboardingTask) => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.SKIPPED
  ).length;
  
  this.completedTasksCount = completedTasks;
  this.totalTasksCount = this.tasks.length;
  this.progress = Math.round((completedTasks / this.tasks.length) * 100);
  
  return this.progress;
};

// Pre-save hook to update progress and status
onboardingSchema.pre('save', function(next) {
  // Calculate progress inline
  const completedTasks = this.tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  this.completedTasksCount = completedTasks;
  this.totalTasksCount = this.tasks.length;
  this.progress = this.tasks.length > 0 ? Math.round((completedTasks / this.tasks.length) * 100) : 0;
  
  // Update status based on progress
  if (this.progress === 100) {
    this.status = OnboardingStatus.COMPLETED;
    if (!this.actualCompletionDate) {
      this.actualCompletionDate = new Date();
    }
  } else if (this.progress > 0) {
    this.status = OnboardingStatus.IN_PROGRESS;
  }
  
  // Check for overdue
  if (new Date() > this.targetCompletionDate && this.progress < 100) {
    this.status = OnboardingStatus.OVERDUE;
  }
  
  next();
});

// Offboarding schema
const offboardingSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: Object.values(OffboardingType),
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(OnboardingStatus),
    default: OnboardingStatus.NOT_STARTED,
  },
  
  // Dates
  lastWorkingDate: {
    type: Date,
    required: true,
  },
  noticeDate: {
    type: Date,
    required: true,
  },
  exitDate: {
    type: Date,
    required: true,
  },
  
  // Tasks
  tasks: [onboardingTaskSchema],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  
  // Exit interview
  exitInterviewScheduled: {
    type: Boolean,
    default: false,
  },
  exitInterviewDate: Date,
  exitInterviewConductedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  exitInterviewCompleted: {
    type: Boolean,
    default: false,
  },
  exitInterviewNotes: String,
  exitReasons: [String],
  
  // Knowledge transfer
  knowledgeTransferAssignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  knowledgeTransferCompleted: {
    type: Boolean,
    default: false,
  },
  knowledgeTransferNotes: String,
  
  // Equipment return
  equipmentToReturn: [{
    item: String,
    serialNumber: String,
    status: {
      type: String,
      enum: ['pending', 'returned', 'lost', 'damaged'],
      default: 'pending',
    },
    returnedAt: Date,
    condition: String,
  }],
  
  // Access revocation
  accessToRevoke: [{
    system: String,
    status: {
      type: String,
      enum: ['active', 'pending_revocation', 'revoked'],
      default: 'active',
    },
    revokedAt: Date,
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  }],
  
  // Final settlements
  finalPaymentCalculated: {
    type: Boolean,
    default: false,
  },
  finalPaymentAmount: Number,
  ptoBalance: Number,
  
  // Clearances
  clearances: [{
    department: String,
    status: {
      type: String,
      enum: ['pending', 'cleared', 'issue'],
      default: 'pending',
    },
    clearedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    clearedAt: Date,
    notes: String,
  }],
  
  // Exit documents
  exitDocuments: [{
    documentType: String,
    status: {
      type: String,
      enum: ['pending', 'generated', 'signed', 'delivered'],
      default: 'pending',
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmployeeDocument',
    },
  }],
  
  // Rehire eligibility
  rehireEligible: Boolean,
  rehireNotes: String,
}, {
  timestamps: true,
});

// Indexes
onboardingSchema.index({ employee: 1, status: 1 });
onboardingSchema.index({ startDate: 1 });
onboardingSchema.index({ hrAssignee: 1, status: 1 });

offboardingSchema.index({ employee: 1, status: 1 });
offboardingSchema.index({ exitDate: 1 });

export const Onboarding = mongoose.model<IOnboarding>('Onboarding', onboardingSchema);
export const Offboarding = mongoose.model<IOffboarding>('Offboarding', offboardingSchema);

// Default onboarding tasks template
export const DEFAULT_ONBOARDING_TASKS = [
  // Documentation
  { title: 'Complete personal information form', category: TaskCategory.HR_PAPERWORK, order: 1, isRequired: true },
  { title: 'Submit ID documents', category: TaskCategory.DOCUMENTATION, order: 2, isRequired: true },
  { title: 'Sign employment contract', category: TaskCategory.HR_PAPERWORK, order: 3, isRequired: true },
  { title: 'Sign NDA', category: TaskCategory.HR_PAPERWORK, order: 4, isRequired: true },
  { title: 'Complete tax forms', category: TaskCategory.HR_PAPERWORK, order: 5, isRequired: true },
  { title: 'Provide bank details', category: TaskCategory.HR_PAPERWORK, order: 6, isRequired: true },
  { title: 'Emergency contact information', category: TaskCategory.HR_PAPERWORK, order: 7, isRequired: true },
  
  // IT Setup
  { title: 'Create corporate email', category: TaskCategory.IT_SETUP, order: 8, isRequired: true },
  { title: 'Set up laptop/workstation', category: TaskCategory.IT_SETUP, order: 9, isRequired: true },
  { title: 'Configure VPN access', category: TaskCategory.IT_SETUP, order: 10, isRequired: false },
  { title: 'Grant access to required systems', category: TaskCategory.ACCESS_PROVISIONING, order: 11, isRequired: true },
  
  // Equipment
  { title: 'Issue laptop', category: TaskCategory.EQUIPMENT, order: 12, isRequired: true },
  { title: 'Issue access card/badge', category: TaskCategory.EQUIPMENT, order: 13, isRequired: true },
  { title: 'Issue phone (if applicable)', category: TaskCategory.EQUIPMENT, order: 14, isRequired: false },
  
  // Orientation
  { title: 'Company orientation session', category: TaskCategory.ORIENTATION, order: 15, isRequired: true },
  { title: 'Department orientation', category: TaskCategory.ORIENTATION, order: 16, isRequired: true },
  { title: 'Office tour', category: TaskCategory.ORIENTATION, order: 17, isRequired: true },
  { title: 'Introduction to team members', category: TaskCategory.TEAM_INTRODUCTION, order: 18, isRequired: true },
  { title: 'Meet with manager - first week', category: TaskCategory.TEAM_INTRODUCTION, order: 19, isRequired: true },
  
  // Training
  { title: 'Complete security awareness training', category: TaskCategory.TRAINING, order: 20, isRequired: true },
  { title: 'Complete compliance training', category: TaskCategory.COMPLIANCE, order: 21, isRequired: true },
  { title: 'Review company policies', category: TaskCategory.TRAINING, order: 22, isRequired: true },
  { title: 'Sign policy acknowledgment', category: TaskCategory.COMPLIANCE, order: 23, isRequired: true },
  
  // Benefits
  { title: 'Benefits enrollment', category: TaskCategory.BENEFITS, order: 24, isRequired: true },
  { title: 'Review leave policies', category: TaskCategory.BENEFITS, order: 25, isRequired: true },
  
  // Mentorship
  { title: 'Assign onboarding buddy', category: TaskCategory.MENTORSHIP, order: 26, isRequired: false },
  { title: '30-day check-in with HR', category: TaskCategory.MENTORSHIP, order: 27, isRequired: true },
  { title: '90-day probation review', category: TaskCategory.MENTORSHIP, order: 28, isRequired: true },
];

// Default offboarding tasks template
export const DEFAULT_OFFBOARDING_TASKS = [
  { title: 'Accept resignation letter', category: TaskCategory.HR_PAPERWORK, order: 1, isRequired: true },
  { title: 'Schedule exit interview', category: TaskCategory.HR_PAPERWORK, order: 2, isRequired: true },
  { title: 'Conduct exit interview', category: TaskCategory.HR_PAPERWORK, order: 3, isRequired: true },
  { title: 'Knowledge transfer sessions', category: TaskCategory.TRAINING, order: 4, isRequired: true },
  { title: 'Document handover', category: TaskCategory.DOCUMENTATION, order: 5, isRequired: true },
  { title: 'Return laptop', category: TaskCategory.EQUIPMENT, order: 6, isRequired: true },
  { title: 'Return access card/badge', category: TaskCategory.EQUIPMENT, order: 7, isRequired: true },
  { title: 'Return phone (if applicable)', category: TaskCategory.EQUIPMENT, order: 8, isRequired: false },
  { title: 'Revoke email access', category: TaskCategory.ACCESS_PROVISIONING, order: 9, isRequired: true },
  { title: 'Revoke system access', category: TaskCategory.ACCESS_PROVISIONING, order: 10, isRequired: true },
  { title: 'Finance clearance', category: TaskCategory.HR_PAPERWORK, order: 11, isRequired: true },
  { title: 'IT clearance', category: TaskCategory.IT_SETUP, order: 12, isRequired: true },
  { title: 'Department clearance', category: TaskCategory.HR_PAPERWORK, order: 13, isRequired: true },
  { title: 'Calculate final settlement', category: TaskCategory.HR_PAPERWORK, order: 14, isRequired: true },
  { title: 'Generate experience letter', category: TaskCategory.DOCUMENTATION, order: 15, isRequired: true },
  { title: 'Process final payment', category: TaskCategory.HR_PAPERWORK, order: 16, isRequired: true },
];
