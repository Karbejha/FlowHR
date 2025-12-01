// Document Management Types

export enum DocumentType {
  PERSONAL_ID = 'personal_id',
  PASSPORT = 'passport',
  VISA = 'visa',
  WORK_PERMIT = 'work_permit',
  RESUME = 'resume',
  CONTRACT = 'contract',
  OFFER_LETTER = 'offer_letter',
  NDA = 'nda',
  PERFORMANCE_REVIEW = 'performance_review',
  CERTIFICATE = 'certificate',
  LICENSE = 'license',
  TRAINING = 'training',
  POLICY_ACKNOWLEDGMENT = 'policy_acknowledgment',
  EMERGENCY_CONTACT = 'emergency_contact',
  TAX_FORM = 'tax_form',
  BANK_DETAILS = 'bank_details',
  MEDICAL = 'medical',
  BACKGROUND_CHECK = 'background_check',
  REFERENCE = 'reference',
  EXIT_INTERVIEW = 'exit_interview',
  OTHER = 'other'
}

export enum DocumentStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  ARCHIVED = 'archived'
}

export enum DocumentAccessLevel {
  SELF = 'self',
  MANAGER = 'manager',
  HR = 'hr',
  PUBLIC = 'public'
}

export interface DocumentVersion {
  _id: string;
  version: number;
  fileUrl: string;
  fileSize: number;
  uploadedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  uploadedAt: string;
  notes?: string;
}

export interface DocumentAudit {
  _id: string;
  action: string;
  performedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  performedAt: string;
  details?: string;
  ipAddress?: string;
}

export interface EmployeeDocument {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    department?: string;
  };
  title: string;
  description?: string;
  documentType: DocumentType;
  status: DocumentStatus;
  accessLevel: DocumentAccessLevel;
  currentFileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  versions: DocumentVersion[];
  currentVersion: number;
  category?: string;
  tags: string[];
  issueDate?: string;
  expirationDate?: string;
  expirationReminderSent: boolean;
  uploadedBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reviewedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  requiresSignature: boolean;
  signedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  signedAt?: string;
  signatureData?: string;
  auditLog: DocumentAudit[];
  relatedTo?: {
    entityType: string;
    entityId: string;
  };
  isConfidential: boolean;
  retentionPeriod?: number;
  gdprRelevant: boolean;
  createdAt: string;
  updatedAt: string;
}

// Document type configuration
export interface DocumentTypeConfig {
  name: string;
  requiresExpiration: boolean;
  requiresApproval: boolean;
  defaultRetention: number;
}

// Document analytics
export interface DocumentAnalytics {
  byType: Array<{
    type: string;
    name: string;
    count: number;
  }>;
  byStatus: Array<{
    _id: string;
    count: number;
  }>;
  expiringSoon: number;
  expired: number;
  pendingSignatures: number;
}

// Form types for creating/updating documents
export interface CreateDocumentInput {
  employeeId?: string;
  title: string;
  description?: string;
  documentType: DocumentType;
  accessLevel?: DocumentAccessLevel;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category?: string;
  tags?: string[];
  issueDate?: string;
  expirationDate?: string;
  requiresSignature?: boolean;
  isConfidential?: boolean;
  relatedTo?: {
    entityType: string;
    entityId: string;
  };
}

export interface UpdateDocumentInput {
  title?: string;
  description?: string;
  accessLevel?: DocumentAccessLevel;
  category?: string;
  tags?: string[];
  issueDate?: string;
  expirationDate?: string;
  isConfidential?: boolean;
}

export interface UploadVersionInput {
  fileUrl: string;
  fileSize: number;
  notes?: string;
}

export interface ReviewDocumentInput {
  status: DocumentStatus.APPROVED | DocumentStatus.REJECTED;
  reviewNotes?: string;
}

export interface SignDocumentInput {
  signatureData: string;
}
