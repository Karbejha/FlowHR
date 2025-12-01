'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { EmployeeDocument, DocumentType } from '@/types/document';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { UserRole } from '@/types/auth';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ViewMode = 'my' | 'team';

export default function DocumentsList() {
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | DocumentType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('my');
  const { user, token } = useAuth();
  const { t } = useTranslation();

  const isManagerOrAdmin = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN;

  const fetchDocuments = useCallback(async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const endpoint = viewMode === 'team' && isManagerOrAdmin
        ? `${API_URL}/documents/team`
        : `${API_URL}/documents/my-documents`;
      const { data } = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
      toast.error(t('documents.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [token, viewMode, isManagerOrAdmin, t]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const downloadDocument = async (doc: EmployeeDocument) => {
    window.open(doc.currentFileUrl, '_blank');
  };

  const deleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await axios.delete(`${API_URL}/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Document deleted');
      fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      toast.error('Failed to delete document');
    }
  };

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case DocumentType.CONTRACT:
        return '📝';
      case DocumentType.PERSONAL_ID:
      case DocumentType.PASSPORT:
        return '🆔';
      case DocumentType.VISA:
      case DocumentType.WORK_PERMIT:
        return '✈️';
      case DocumentType.RESUME:
      case DocumentType.CERTIFICATE:
      case DocumentType.TRAINING:
        return '🎓';
      case DocumentType.OFFER_LETTER:
        return '💼';
      case DocumentType.TAX_FORM:
        return '💰';
      case DocumentType.MEDICAL:
        return '🏥';
      default:
        return '📄';
    }
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow && expiry >= new Date();
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const filteredDocuments = filter === 'all' 
    ? documents 
    : documents.filter(d => d.documentType === filter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* View Mode Toggle for Managers/Admins */}
      {isManagerOrAdmin && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('my')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'my'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-500'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-transparent'
            }`}
          >
            {t('documents.myDocuments')}
          </button>
          <button
            onClick={() => setViewMode('team')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'team'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-500'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-transparent'
            }`}
          >
            {t('documents.teamDocuments')}
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {t('common.all')} ({documents.length})
        </button>
        {Object.values(DocumentType).map(type => {
          const count = documents.filter(d => d.documentType === type).length;
          if (count === 0) return null;
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {type.replace(/_/g, ' ')} ({count})
            </button>
          );
        })}
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocuments.map((doc) => (
          <div
            key={doc._id}
            className={`bg-white dark:bg-gray-700 rounded-lg border-2 p-5 shadow-sm hover:shadow-md transition-all ${
              isExpired(doc.expirationDate)
                ? 'border-red-300 dark:border-red-700'
                : isExpiringSoon(doc.expirationDate)
                ? 'border-yellow-300 dark:border-yellow-700'
                : 'border-gray-200 dark:border-gray-600'
            }`}
          >
            {/* Employee Name (Team View) */}
            {viewMode === 'team' && doc.employee && (
              <div className="mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      {doc.employee.firstName?.[0]}{doc.employee.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {doc.employee.firstName} {doc.employee.lastName}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Badge */}
            {(isExpired(doc.expirationDate) || isExpiringSoon(doc.expirationDate)) && (
              <div className="mb-3">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  isExpired(doc.expirationDate)
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                }`}>
                  {isExpired(doc.expirationDate) ? '⚠️ Expired' : '⏰ Expiring Soon'}
                </span>
              </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="text-4xl">{getDocumentIcon(doc.documentType)}</div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
                  {doc.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {doc.documentType.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            {/* Metadata */}
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>
              
              {doc.expirationDate && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs">Expires: {new Date(doc.expirationDate).toLocaleDateString()}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                  v{doc.currentVersion}
                </span>
                {doc.status === 'approved' && (
                  <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => downloadDocument(doc)}
                className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                View
              </button>
              {(user?.role === UserRole.ADMIN || user?._id === doc.employee._id) && (
                <button
                  onClick={() => deleteDocument(doc._id)}
                  aria-label="Delete document"
                  className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">No documents found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Upload your first document to get started</p>
        </div>
      )}
    </div>
  );
}
