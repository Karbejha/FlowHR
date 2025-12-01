// Onboarding & Offboarding Types

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
export interface OnboardingTask {
  _id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  status: TaskStatus;
  assignedTo: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  dueDate?: string;
  completedAt?: string;
  completedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  order: number;
  isRequired: boolean;
  dependsOn?: string[];
  attachments?: string[];
  notes?: string;
  reminderSent: boolean;
}

// Required document
export interface RequiredDocument {
  documentType: string;
  isSubmitted: boolean;
  documentId?: string;
}

// Equipment
export interface EquipmentItem {
  item: string;
  status: 'pending' | 'ordered' | 'assigned' | 'returned';
  assignedAt?: string;
  serialNumber?: string;
}

// Access
export interface AccessItem {
  system: string;
  status: 'pending' | 'requested' | 'granted' | 'revoked';
  grantedAt?: string;
  grantedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

// Training
export interface TrainingItem {
  course: string;
  isRequired: boolean;
  isCompleted: boolean;
  completedAt?: string;
  certificateUrl?: string;
}

// Main Onboarding interface
export interface Onboarding {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    department?: string;
    hireDate?: string;
  };
  type: OnboardingType;
  status: OnboardingStatus;
  startDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  tasks: OnboardingTask[];
  progress: number;
  completedTasksCount: number;
  totalTasksCount: number;
  hrAssignee?: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  buddy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  requiredDocuments: RequiredDocument[];
  equipmentList: EquipmentItem[];
  accessList: AccessItem[];
  trainingList: TrainingItem[];
  feedbackCollected: boolean;
  feedbackScore?: number;
  feedbackComments?: string;
  feedbackCollectedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Offboarding specific types

export interface EquipmentReturn {
  item: string;
  serialNumber?: string;
  status: 'pending' | 'returned' | 'lost' | 'damaged';
  returnedAt?: string;
  condition?: string;
}

export interface AccessRevoke {
  system: string;
  status: 'active' | 'pending_revocation' | 'revoked';
  revokedAt?: string;
  revokedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Clearance {
  department: string;
  status: 'pending' | 'cleared' | 'issue';
  clearedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  clearedAt?: string;
  notes?: string;
}

export interface ExitDocument {
  documentType: string;
  status: 'pending' | 'generated' | 'signed' | 'delivered';
  documentId?: string;
}

export interface Offboarding {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    department?: string;
  };
  type: OffboardingType;
  status: OnboardingStatus;
  lastWorkingDate: string;
  noticeDate: string;
  exitDate: string;
  tasks: OnboardingTask[];
  progress: number;
  exitInterviewScheduled: boolean;
  exitInterviewDate?: string;
  exitInterviewConductedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  exitInterviewCompleted: boolean;
  exitInterviewNotes?: string;
  exitReasons?: string[];
  knowledgeTransferAssignee?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  knowledgeTransferCompleted: boolean;
  knowledgeTransferNotes?: string;
  equipmentToReturn: EquipmentReturn[];
  accessToRevoke: AccessRevoke[];
  finalPaymentCalculated: boolean;
  finalPaymentAmount?: number;
  ptoBalance?: number;
  clearances: Clearance[];
  exitDocuments: ExitDocument[];
  rehireEligible?: boolean;
  rehireNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics
export interface OnboardingAnalytics {
  onboardingByStatus: Array<{
    _id: string;
    count: number;
  }>;
  avgCompletionDays: number;
  avgFeedbackScore: number | null;
  byType: Array<{
    _id: string;
    count: number;
  }>;
  totalActive: number;
}

export interface OffboardingAnalytics {
  byStatus: Array<{
    _id: string;
    count: number;
  }>;
  byType: Array<{
    _id: string;
    count: number;
  }>;
  exitReasons: Array<{
    _id: string;
    count: number;
  }>;
  rehireStats: Array<{
    _id: boolean;
    count: number;
  }>;
}

// Task template
export interface TaskTemplate {
  title: string;
  category: TaskCategory;
  order: number;
  isRequired: boolean;
  description?: string;
}

// Form inputs
export interface CreateOnboardingInput {
  employeeId: string;
  type?: OnboardingType;
  startDate: string;
  targetCompletionDate: string;
  hrAssigneeId?: string;
  buddyId?: string;
  customTasks?: Partial<OnboardingTask>[];
  requiredDocuments?: RequiredDocument[];
  equipmentList?: EquipmentItem[];
  accessList?: AccessItem[];
  trainingList?: TrainingItem[];
  notes?: string;
}

export interface CreateOffboardingInput {
  employeeId: string;
  type: OffboardingType;
  lastWorkingDate: string;
  noticeDate: string;
  exitDate: string;
  customTasks?: Partial<OnboardingTask>[];
  equipmentToReturn?: EquipmentReturn[];
  accessToRevoke?: AccessRevoke[];
  exitReasons?: string[];
  notes?: string;
}

export interface UpdateTaskInput {
  status?: TaskStatus;
  notes?: string;
}

export interface ExitInterviewInput {
  notes: string;
  reasons: string[];
  rehireEligible: boolean;
  rehireNotes?: string;
}
