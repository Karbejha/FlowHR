import { Request, Response } from 'express';
import { EmployeeDocument, DocumentStatus, DocumentType, DocumentAccessLevel, DOCUMENT_TYPE_CONFIG } from '../models/Document';
import { User, UserRole } from '../models/User';
import { getTeamMembers } from '../utils/userUtils';
import { logError, logInfo } from '../utils/logger';
import mongoose from 'mongoose';

// Upload document
export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      employeeId,
      title,
      description,
      documentType,
      accessLevel,
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      category,
      tags,
      issueDate,
      expirationDate,
      requiresSignature,
      isConfidential,
      relatedTo,
    } = req.body;

    // Determine target employee
    let targetEmployeeId = req.user._id;
    
    if (employeeId && employeeId !== req.user._id.toString()) {
      // Check permission to upload for another employee
      if (req.user.role === UserRole.EMPLOYEE) {
        res.status(403).json({ error: 'Not authorized to upload documents for other employees' });
        return;
      }
      
      if (req.user.role === UserRole.MANAGER) {
        const teamMembers = await getTeamMembers(req.user._id);
        if (!teamMembers.some((m: any) => m._id.toString() === employeeId)) {
          res.status(403).json({ error: 'Not authorized to upload documents for this employee' });
          return;
        }
      }
      targetEmployeeId = employeeId;
    }

    const document = new EmployeeDocument({
      employee: targetEmployeeId,
      title,
      description,
      documentType: documentType || DocumentType.OTHER,
      status: DocumentStatus.DRAFT,
      accessLevel: accessLevel || DocumentAccessLevel.HR,
      currentFileUrl: fileUrl,
      fileName,
      fileSize,
      mimeType,
      category,
      tags: tags || [],
      issueDate: issueDate ? new Date(issueDate) : undefined,
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      uploadedBy: req.user._id,
      requiresSignature: requiresSignature || false,
      isConfidential: isConfidential || false,
      relatedTo,
      retentionPeriod: (DOCUMENT_TYPE_CONFIG as any)[documentType]?.defaultRetention || 36,
    });

    await document.save();
    await document.populate('employee', 'firstName lastName email');
    await document.populate('uploadedBy', 'firstName lastName');

    logInfo('Document uploaded', { documentId: document._id, employeeId: targetEmployeeId, uploadedBy: req.user._id });
    res.status(201).json(document);
  } catch (error) {
    logError('Error uploading document', { error: error instanceof Error ? error.message : error });
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error uploading document' });
  }
};

// Get my documents
export const getMyDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentType, status, category } = req.query;
    
    const query: any = { employee: req.user._id };
    if (documentType) query.documentType = documentType;
    if (status) query.status = status;
    if (category) query.category = category;

    const documents = await EmployeeDocument.find(query)
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName')
      .populate('employee', 'firstName lastName email department')
      .select('-auditLog -versions'); // Exclude audit log for list view

    res.json(documents);
  } catch (error) {
    logError('Error fetching my documents', { error: error instanceof Error ? error.message : error });
    res.status(500).json({ error: 'Error fetching documents' });
  }
};

// Get team documents (for managers/admins)
export const getTeamDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentType, status, category } = req.query;
    
    // Only managers and admins can view team documents
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized to view team documents' });
      return;
    }

    let employeeIds: mongoose.Types.ObjectId[] = [];
    
    if (req.user.role === UserRole.MANAGER) {
      // Get team members for manager
      const teamMembers = await getTeamMembers(req.user._id);
      employeeIds = teamMembers.map((m: any) => m._id);
    } else if (req.user.role === UserRole.ADMIN) {
      // Admin can see all employees' documents
      const allEmployees = await User.find({ isActive: true }).select('_id');
      employeeIds = allEmployees.map(e => e._id as mongoose.Types.ObjectId);
    }

    const query: any = { employee: { $in: employeeIds } };
    if (documentType) query.documentType = documentType;
    if (status) query.status = status;
    if (category) query.category = category;

    // Access level filter for manager
    if (req.user.role === UserRole.MANAGER) {
      query.accessLevel = { $in: [DocumentAccessLevel.MANAGER, DocumentAccessLevel.HR, DocumentAccessLevel.PUBLIC] };
    }

    const documents = await EmployeeDocument.find(query)
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName')
      .populate('employee', 'firstName lastName email department')
      .select('-auditLog -versions');

    res.json(documents);
  } catch (error) {
    logError('Error fetching team documents', { error: error instanceof Error ? error.message : error });
    res.status(500).json({ error: 'Error fetching team documents' });
  }
};

