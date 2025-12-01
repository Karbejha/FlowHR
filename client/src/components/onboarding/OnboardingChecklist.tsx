'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Onboarding, OnboardingTask, TaskStatus } from '@/types/onboarding';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { UserRole } from '@/types/auth';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ViewMode = 'my' | 'team';

export default function OnboardingChecklist() {
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
  const [onboardings, setOnboardings] = useState<Onboarding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('my');
  const { user, token } = useAuth();
  const { t } = useTranslation();

  const isManagerOrAdmin = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN;

  const fetchOnboarding = useCallback(async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      
      if (viewMode === 'team' && isManagerOrAdmin) {
        // Fetch all team onboardings
        const { data } = await axios.get(`${API_URL}/onboarding/onboarding`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOnboardings(data);
        setOnboarding(null);
      } else {
        // Fetch my onboarding
        const { data } = await axios.get(`${API_URL}/onboarding/my-onboarding`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOnboarding(data);
        setOnboardings([]);
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status !== 404) {
        console.error('Error fetching onboarding:', err);
        toast.error(t('onboarding.fetchFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, viewMode, isManagerOrAdmin, t]);

  useEffect(() => {
    fetchOnboarding();
  }, [fetchOnboarding]);

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    if (!token) return;
    
    try {
      await axios.put(`${API_URL}/onboarding/task/${taskId}`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast.success('Task updated');
      fetchOnboarding();
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error('Failed to update task');
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case TaskStatus.PENDING:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      case TaskStatus.BLOCKED:
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'documentation':
        return '📄';
      case 'equipment':
        return '💻';
      case 'training':
        return '🎓';
      case 'access':
        return '🔑';
      case 'compliance':
        return '✅';
      default:
        return '📋';
    }
  };

  const getProgress = (ob?: Onboarding) => {
    const target = ob || onboarding;
    if (!target) return 0;
    const completed = target.tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    return Math.round((completed / target.tasks.length) * 100);
  };

  const groupedTasks = onboarding?.tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, OnboardingTask[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Team View for Managers/Admins
  if (viewMode === 'team' && isManagerOrAdmin) {
    return (
      <div className="space-y-6">
        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('my')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-transparent"
          >
            {t('onboarding.myOnboarding')}
          </button>
          <button
            onClick={() => setViewMode('team')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-2 border-green-500"
          >
            {t('onboarding.teamOnboarding')}
          </button>
        </div>

        {onboardings.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">{t('onboarding.noOnboardings')}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {onboardings.map((ob) => {
              const progress = getProgress(ob);
              return (
                <div
                  key={ob._id}
                  className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Employee Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {ob.employee.firstName?.[0]}{ob.employee.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {ob.employee.firstName} {ob.employee.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {ob.employee.department}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      ob.status === 'completed'
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                        : ob.status === 'in_progress'
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {ob.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('onboarding.started')}: {new Date(ob.startDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{t('onboarding.progress')}</span>
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Task Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
                      <div className="font-bold text-green-600 dark:text-green-400">
                        {ob.tasks.filter(t => t.status === TaskStatus.COMPLETED).length}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">{t('onboarding.completed')}</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                      <div className="font-bold text-blue-600 dark:text-blue-400">
                        {ob.tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">{t('common.inProgress')}</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded p-2">
                      <div className="font-bold text-yellow-600 dark:text-yellow-400">
                        {ob.tasks.filter(t => t.status === TaskStatus.PENDING).length}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">{t('common.pending')}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // My Onboarding View (existing)
  if (!onboarding) {
    return (
      <div className="space-y-6">
        {/* View Mode Toggle */}
        {isManagerOrAdmin && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setViewMode('my')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'my'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-2 border-green-500'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-transparent'
              }`}
            >
              {t('onboarding.myOnboarding')}
            </button>
            <button
              onClick={() => setViewMode('team')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'team'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-2 border-green-500'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-transparent'
              }`}
            >
              {t('onboarding.teamOnboarding')}
            </button>
          </div>
        )}
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">{t('onboarding.noOnboarding')}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {user?.role === UserRole.EMPLOYEE 
              ? t('onboarding.contactHR')
              : t('onboarding.createForEmployees')
            }
          </p>
        </div>
      </div>
    );
  }

  const progress = getProgress();

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      {isManagerOrAdmin && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('my')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'my'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-2 border-green-500'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-transparent'
            }`}
          >
            {t('onboarding.myOnboarding')}
          </button>
          <button
            onClick={() => setViewMode('team')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'team'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-2 border-green-500'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-transparent'
            }`}
          >
            {t('onboarding.teamOnboarding')}
          </button>
        </div>
      )}

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('onboarding.welcomeMessage', { name: onboarding.employee.firstName })} 👋</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Started: {new Date(onboarding.startDate).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            onboarding.status === 'completed'
              ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
              : onboarding.status === 'in_progress'
              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300'
              : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300'
          }`}>
            {onboarding.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
            <span className="text-sm font-bold text-green-600 dark:text-green-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-bold text-gray-900 dark:text-gray-100">
              {onboarding.tasks.filter(t => t.status === TaskStatus.COMPLETED).length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Completed</div>
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-gray-100">
              {onboarding.tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">In Progress</div>
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-gray-100">
              {onboarding.tasks.filter(t => t.status === TaskStatus.PENDING).length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Pending</div>
          </div>
        </div>
      </div>

      {/* Tasks by Category */}
      {groupedTasks && Object.entries(groupedTasks).map(([category, tasks]) => (
        <div key={category} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{getCategoryIcon(category)}</span>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
              {category.replace('_', ' ')}
            </h4>
            <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
              {tasks.filter(t => t.status === TaskStatus.COMPLETED).length} / {tasks.length}
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task._id}
                className={`border-2 rounded-lg p-4 transition-all ${
                  task.status === TaskStatus.COMPLETED
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => updateTaskStatus(
                      task._id,
                      task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED
                    )}
                    className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded border-2 transition-all ${
                      task.status === TaskStatus.COMPLETED
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                    }`}
                  >
                    {task.status === TaskStatus.COMPLETED && (
                      <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h5 className={`font-medium ${
                        task.status === TaskStatus.COMPLETED
                          ? 'text-gray-500 dark:text-gray-400 line-through'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {task.title}
                      </h5>
                      <span className={`px-2 py-1 text-xs font-medium rounded border whitespace-nowrap ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      {task.assignedTo && (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Assigned: {task.assignedTo.firstName} {task.assignedTo.lastName}</span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
