'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { UserRole } from '@/types/auth';
import OnboardingChecklist from '@/components/onboarding/OnboardingChecklist';
import CreateOnboarding from '@/components/onboarding/CreateOnboarding';

export default function OnboardingPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 pb-safe-left pr-safe-right">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-[1600px]">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
              {t('onboarding.title')}
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {t('onboarding.subtitle')}
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {user?.role === UserRole.EMPLOYEE ? t('onboarding.myOnboarding') : t('onboarding.onboardingManagement')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.role === UserRole.EMPLOYEE 
                    ? t('onboarding.employeeView')
                    : t('onboarding.managerView')
                  }
                </p>
              </div>
              {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && (
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-sm w-full sm:w-auto"
                >
                  {showCreateForm ? (
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
                      {t('onboarding.createOnboarding')}
                    </>
                  )}
                </button>
              )}
            </div>

            {showCreateForm && (
              <div className="mb-6">
                <CreateOnboarding onSuccess={handleCreateSuccess} onCancel={() => setShowCreateForm(false)} />
              </div>
            )}

            <OnboardingChecklist key={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
}