// Get employee documents (for managers/admin)
export const getEmployeeDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    
    if (req.user.role === UserRole.EMPLOYEE && req.user._id.toString() !== employeeId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Check manager permission
    if (req.user.role === UserRole.MANAGER) {
      const teamMembers = await getTeamMembers(req.user._id);
      if (!teamMembers.some((m: any) => m._id.toString() === employeeId) && 
          req.user._id.toString() !== employeeId) {
        res.status(403).json({ error: 'Not authorized to view documents for this employee' });
        return;
      }
    }

    // Build access level filter based on role
    let accessFilter: any = {};
    if (req.user.role === UserRole.EMPLOYEE) {
      accessFilter = {}; // Own documents - no access filter
    } else if (req.user.role === UserRole.MANAGER) {
      accessFilter = { accessLevel: { $in: [DocumentAccessLevel.MANAGER, DocumentAccessLevel.HR, DocumentAccessLevel.PUBLIC] } };
    }
    // Admin can see all

    const { documentType, status } = req.query;
    const query: any = { 
      employee: employeeId,
      ...accessFilter,
    };
    if (documentType) query.documentType = documentType;
    if (status) query.status = status;

    const documents = await EmployeeDocument.find(query)
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName')
      .select('-auditLog');

    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching employee documents' });
  }
};

// Get document by ID
export const getDocumentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    
    const document = await EmployeeDocument.findById(documentId)
      .populate('employee', 'firstName lastName email department')
      .populate('uploadedBy', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName')
      .populate('signedBy', 'firstName lastName')
      .populate('auditLog.performedBy', 'firstName lastName');

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Check access permission
    const isOwner = document.employee._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;
    
    let hasAccess = isOwner || isAdmin;
    
    if (!hasAccess && req.user.role === UserRole.MANAGER) {
      const teamMembers = await getTeamMembers(req.user._id);
      const isTeamMember = teamMembers.some((m: any) => m._id.toString() === document.employee._id.toString());
      hasAccess = isTeamMember && 
        [DocumentAccessLevel.MANAGER, DocumentAccessLevel.HR, DocumentAccessLevel.PUBLIC].includes(document.accessLevel);
    }

    if (!hasAccess) {
      res.status(403).json({ error: 'Not authorized to view this document' });
      return;
    }

    // Log document view
    document.auditLog.push({
      action: 'viewed',
      performedBy: req.user._id,
      performedAt: new Date(),
      details: `Document viewed by ${req.user.firstName} ${req.user.lastName}`,
    } as any);
    await document.save();

    res.json(document);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching document' });
  }
};

// Update document
export const updateDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const updates = req.body;

    const document = await EmployeeDocument.findById(documentId);
    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Check permission
    const isOwner = document.employee.toString() === req.user._id.toString();
    const isUploader = document.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isOwner && !isUploader && !isAdmin) {
      res.status(403).json({ error: 'Not authorized to update this document' });
      return;
    }

    // Update allowed fields
    const allowedUpdates = [
      'title', 'description', 'accessLevel', 'category', 'tags',
      'issueDate', 'expirationDate', 'isConfidential'
    ];

    const changedFields: string[] = [];
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined && (document as any)[key] !== updates[key]) {
        changedFields.push(key);
        (document as any)[key] = updates[key];
      }
    }

    // Log update
    if (changedFields.length > 0) {
      document.auditLog.push({
        action: 'updated',
        performedBy: req.user._id,
        performedAt: new Date(),
        details: `Updated fields: ${changedFields.join(', ')}`,
      } as any);
    }

    await document.save();
    logInfo('Document updated', { documentId, updatedBy: req.user._id, fields: changedFields });
    res.json(document);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Error updating document' });
  }
};

