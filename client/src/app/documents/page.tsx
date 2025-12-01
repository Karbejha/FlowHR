'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { UserRole } from '@/types/auth';
import DocumentsList from '@/components/documents/DocumentsList';
import DocumentUploader from '@/components/documents/DocumentUploader';

export default function DocumentsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [showUploader, setShowUploader] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setShowUploader(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 pb-safe-left pr-safe-right">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-[1600px]">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
              {t('documents.title')}
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {t('documents.subtitle')}
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('documents.myDocuments')}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.role === UserRole.EMPLOYEE 
                    ? t('documents.employeeView')
                    : t('documents.managerView')
                  }
                </p>
              </div>
              <button
                onClick={() => setShowUploader(!showUploader)}
                className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-sm w-full sm:w-auto"
              >
                {showUploader ? (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {t('common.cancel')}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {t('documents.uploadDocument')}
                  </>
                )}
              </button>
            </div>

            {showUploader && (
              <div className="mb-6">
                <DocumentUploader onSuccess={handleUploadSuccess} onCancel={() => setShowUploader(false)} />
              </div>
            )}

            <DocumentsList key={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
}
