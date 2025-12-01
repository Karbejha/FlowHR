'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { ReviewType } from '@/types/performance';
import { User } from '@/types/auth';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ReviewCycleFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ReviewCycleForm({ onSuccess, onCancel }: ReviewCycleFormProps) {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    reviewCycle: `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
    reviewType: ReviewType.QUARTERLY,
    periodStart: '',
    periodEnd: '',
    selfReviewDueDate: '',
    managerReviewDueDate: ''
  });

  const fetchEmployees = useCallback(async () => {
    if (!token) return;
    
    try {
      // Use team-members endpoint which is accessible to managers
      const { data } = await axios.get(`${API_URL}/users/team-members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const employeesList = Array.isArray(data) ? data : (data?.employees || data?.users || []);
      setEmployees(employeesList);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
    }
  }, [token]);

  useEffect(() => {
    fetchEmployees();
    
    // Set default dates
    const today = new Date();
    const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
    const quarterEnd = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 + 3, 0);
    const selfDue = new Date(quarterEnd);
    selfDue.setDate(selfDue.getDate() + 7);
    const managerDue = new Date(selfDue);
    managerDue.setDate(managerDue.getDate() + 7);
    
    setFormData(prev => ({
      ...prev,
      periodStart: quarterStart.toISOString().split('T')[0],
      periodEnd: quarterEnd.toISOString().split('T')[0],
      selfReviewDueDate: selfDue.toISOString().split('T')[0],
      managerReviewDueDate: managerDue.toISOString().split('T')[0]
    }));
  }, [fetchEmployees]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error(t('messages.authenticationRequired'));
      return;
    }

    if (!formData.employeeId) {
      toast.error(t('performance.reviews.selectEmployee') || 'Please select an employee');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/performance/reviews`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(t('performance.reviews.createSuccess') || 'Review cycle created successfully!');
      onSuccess();
    } catch (err: unknown) {
      console.error('Error creating review cycle:', err);
      const errorMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || t('performance.reviews.createFailed') || 'Failed to create review cycle';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reviewTypes = [
    { value: ReviewType.ANNUAL, label: t('performance.reviews.types.annual') || 'Annual' },
    { value: ReviewType.MID_YEAR, label: t('performance.reviews.types.midYear') || 'Mid-Year' },
    { value: ReviewType.QUARTERLY, label: t('performance.reviews.types.quarterly') || 'Quarterly' },
    { value: ReviewType.PROBATION, label: t('performance.reviews.types.probation') || 'Probation' },
    { value: ReviewType.PROJECT, label: t('performance.reviews.types.project') || 'Project' },
    { value: ReviewType.PROMOTION, label: t('performance.reviews.types.promotion') || 'Promotion' },
    { value: ReviewType.AD_HOC, label: t('performance.reviews.types.adHoc') || 'Ad-Hoc' }
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border border-blue-200 dark:border-gray-600 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {t('performance.reviews.createNewCycle') || 'Create New Review Cycle'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Employee Selection */}
        <div className="md:col-span-2">
          <label htmlFor="employee-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('performance.reviews.employee') || 'Employee'} *
          </label>
          <select
            id="employee-select"
            aria-label={t('performance.reviews.employee') || 'Employee'}
            required
            value={formData.employeeId}
            onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">{t('performance.reviews.selectEmployee') || 'Select an employee...'}</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>
                {emp.firstName} {emp.lastName} - {emp.department}
              </option>
            ))}
          </select>
        </div>

        {/* Review Cycle Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('performance.reviews.cycleName') || 'Review Cycle'} *
          </label>
          <input
            type="text"
            required
            value={formData.reviewCycle}
            onChange={(e) => setFormData(prev => ({ ...prev, reviewCycle: e.target.value }))}
            placeholder="e.g., 2025-Q1, 2025-Annual"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Review Type */}
        <div>
          <label htmlFor="review-type-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('performance.reviews.type') || 'Review Type'} *
          </label>
          <select
            id="review-type-select"
            aria-label={t('performance.reviews.type') || 'Review Type'}
            required
            value={formData.reviewType}
            onChange={(e) => setFormData(prev => ({ ...prev, reviewType: e.target.value as ReviewType }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {reviewTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Period Start */}
        <div>
          <label htmlFor="period-start" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('performance.reviews.periodStart') || 'Period Start'} *
          </label>
          <input
            id="period-start"
            aria-label={t('performance.reviews.periodStart') || 'Period Start'}
            type="date"
            required
            value={formData.periodStart}
            onChange={(e) => setFormData(prev => ({ ...prev, periodStart: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Period End */}
        <div>
          <label htmlFor="period-end" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('performance.reviews.periodEnd') || 'Period End'} *
          </label>
          <input
            id="period-end"
            aria-label={t('performance.reviews.periodEnd') || 'Period End'}
            type="date"
            required
            value={formData.periodEnd}
            onChange={(e) => setFormData(prev => ({ ...prev, periodEnd: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Self Review Due Date */}
        <div>
          <label htmlFor="self-review-due" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('performance.reviews.selfReviewDue') || 'Self Review Due Date'}
          </label>
          <input
            id="self-review-due"
            aria-label={t('performance.reviews.selfReviewDue') || 'Self Review Due Date'}
            type="date"
            value={formData.selfReviewDueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, selfReviewDueDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Manager Review Due Date */}
        <div>
          <label htmlFor="manager-review-due" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('performance.reviews.managerReviewDue') || 'Manager Review Due Date'}
          </label>
          <input
            id="manager-review-due"
            aria-label={t('performance.reviews.managerReviewDue') || 'Manager Review Due Date'}
            type="date"
            value={formData.managerReviewDueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, managerReviewDueDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isSubmitting ? (t('common.creating') || 'Creating...') : (t('performance.reviews.createCycle') || 'Create Review Cycle')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        >
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
}