// Upload new version
export const uploadNewVersion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const { fileUrl, fileSize, notes } = req.body;

    const document = await EmployeeDocument.findById(documentId);
    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Check permission
    const isOwner = document.employee.toString() === req.user._id.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;
    const isHR = req.user.role === UserRole.MANAGER || req.user.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin && !isHR) {
      res.status(403).json({ error: 'Not authorized to update this document' });
      return;
    }

    // Add new version
    const newVersion = document.currentVersion + 1;
    document.versions.push({
      version: newVersion,
      fileUrl,
      fileSize,
      uploadedBy: req.user._id,
      uploadedAt: new Date(),
      notes,
    } as any);

    document.currentVersion = newVersion;
    document.currentFileUrl = fileUrl;
    document.fileSize = fileSize;

    // Log version update
    document.auditLog.push({
      action: 'updated',
      performedBy: req.user._id,
      performedAt: new Date(),
      details: `New version ${newVersion} uploaded`,
    } as any);

    // Reset approval status if document was already approved
    if (document.status === DocumentStatus.APPROVED) {
      document.status = DocumentStatus.PENDING_REVIEW;
    }

    await document.save();
    logInfo('Document version uploaded', { documentId, version: newVersion, uploadedBy: req.user._id });
    res.json(document);
  } catch (error) {
    res.status(400).json({ error: 'Error uploading new version' });
  }
};

// Review document (approve/reject)
export const reviewDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized to review documents' });
      return;
    }

    const { documentId } = req.params;
    const { status, reviewNotes } = req.body;

    if (![DocumentStatus.APPROVED, DocumentStatus.REJECTED].includes(status)) {
      res.status(400).json({ error: 'Invalid status. Must be approved or rejected' });
      return;
    }

    const document = await EmployeeDocument.findById(documentId);
    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    // Check manager permission
    if (req.user.role === UserRole.MANAGER) {
      const teamMembers = await getTeamMembers(req.user._id);
      if (!teamMembers.some((m: any) => m._id.toString() === document.employee.toString())) {
        res.status(403).json({ error: 'Not authorized to review documents for this employee' });
        return;
      }
    }

    document.status = status;
    document.reviewedBy = req.user._id;
    document.reviewedAt = new Date();
    document.reviewNotes = reviewNotes;

    // Log review
    document.auditLog.push({
      action: status === DocumentStatus.APPROVED ? 'approved' : 'rejected',
      performedBy: req.user._id,
      performedAt: new Date(),
      details: reviewNotes || `Document ${status}`,
    } as any);

    await document.save();
    logInfo('Document reviewed', { documentId, status, reviewedBy: req.user._id });
    res.json(document);
  } catch (error) {
    res.status(400).json({ error: 'Error reviewing document' });
  }
};

// Sign document
export const signDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const { signatureData } = req.body;

    const document = await EmployeeDocument.findById(documentId);
    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    if (!document.requiresSignature) {
      res.status(400).json({ error: 'This document does not require a signature' });
      return;
    }

    // Only document owner can sign
    if (document.employee.toString() !== req.user._id.toString()) {
      res.status(403).json({ error: 'Only the document owner can sign' });
      return;
    }

    if (document.signedAt) {
      res.status(400).json({ error: 'Document already signed' });
      return;
    }

    document.signedBy = req.user._id;
    document.signedAt = new Date();
    document.signatureData = signatureData;

    // Log signature
    document.auditLog.push({
      action: 'signed',
      performedBy: req.user._id,
      performedAt: new Date(),
      details: 'Document signed electronically',
    } as any);

    await document.save();
    logInfo('Document signed', { documentId, signedBy: req.user._id });
    res.json(document);
  } catch (error) {
    res.status(400).json({ error: 'Error signing document' });
  }
};

// Delete document
export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const document = await EmployeeDocument.findById(documentId);

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    const isOwner = document.employee.toString() === req.user._id.toString();
    const isAdmin = req.user.role === UserRole.ADMIN;

    // Only allow deletion of draft documents, or by admin
    if (document.status !== DocumentStatus.DRAFT && !isAdmin) {
      res.status(400).json({ error: 'Can only delete draft documents' });
      return;
    }

    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: 'Not authorized to delete this document' });
      return;
    }

    await EmployeeDocument.findByIdAndDelete(documentId);
    logInfo('Document deleted', { documentId, deletedBy: req.user._id });
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Error deleting document' });
  }
};

// Archive document
export const archiveDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized to archive documents' });
      return;
    }

    const { documentId } = req.params;
    const document = await EmployeeDocument.findById(documentId);

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    document.status = DocumentStatus.ARCHIVED;
    document.auditLog.push({
      action: 'archived',
      performedBy: req.user._id,
      performedAt: new Date(),
      details: 'Document archived',
    } as any);

    await document.save();
    res.json(document);
  } catch (error) {
    res.status(400).json({ error: 'Error archiving document' });
  }
};

