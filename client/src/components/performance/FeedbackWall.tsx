'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Feedback, FeedbackType } from '@/types/performance';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { UserRole } from '@/types/auth';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ViewMode = 'received' | 'given' | 'all';

export default function FeedbackWall() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | FeedbackType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('received');
  const { token, user } = useAuth();
  const { t } = useTranslation();

  const isAdminOrManager = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;

  const fetchFeedback = useCallback(async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      let endpoint = '/performance/feedback/my-feedback';
      
      if (viewMode === 'given') {
        endpoint = '/performance/feedback/given';
      } else if (viewMode === 'all' && isAdminOrManager) {
        endpoint = '/performance/feedback/all';
      }
      
      const { data } = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(data);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      toast.error(t('performance.feedback.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [token, viewMode, isAdminOrManager, t]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const acknowledgeFeedback = async (feedbackId: string) => {
    if (!token) return;
    
    try {
      await axios.post(`${API_URL}/performance/feedback/${feedbackId}/acknowledge`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('performance.feedback.acknowledged'));
      fetchFeedback();
    } catch (err) {
      console.error('Error acknowledging feedback:', err);
      toast.error(t('performance.feedback.acknowledgeFailed'));
    }
  };

  const getTypeIcon = (type: FeedbackType) => {
    switch (type) {
      case FeedbackType.PRAISE:
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        );
      case FeedbackType.CONSTRUCTIVE:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case FeedbackType.SUGGESTION:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        );
    }
  };

  const getTypeColor = (type: FeedbackType) => {
    switch (type) {
      case FeedbackType.PRAISE:
        return {
          bg: 'bg-pink-50 dark:bg-pink-900/20',
          border: 'border-pink-200 dark:border-pink-800',
          text: 'text-pink-600 dark:text-pink-400',
          badge: 'bg-pink-100 dark:bg-pink-900/40 text-pink-800 dark:text-pink-300'
        };
      case FeedbackType.CONSTRUCTIVE:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300'
        };
      case FeedbackType.SUGGESTION:
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-600 dark:text-yellow-400',
          badge: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300'
        };
      default:
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          text: 'text-purple-600 dark:text-purple-400',
          badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300'
        };
    }
  };

  const filteredFeedbacks = filter === 'all' 
    ? feedbacks 
    : feedbacks.filter(f => f.feedbackType === filter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* View Mode Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setViewMode('received')}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors ${
            viewMode === 'received'
              ? 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 border-b-2 border-orange-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          📥 {t('performance.feedback.received') || 'Received'}
        </button>
        <button
          onClick={() => setViewMode('given')}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors ${
            viewMode === 'given'
              ? 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 border-b-2 border-orange-500'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          📤 {t('performance.feedback.givenTab') || 'Given'}
        </button>
        {isAdminOrManager && (
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors ${
              viewMode === 'all'
                ? 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 border-b-2 border-orange-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            👥 {t('performance.feedback.allFeedback') || 'All Feedback'}
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {t('common.all')} ({feedbacks.length})
        </button>
        <button
          onClick={() => setFilter(FeedbackType.PRAISE)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === FeedbackType.PRAISE
              ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {t('performance.feedback.types.praise')} ({feedbacks.filter(f => f.feedbackType === FeedbackType.PRAISE).length})
        </button>
        <button
          onClick={() => setFilter(FeedbackType.CONSTRUCTIVE)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === FeedbackType.CONSTRUCTIVE
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {t('performance.feedback.types.constructive')} ({feedbacks.filter(f => f.feedbackType === FeedbackType.CONSTRUCTIVE).length})
        </button>
        <button
          onClick={() => setFilter(FeedbackType.SUGGESTION)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === FeedbackType.SUGGESTION
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {t('performance.feedback.types.suggestion')} ({feedbacks.filter(f => f.feedbackType === FeedbackType.SUGGESTION).length})
        </button>
      </div>

      {/* Feedback Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredFeedbacks.map((feedback) => {
          const colors = getTypeColor(feedback.feedbackType);
          const isReceivedView = viewMode === 'received';
          const isGivenView = viewMode === 'given';
          const isAllView = viewMode === 'all';
          
          return (
            <div
            key={feedback._id}
            className={`${colors?.bg || 'bg-white'} border ${colors?.border || 'border-gray-200'} rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`${colors?.text || 'text-purple-700'}`}>
                    {getTypeIcon(feedback.feedbackType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${colors?.badge || 'bg-purple-50 text-purple-600'}`}>
                        {feedback.feedbackType}
                      </span>
                    </div>
                    {/* Show "From" for received view */}
                    {(isReceivedView || isAllView) && feedback.giver && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('performance.feedback.from')}: {feedback.giver.firstName} {feedback.giver.lastName}
                      </div>
                    )}
                    {/* Show "To" for given view and all view */}
                    {(isGivenView || isAllView) && feedback.recipient && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('performance.feedback.toLabel') || 'To'}: {feedback.recipient.firstName} {feedback.recipient.lastName}
                      </div>
                    )}
                    {/* Show anonymous indicator */}
                    {!feedback.giver && isReceivedView && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                        {t('performance.feedback.anonymous') || 'Anonymous'}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {feedback.comments}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t('performance.feedback.visibility')}: {feedback.visibility.replace('_', ' ')}
                </div>
                {isReceivedView && !feedback.acknowledged && (
                  <button
                    onClick={() => acknowledgeFeedback(feedback._id)}
                    className={`px-3 py-1.5 ${colors?.text || 'text-purple-600'} hover:bg-white dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors border ${colors?.border || 'border-purple-200'}`}
                  >
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{t('performance.feedback.acknowledge')}</span>
                    </div>
                  </button>
                )}
                {feedback.acknowledged && (
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{t('performance.feedback.acknowledgedLabel')}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredFeedbacks.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">{t('performance.feedback.noFeedback')}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {viewMode === 'received' && (t('performance.feedback.encourageColleagues') || 'Encourage your colleagues to send you feedback!')}
            {viewMode === 'given' && (t('performance.feedback.startGiving') || 'Start recognizing your colleagues!')}
            {viewMode === 'all' && (t('performance.feedback.noFeedbackYet') || 'No feedback has been shared yet.')}
          </p>
        </div>
      )}
    </div>
  );
}
