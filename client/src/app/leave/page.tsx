'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { UserRole } from '@/types/auth';
import LeaveRequestForm from '@/components/leave/LeaveRequestForm';
import LeaveList from '@/components/leave/LeaveList';
import LeaveBalance from '@/components/leave/LeaveBalance';
import AuthGuard from '@/components/auth/AuthGuard';
import { useState } from 'react';

export default function LeavePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);

  return (    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 pb-safe-left pr-safe-right">
        <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {t('navigation.leaveManagement')}
              </h1>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {t('leave.manageLeaveDescription')}
            </p>
          </div>          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Leave Balance - Sidebar for all users */}
            <div className="xl:col-span-1 xl:order-2">
              <div className="xl:sticky xl:top-6">
                <LeaveBalance />
              </div>
            </div>

            {/* Main Leave Requests Section */}
            <div className="xl:col-span-2 xl:order-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {t('leave.leaveRequests')}
                      </h2>
                    </div>
                    {user?.role === UserRole.EMPLOYEE && (
                      <button
                        onClick={() => setShowRequestForm(!showRequestForm)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 font-medium text-sm shadow-sm w-full sm:w-auto"
                      >                        {showRequestForm ? (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            {t('common.cancel')}
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            {t('leave.newRequest')}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>                
                <div className="p-4 sm:p-6">
                  {showRequestForm && (
                    <div className="mb-4 sm:mb-6">
                      <LeaveRequestForm
                        onSubmitSuccess={() => setShowRequestForm(false)}
                      />
                    </div>
                  )}
                  
                  <div className="overflow-hidden">
                    <LeaveList />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}