import mongoose, { Document, Schema } from 'mongoose';

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
  SELF = 'self', // Only the employee
  MANAGER = 'manager', // Employee and their manager
  HR = 'hr', // Employee, manager, and HR/Admin
  PUBLIC = 'public' // Anyone in the company
}

interface IDocumentVersion {
  version: number;
  fileUrl: string;
  fileSize: number;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
  notes?: string;
}

interface IDocumentAudit {
  action: string;
  performedBy: mongoose.Types.ObjectId;
  performedAt: Date;
  details?: string;
  ipAddress?: string;
}

interface IDocument extends Document {
  employee: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  documentType: DocumentType;
  status: DocumentStatus;
  accessLevel: DocumentAccessLevel;
  
  // File information
  currentFileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  
  // Versioning
  versions: IDocumentVersion[];
  currentVersion: number;
  
  // Metadata
  category?: string;
  tags: string[];
  
  // Dates
  issueDate?: Date;
  expirationDate?: Date;
  expirationReminderSent: boolean;
  
  // Workflow
  uploadedBy: mongoose.Types.ObjectId;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  
  // E-Signature
  requiresSignature: boolean;
  signedBy?: mongoose.Types.ObjectId;
  signedAt?: Date;
  signatureData?: string;
  
  // Audit trail
  auditLog: IDocumentAudit[];
  
  // Related entities
  relatedTo?: {
    entityType: string;
    entityId: mongoose.Types.ObjectId;
  };
  
  // Compliance
  isConfidential: boolean;
  retentionPeriod?: number; // In months
  gdprRelevant: boolean;
}

