'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { FeedbackType, FeedbackVisibility } from '@/types/performance';
import { User } from '@/types/auth';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface GiveFeedbackProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function GiveFeedback({ onSuccess, onCancel }: GiveFeedbackProps) {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    recipient: '',
    feedbackType: FeedbackType.PRAISE,
    comments: '',
    visibility: FeedbackVisibility.PUBLIC as FeedbackVisibility
  });

  const fetchEmployees = useCallback(async () => {
    if (!token) return;
    
    try {
      // Use team-members endpoint which is accessible to all authenticated users
      const { data } = await axios.get(`${API_URL}/users/team-members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle both array response and object with employees property
      const employeesList = Array.isArray(data) ? data : (data?.employees || data?.users || []);
      setEmployees(employeesList);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
    }
  }, [token]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error(t('messages.authenticationRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Map frontend field names to backend expected names
      const payload = {
        toUserId: formData.recipient,
        type: formData.feedbackType.toLowerCase(),
        content: formData.comments,
        visibility: formData.visibility === FeedbackVisibility.MANAGER_ONLY 
          ? 'manager' 
          : formData.visibility.toLowerCase(),
        isPublicRecognition: formData.visibility === FeedbackVisibility.PUBLIC,
        category: 'general'
      };
      
      await axios.post(`${API_URL}/performance/feedback`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(t('performance.feedback.sentSuccess'));
      onSuccess();
    } catch (err) {
      console.error('Error sending feedback:', err);
      toast.error(t('performance.feedback.sendFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeColor = (type: FeedbackType) => {
    switch (type) {
      case FeedbackType.PRAISE:
        return 'from-pink-500 to-red-500';
      case FeedbackType.CONSTRUCTIVE:
        return 'from-blue-500 to-indigo-500';
      case FeedbackType.SUGGESTION:
        return 'from-yellow-400 to-yellow-600';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border border-orange-200 dark:border-gray-600 shadow-lg">
      <div className="space-y-4">
        {/* Recipient */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('performance.feedback.sendTo')} *
          </label>
          <select
            aria-label={t('performance.feedback.recipient')}
            required
            value={formData.recipient}
            onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">{t('performance.feedback.selectColleague')}</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>
                {emp.firstName} {emp.lastName} - {emp.department}
              </option>
            ))}
          </select>
        </div>

        {/* Feedback Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('performance.feedback.typeOfFeedback')} *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(FeedbackType).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, feedbackType: type }))}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  formData.feedbackType === type
                    ? `bg-gradient-to-r ${getTypeColor(type)} text-white border-transparent shadow-md scale-105`
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <div className="text-xs font-semibold capitalize">{type}</div>
                  {type === FeedbackType.PRAISE && (
                    <div className="text-2xl mt-1">❤️</div>
                  )}
                  {type === FeedbackType.CONSTRUCTIVE && (
                    <div className="text-2xl mt-1">💡</div>
                  )}
                  {type === FeedbackType.SUGGESTION && (
                    <div className="text-2xl mt-1">🌟</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('performance.feedback.yourMessage')} *
          </label>
          <textarea
            required
            rows={5}
            value={formData.comments}
            onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder={
              formData.feedbackType === FeedbackType.PRAISE
                ? t('performance.feedback.placeholders.praise')
                : formData.feedbackType === FeedbackType.CONSTRUCTIVE
                ? t('performance.feedback.placeholders.constructive')
                : t('performance.feedback.placeholders.suggestion')
            }
          />
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('performance.feedback.visibility')}
          </label>
          <div className="flex gap-2">
            {Object.values(FeedbackVisibility).map(vis => (
              <button
                key={vis}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, visibility: vis }))}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  formData.visibility === vis
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500'
                }`}
              >
                {vis.replace('_', ' ')}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formData.visibility === FeedbackVisibility.PUBLIC && t('performance.feedback.visibilityHints.public')}
            {formData.visibility === FeedbackVisibility.PRIVATE && t('performance.feedback.visibilityHints.private')}
            {formData.visibility === FeedbackVisibility.MANAGER_ONLY && t('performance.feedback.visibilityHints.managerOnly')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isSubmitting ? t('performance.feedback.sending') : `🎉 ${t('performance.feedback.sendRecognition')}`}
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
