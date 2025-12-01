'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { GoalPriority, GoalCategory } from '@/types/performance';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface GoalFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function GoalForm({ onSuccess, onCancel }: GoalFormProps) {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: GoalCategory.PERFORMANCE,
    priority: GoalPriority.MEDIUM,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    keyResults: [''],
    weight: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error(t('messages.authenticationRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Filter out empty key results
      const cleanedKeyResults = formData.keyResults.filter(kr => kr.trim() !== '');
      
      await axios.post(`${API_URL}/performance/goals`, 
        { ...formData, keyResults: cleanedKeyResults },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      toast.success(t('performance.goals.created'));
      onSuccess();
    } catch (err) {
      console.error('Error creating goal:', err);
      toast.error(t('performance.goals.createFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const addKeyResult = () => {
    setFormData(prev => ({
      ...prev,
      keyResults: [...prev.keyResults, '']
    }));
  };

  const removeKeyResult = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyResults: prev.keyResults.filter((_, i) => i !== index)
    }));
  };

  const updateKeyResult = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      keyResults: prev.keyResults.map((kr, i) => i === index ? value : kr)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('performance.goals.goalTitle')} *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder={t('performance.goals.goalTitlePlaceholder')}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('performance.goals.description')} *
          </label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder={t('performance.goals.descriptionPlaceholder')}
          />
        </div>

        {/* Category and Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('performance.goals.category')} *
            </label>
            <select
              aria-label={t('performance.goals.category')}
              required
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as GoalCategory }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {Object.values(GoalCategory).map(cat => (
                <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('performance.goals.priority')} *
            </label>
            <select
              aria-label={t('performance.goals.priority')}
              required
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as GoalPriority }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {Object.values(GoalPriority).map(pri => (
                <option key={pri} value={pri}>{pri}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('performance.goals.startDate')} *
            </label>
            <input
              aria-label={t('performance.goals.startDate')}
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('performance.goals.targetDate')} *
            </label>
            <input
              aria-label={t('performance.goals.targetDate')}
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              min={formData.startDate}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Key Results */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('performance.goals.keyResults')}
            </label>
            <button
              type="button"
              onClick={addKeyResult}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
            >
              + {t('performance.goals.addKeyResult')}
            </button>
          </div>
          <div className="space-y-2">
            {formData.keyResults.map((kr, index) => (
              <div key={index} className="flex gap-2">
                <input
                  aria-label={`${t('performance.goals.keyResults')} ${index + 1}`}
                  type="text"
                  value={kr}
                  onChange={(e) => updateKeyResult(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder={t('performance.goals.keyResultPlaceholder')}
                />
                {formData.keyResults.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeKeyResult(index)}
                    aria-label={t('common.remove')}
                    className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('performance.goals.creating') : t('performance.goals.createGoal')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </form>
  );
}
