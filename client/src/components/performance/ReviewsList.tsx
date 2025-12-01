'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { PerformanceReview, ReviewStatus } from '@/types/performance';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { UserRole } from '@/types/auth';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ViewMode = 'my' | 'team';

export default function ReviewsList() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | ReviewStatus>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('my');
  const { user, token } = useAuth();
  const { t } = useTranslation();

  const isManagerOrAdmin = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN;

  const fetchReviews = useCallback(async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const endpoint = viewMode === 'team' && isManagerOrAdmin
        ? `${API_URL}/performance/reviews/team`
        : `${API_URL}/performance/reviews/my-reviews`;
      const { data } = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      toast.error(t('performance.reviews.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [token, viewMode, isManagerOrAdmin, t]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const getStatusColor = (status: ReviewStatus) => {
    switch (status) {
      case ReviewStatus.COMPLETED:
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case ReviewStatus.MANAGER_REVIEW:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case ReviewStatus.SELF_REVIEW:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case ReviewStatus.DRAFT:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 dark:text-green-400';
    if (rating >= 3.5) return 'text-blue-600 dark:text-blue-400';
    if (rating >= 2.5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(r => r.status === filter);

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
            {t('performance.reviews.myReviews')}
          </button>
          <button
            onClick={() => setViewMode('team')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'team'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-500'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-transparent'
            }`}
          >
            {t('performance.reviews.teamReviews')}
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
          {t('common.all')} ({reviews.length})
        </button>
        <button
          onClick={() => setFilter(ReviewStatus.SELF_REVIEW)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === ReviewStatus.SELF_REVIEW
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {t('performance.reviews.types.self')} ({reviews.filter(r => r.status === ReviewStatus.SELF_REVIEW).length})
        </button>
        <button
          onClick={() => setFilter(ReviewStatus.MANAGER_REVIEW)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === ReviewStatus.MANAGER_REVIEW
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {t('performance.reviews.types.manager')} ({reviews.filter(r => r.status === ReviewStatus.MANAGER_REVIEW).length})
        </button>
        <button
          onClick={() => setFilter(ReviewStatus.COMPLETED)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === ReviewStatus.COMPLETED
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {t('performance.reviews.statuses.completed')} ({reviews.filter(r => r.status === ReviewStatus.COMPLETED).length})
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div
            key={review._id}
            className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Employee Name (Team View) */}
            {viewMode === 'team' && review.employee && (
              <div className="mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {review.employee.firstName?.[0]}{review.employee.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {review.employee.firstName} {review.employee.lastName}
                    </p>
                    {review.employee.department && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{review.employee.department}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {review.reviewCycle}
                  </h4>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(review.status)}`}>
                    {review.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="capitalize">{review.reviewType.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>{t('performance.reviews.reviewer')}: {review.reviewer.firstName} {review.reviewer.lastName}
                </span>
                </div>
              </div>
              {review.finalRating && (
                <div className="text-right ml-4">
                  <div className={`text-3xl font-bold ${getRatingColor(review.finalRating)}`}>
                    {review.finalRating.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t('performance.reviews.overallRating')}</div>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{t('performance.reviews.reviewPeriod')}: {new Date(review.periodStart).toLocaleDateString()} - {new Date(review.periodEnd).toLocaleDateString()}</span>
              </div>
              {review.completedAt && (
                <>
                  <span>•</span>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{t('performance.reviews.completed')}: {new Date(review.completedAt).toLocaleDateString()}</span>
                </div>
                </>
              )}
            </div>

            {/* Competencies */}
            {review.competencyRatings && review.competencyRatings.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('performance.reviews.competencies')}</h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {review.competencyRatings.map((comp, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-600/50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{comp.competency}</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${((comp.managerRating || comp.selfRating || 0) / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-semibold ${getRatingColor(comp.managerRating || comp.selfRating || 0)}`}>
                          {comp.managerRating || comp.selfRating || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            {review.managerStrengths && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <div className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">{t('performance.reviews.managerFeedback')}</div>
                <p className="text-sm text-blue-800 dark:text-blue-200">{review.managerStrengths}</p>
              </div>
            )}

            {review.selfStrengths && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
                <div className="text-xs font-semibold text-purple-900 dark:text-purple-300 mb-1">{t('performance.reviews.selfReview')}</div>
                <p className="text-sm text-purple-800 dark:text-purple-200">{review.selfStrengths}</p>
              </div>
            )}

            {/* Actions */}
            {review.status === ReviewStatus.SELF_REVIEW && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                  {t('performance.reviews.completeReview')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">{t('performance.reviews.noReviews')}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {filter === 'all' 
              ? t('performance.reviews.noReviewsYet')
              : t('performance.reviews.noFilteredReviews')
            }
          </p>
        </div>
      )}
    </div>
  );
}
