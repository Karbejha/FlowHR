import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  uploadDocument,
  getMyDocuments,
  getTeamDocuments,
  getEmployeeDocuments,
  getDocumentById,
  updateDocument,
  uploadNewVersion,
  reviewDocument,
  signDocument,
  deleteDocument,
  archiveDocument,
  getExpiringDocuments,
  getExpiredDocuments,
  getPendingDocuments,
  getDocumentAnalytics,
  getDocumentTypes,
  logDocumentDownload,
} from '../controllers/documentController';

const router = express.Router();

// Convert async handler to express middleware
const asyncMiddleware = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler => 
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Metadata
router.get('/types', authenticate, asyncMiddleware(getDocumentTypes));

// Employee document routes
router.get('/my', authenticate, asyncMiddleware(getMyDocuments));
router.get('/my-documents', authenticate, asyncMiddleware(getMyDocuments)); // Alias for frontend
router.get('/team', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(getTeamDocuments));
router.post('/upload', authenticate, asyncMiddleware(uploadDocument));

// Manager/Admin routes
router.get('/employee/:employeeId', authenticate, asyncMiddleware(getEmployeeDocuments));
router.get('/expiring', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(getExpiringDocuments));
router.get('/expired', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(getExpiredDocuments));
router.get('/pending', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(getPendingDocuments));
router.get('/analytics', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(getDocumentAnalytics));

// Document operations
router.get('/:documentId', authenticate, asyncMiddleware(getDocumentById));
router.put('/:documentId', authenticate, asyncMiddleware(updateDocument));
router.post('/:documentId/version', authenticate, asyncMiddleware(uploadNewVersion));
router.post('/:documentId/review', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(reviewDocument));
router.post('/:documentId/sign', authenticate, asyncMiddleware(signDocument));
router.post('/:documentId/archive', authenticate, authorize(UserRole.MANAGER, UserRole.ADMIN), asyncMiddleware(archiveDocument));
router.post('/:documentId/download', authenticate, asyncMiddleware(logDocumentDownload));
router.delete('/:documentId', authenticate, asyncMiddleware(deleteDocument));

export default router;
