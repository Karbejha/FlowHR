'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { UserRole } from '@/types/auth';
import GoalsList from '@/components/performance/GoalsList';
import GoalForm from '@/components/performance/GoalForm';
import ReviewsList from '@/components/performance/ReviewsList';
import ReviewCycleForm from '@/components/performance/ReviewCycleForm';
import FeedbackWall from '@/components/performance/FeedbackWall';
import GiveFeedback from '@/components/performance/GiveFeedback';

type TabType = 'goals' | 'reviews' | 'feedback';

export default function PerformancePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('goals');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showReviewCycleForm, setShowReviewCycleForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFormSuccess = () => {
    setShowGoalForm(false);
    setShowFeedbackForm(false);
    setShowReviewCycleForm(false);
    setRefreshKey(prev => prev + 1);
  };

  const tabs = [
    { id: 'goals' as TabType, label: t('performance.tabs.goals'), icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { id: 'reviews' as TabType, label: t('performance.tabs.reviews'), icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { id: 'feedback' as TabType, label: t('performance.tabs.feedback'), icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    )},
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 pb-safe-left pr-safe-right">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 max-w-[1600px]">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
              {t('performance.title')}
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {t('performance.subtitle')}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-2 sm:space-x-8 px-4 sm:px-6 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                    ${activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'goals' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('performance.goals.title')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('performance.goals.subtitle')}</p>
                  </div>
                  <button
                    onClick={() => setShowGoalForm(!showGoalForm)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-sm w-full sm:w-auto"
                  >
                    {showGoalForm ? (
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
                        {t('performance.goals.newGoal')}
                      </>
                    )}
                  </button>
                </div>

                {showGoalForm && (
                  <div className="mb-6">
                    <GoalForm onSuccess={handleFormSuccess} onCancel={() => setShowGoalForm(false)} />
                  </div>
                )}

                <GoalsList key={refreshKey} />
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('performance.reviews.title')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('performance.reviews.subtitle')}</p>
                  </div>
                  {(user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN) && (
                    <button
                      onClick={() => setShowReviewCycleForm(!showReviewCycleForm)}
                      className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-sm w-full sm:w-auto"
                    >
                      {showReviewCycleForm ? (
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
                          {t('performance.reviews.createCycle')}
                        </>
                      )}
                    </button>
                  )}
                </div>

                {showReviewCycleForm && (
                  <div className="mb-6">
                    <ReviewCycleForm onSuccess={handleFormSuccess} onCancel={() => setShowReviewCycleForm(false)} />
                  </div>
                )}

                <ReviewsList key={refreshKey} />
              </div>
            )}

            {activeTab === 'feedback' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('performance.feedback.title')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('performance.feedback.subtitle')}</p>
                  </div>
                  <button
                    onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-sm w-full sm:w-auto"
                  >
                    {showFeedbackForm ? (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {t('common.cancel')}
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        {t('performance.feedback.giveRecognition')}
                      </>
                    )}
                  </button>
                </div>

                {showFeedbackForm && (
                  <div className="mb-6">
                    <GiveFeedback onSuccess={handleFormSuccess} onCancel={() => setShowFeedbackForm(false)} />
                  </div>
                )}

                <FeedbackWall key={refreshKey} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