const documentVersionSchema = new Schema({
  version: {
    type: Number,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  notes: String,
}, { _id: true });

const documentAuditSchema = new Schema({
  action: {
    type: String,
    required: true, // 'created', 'viewed', 'downloaded', 'updated', 'deleted', 'signed', 'shared'
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  performedAt: {
    type: Date,
    default: Date.now,
  },
  details: String,
  ipAddress: String,
}, { _id: true });

const documentSchema = new Schema({
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
    maxlength: 1000,
  },
  documentType: {
    type: String,
    enum: Object.values(DocumentType),
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: Object.values(DocumentStatus),
    default: DocumentStatus.DRAFT,
  },
  accessLevel: {
    type: String,
    enum: Object.values(DocumentAccessLevel),
    default: DocumentAccessLevel.HR,
  },
  
  // File information
  currentFileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  
  // Versioning
  versions: [documentVersionSchema],
  currentVersion: {
    type: Number,
    default: 1,
  },
  
  // Metadata
  category: String, // Custom category
  tags: [{
    type: String,
    trim: true,
  }],
  
  // Dates
  issueDate: Date,
  expirationDate: {
    type: Date,
    index: true,
  },
  expirationReminderSent: {
    type: Boolean,
    default: false,
  },
  
  // Workflow
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: Date,
  reviewNotes: String,
  
  // E-Signature
  requiresSignature: {
    type: Boolean,
    default: false,
  },
  signedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  signedAt: Date,
  signatureData: String, // Base64 signature image or cryptographic signature
  
  // Audit trail
  auditLog: [documentAuditSchema],
  
  // Related entities
  relatedTo: {
    entityType: String, // 'leave', 'payroll', 'performance_review', 'onboarding', etc.
    entityId: mongoose.Schema.Types.ObjectId,
  },
  
  // Compliance
  isConfidential: {
    type: Boolean,
    default: false,
  },
  retentionPeriod: {
    type: Number, // In months
    default: 84, // 7 years default
  },
  gdprRelevant: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Check for expiring documents
documentSchema.methods.isExpiringSoon = function(daysAhead: number = 30): boolean {
  if (!this.expirationDate) return false;
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + daysAhead);
  return this.expirationDate <= warningDate && this.expirationDate > new Date();
};

// Auto-update status for expired documents
documentSchema.pre('save', function(next) {
  if (this.expirationDate && new Date() > this.expirationDate) {
    this.status = DocumentStatus.EXPIRED;
  }
  
  // Add audit log for new documents
  if (this.isNew) {
    this.auditLog.push({
      action: 'created',
      performedBy: this.uploadedBy,
      performedAt: new Date(),
      details: `Document created: ${this.title}`,
    } as any);
    
    // Initialize first version
    this.versions.push({
      version: 1,
      fileUrl: this.currentFileUrl,
      fileSize: this.fileSize,
      uploadedBy: this.uploadedBy,
      uploadedAt: new Date(),
    } as any);
  }
  
  next();
});

// Indexes for efficient queries
documentSchema.index({ employee: 1, documentType: 1 });
documentSchema.index({ employee: 1, status: 1 });
documentSchema.index({ expirationDate: 1, status: 1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ 'relatedTo.entityType': 1, 'relatedTo.entityId': 1 });

export const EmployeeDocument = mongoose.model<IDocument>('EmployeeDocument', documentSchema);

// Document type configurations
export const DOCUMENT_TYPE_CONFIG = {
  [DocumentType.PERSONAL_ID]: {
    name: 'Personal ID',
    requiresExpiration: true,
    requiresApproval: true,
    defaultRetention: 84, // 7 years
  },
  [DocumentType.PASSPORT]: {
    name: 'Passport',
    requiresExpiration: true,
    requiresApproval: true,
    defaultRetention: 84,
  },
  [DocumentType.VISA]: {
    name: 'Visa',
    requiresExpiration: true,
    requiresApproval: true,
    defaultRetention: 84,
  },
  [DocumentType.WORK_PERMIT]: {
    name: 'Work Permit',
    requiresExpiration: true,
    requiresApproval: true,
    defaultRetention: 84,
  },
  [DocumentType.RESUME]: {
    name: 'Resume/CV',
    requiresExpiration: false,
    requiresApproval: false,
    defaultRetention: 36,
  },
  [DocumentType.CONTRACT]: {
    name: 'Employment Contract',
    requiresExpiration: false,
    requiresApproval: true,
    defaultRetention: 120, // 10 years
  },
  [DocumentType.OFFER_LETTER]: {
    name: 'Offer Letter',
    requiresExpiration: false,
    requiresApproval: true,
    defaultRetention: 84,
  },
  [DocumentType.NDA]: {
    name: 'Non-Disclosure Agreement',
    requiresExpiration: false,
    requiresApproval: true,
    defaultRetention: 120,
  },
  [DocumentType.PERFORMANCE_REVIEW]: {
    name: 'Performance Review',
    requiresExpiration: false,
    requiresApproval: false,
    defaultRetention: 60,
  },
  [DocumentType.CERTIFICATE]: {
    name: 'Certificate',
    requiresExpiration: true,
    requiresApproval: false,
    defaultRetention: 84,
  },
  [DocumentType.LICENSE]: {
    name: 'Professional License',
    requiresExpiration: true,
    requiresApproval: true,
    defaultRetention: 84,
  },
  [DocumentType.TRAINING]: {
    name: 'Training Record',
    requiresExpiration: false,
    requiresApproval: false,
    defaultRetention: 60,
  },
  [DocumentType.POLICY_ACKNOWLEDGMENT]: {
    name: 'Policy Acknowledgment',
    requiresExpiration: false,
    requiresApproval: false,
    defaultRetention: 84,
  },
  [DocumentType.TAX_FORM]: {
    name: 'Tax Form',
    requiresExpiration: false,
    requiresApproval: true,
    defaultRetention: 84,
  },
  [DocumentType.MEDICAL]: {
    name: 'Medical Document',
    requiresExpiration: true,
    requiresApproval: true,
    defaultRetention: 84,
  },
  [DocumentType.OTHER]: {
    name: 'Other',
    requiresExpiration: false,
    requiresApproval: false,
    defaultRetention: 36,
  },
};