// Get expiring documents
export const getExpiringDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const { daysAhead = 30 } = req.query;
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + Number(daysAhead));

    let employeeFilter: any = {};
    if (req.user.role === UserRole.MANAGER) {
      const teamMembers = await getTeamMembers(req.user._id);
      employeeFilter = { employee: { $in: teamMembers.map(m => m._id) } };
    }

    const documents = await EmployeeDocument.find({
      ...employeeFilter,
      expirationDate: {
        $gte: new Date(),
        $lte: warningDate,
      },
      status: { $ne: DocumentStatus.ARCHIVED },
    })
      .sort({ expirationDate: 1 })
      .populate('employee', 'firstName lastName email department');

    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching expiring documents' });
  }
};

// Get expired documents
export const getExpiredDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    let employeeFilter: any = {};
    if (req.user.role === UserRole.MANAGER) {
      const teamMembers = await getTeamMembers(req.user._id);
      employeeFilter = { employee: { $in: teamMembers.map(m => m._id) } };
    }

    const documents = await EmployeeDocument.find({
      ...employeeFilter,
      expirationDate: { $lt: new Date() },
      status: { $ne: DocumentStatus.ARCHIVED },
    })
      .sort({ expirationDate: -1 })
      .populate('employee', 'firstName lastName email department');

    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching expired documents' });
  }
};

// Get pending review documents
export const getPendingDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    let employeeFilter: any = {};
    if (req.user.role === UserRole.MANAGER) {
      const teamMembers = await getTeamMembers(req.user._id);
      employeeFilter = { employee: { $in: teamMembers.map(m => m._id) } };
    }

    const documents = await EmployeeDocument.find({
      ...employeeFilter,
      status: DocumentStatus.PENDING_REVIEW,
    })
      .sort({ createdAt: -1 })
      .populate('employee', 'firstName lastName email department')
      .populate('uploadedBy', 'firstName lastName');

    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching pending documents' });
  }
};

// Get document analytics
export const getDocumentAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user.role === UserRole.EMPLOYEE) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    let matchQuery: any = {};
    if (req.user.role === UserRole.MANAGER) {
      const teamMembers = await getTeamMembers(req.user._id);
      matchQuery = { employee: { $in: teamMembers.map(m => m._id) } };
    }

    // Documents by type
    const byType = await EmployeeDocument.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$documentType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Documents by status
    const byStatus = await EmployeeDocument.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Expiring soon count
    const thirtyDaysAhead = new Date();
    thirtyDaysAhead.setDate(thirtyDaysAhead.getDate() + 30);
    
    const expiringSoon = await EmployeeDocument.countDocuments({
      ...matchQuery,
      expirationDate: { $gte: new Date(), $lte: thirtyDaysAhead },
      status: { $ne: DocumentStatus.ARCHIVED },
    });

    // Expired count
    const expired = await EmployeeDocument.countDocuments({
      ...matchQuery,
      expirationDate: { $lt: new Date() },
      status: { $ne: DocumentStatus.ARCHIVED },
    });

    // Pending signatures
    const pendingSignatures = await EmployeeDocument.countDocuments({
      ...matchQuery,
      requiresSignature: true,
      signedAt: { $exists: false },
    });

    res.json({
      byType: byType.map(t => ({
        type: t._id,
        name: (DOCUMENT_TYPE_CONFIG as any)[t._id]?.name || t._id,
        count: t.count,
      })),
      byStatus,
      expiringSoon,
      expired,
      pendingSignatures,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching document analytics' });
  }
};

// Get document types config
export const getDocumentTypes = async (_req: Request, res: Response): Promise<void> => {
  res.json(DOCUMENT_TYPE_CONFIG);
};

// Log document download
export const logDocumentDownload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const document = await EmployeeDocument.findById(documentId);

    if (!document) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    document.auditLog.push({
      action: 'downloaded',
      performedBy: req.user._id,
      performedAt: new Date(),
      details: `Document downloaded by ${req.user.firstName} ${req.user.lastName}`,
      ipAddress: req.ip,
    } as any);

    await document.save();
    res.json({ message: 'Download logged' });
  } catch (error) {
    res.status(400).json({ error: 'Error logging download' });
  }
};
