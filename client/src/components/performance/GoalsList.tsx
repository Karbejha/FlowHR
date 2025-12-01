'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Goal, GoalStatus, GoalPriority } from '@/types/performance';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { UserRole } from '@/types/auth';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ViewMode = 'my' | 'team';

export default function GoalsList() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | GoalStatus>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('my');
  const { user, token } = useAuth();
  const { t } = useTranslation();

  const isManagerOrAdmin = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN;

  const fetchGoals = useCallback(async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      const endpoint = viewMode === 'team' && isManagerOrAdmin
        ? `${API_URL}/performance/goals/team`
        : `${API_URL}/performance/goals`;
      const { data } = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoals(data);
    } catch (err) {
      console.error('Error fetching goals:', err);
      toast.error(t('performance.goals.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [token, viewMode, isManagerOrAdmin, t]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const updateProgress = async (goalId: string, progress: number) => {
    if (!token) return;
    
    try {
      await axios.put(`${API_URL}/performance/goals/${goalId}/progress`, 
        { progress },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast.success(t('performance.goals.progressUpdated'));
      fetchGoals();
    } catch (err) {
      console.error('Error updating progress:', err);
      toast.error(t('performance.goals.updateFailed'));
    }
  };

  const getPriorityColor = (priority: GoalPriority) => {
    switch (priority) {
      case GoalPriority.HIGH:
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
      case GoalPriority.MEDIUM:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      case GoalPriority.LOW:
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
    }
  };

  const getStatusColor = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.COMPLETED:
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case GoalStatus.IN_PROGRESS:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case GoalStatus.ACTIVE:
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case GoalStatus.CANCELLED:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const filteredGoals = filter === 'all' 
    ? goals 
    : goals.filter(g => g.status === filter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-2 border-purple-500'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-transparent'
            }`}
          >
            {t('performance.goals.myGoals')}
          </button>
          <button
            onClick={() => setViewMode('team')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'team'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-2 border-purple-500'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-transparent'
            }`}
          >
            {t('performance.goals.teamGoals')}
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {t('common.all')} ({goals.length})
        </button>
        <button
          onClick={() => setFilter(GoalStatus.ACTIVE)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === GoalStatus.ACTIVE
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {t('performance.goals.statuses.active')} ({goals.filter(g => g.status === GoalStatus.ACTIVE).length})
        </button>
        <button
          onClick={() => setFilter(GoalStatus.IN_PROGRESS)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === GoalStatus.IN_PROGRESS
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {t('common.inProgress')} ({goals.filter(g => g.status === GoalStatus.IN_PROGRESS).length})
        </button>
        <button
          onClick={() => setFilter(GoalStatus.COMPLETED)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === GoalStatus.COMPLETED
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {t('performance.goals.statuses.completed')} ({goals.filter(g => g.status === GoalStatus.COMPLETED).length})
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredGoals.map((goal) => (
          <div
            key={goal._id}
            className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Employee Name (Team View) */}
            {viewMode === 'team' && goal.employee && (
              <div className="mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      {goal.employee.firstName?.[0]}{goal.employee.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {goal.employee.firstName} {goal.employee.lastName}
                    </p>
                    {goal.employee.department && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{goal.employee.department}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {goal.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {goal.description}
                </p>
              </div>
              <span className={`ml-3 px-2 py-1 text-xs font-semibold rounded border ${getPriorityColor(goal.priority)}`}>
                {goal.priority}
              </span>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(goal.status)}`}>
                {goal.status.replace('_', ' ')}
              </span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                {goal.category}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('performance.goals.progress')}</span>
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{goal.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{new Date(goal.startDate).toLocaleDateString()}</span>
              </div>
              <span>→</span>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>{new Date(goal.dueDate).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Key Results */}
            {goal.keyResults && goal.keyResults.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('performance.goals.keyResults')}:</div>
                <ul className="space-y-1">
                  {goal.keyResults.map((kr, idx) => (
                    <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <svg className="w-3 h-3 mt-0.5 flex-shrink-0 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="line-clamp-2">{kr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Progress Update */}
            {goal.status !== GoalStatus.COMPLETED && goal.status !== GoalStatus.CANCELLED && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('performance.goals.updateProgress')}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={goal.progress}
                  onChange={(e) => updateProgress(goal._id, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  aria-label={t('performance.goals.updateProgress')}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredGoals.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">{t('performance.goals.noGoals')}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('performance.goals.createFirst')}</p>
        </div>
      )}
    </div>
  );
}
