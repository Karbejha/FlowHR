'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { Leave } from '@/types/leave';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface EditLeavePeriodModalProps {
  leave: Leave;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface EditPeriodForm {
  startDate: string;
  endDate: string;
}

export default function EditLeavePeriodModal({ leave, isOpen, onClose, onSuccess }: EditLeavePeriodModalProps) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<EditPeriodForm>({
    defaultValues: {
      startDate: leave.startDate.split('T')[0],
      endDate: leave.endDate.split('T')[0]
    }
  });

  // Calculate days between dates
  const calculateDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const watchedStartDate = watch('startDate');
  const watchedEndDate = watch('endDate');
  const newTotalDays = calculateDays(watchedStartDate, watchedEndDate);
  const originalTotalDays = leave.totalDays;

  const onSubmit = async (data: EditPeriodForm) => {
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await axios.post(
        `${API_URL}/leave/${leave._id}/period`,
        {
          startDate: data.startDate,
          endDate: data.endDate
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update leave period');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50">
      <div className="relative p-4 w-full max-w-md h-auto">
        <div className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
          {/* Modal header */}
          <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('leave.editPeriod')}
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={onClose}
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          {/* Employee info */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{t('leave.employee')}:</span> {leave.employee.firstName} {leave.employee.lastName}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{t('leave.type')}:</span> {t(`leave.${leave.leaveType}`)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{t('leave.reason')}:</span> {leave.reason}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('leave.startDate')}
                </label>
                <input
                  type="date"
                  id="startDate"
                  {...register('startDate', {
                    required: t('leave.startDateRequired'),
                    validate: (value) => {
                      if (watchedEndDate && new Date(value) >= new Date(watchedEndDate)) {
                        return t('leave.startDateBeforeEndDate');
                      }
                      return true;
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('leave.endDate')}
                </label>
                <input
                  type="date"
                  id="endDate"
                  {...register('endDate', {
                    required: t('leave.endDateRequired'),
                    validate: (value) => {
                      if (watchedStartDate && new Date(value) <= new Date(watchedStartDate)) {
                        return t('leave.endDateAfterStartDate');
                      }
                      return true;
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {/* Days comparison */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {t('leave.originalDays')}: <span className="font-medium">{originalTotalDays}</span>
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {t('leave.newDays')}: <span className={`font-medium ${newTotalDays !== originalTotalDays ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                    {newTotalDays}
                  </span>
                </span>
              </div>
              {newTotalDays !== originalTotalDays && (
                <div className="mt-2 text-sm">
                  <span className={`font-medium ${newTotalDays > originalTotalDays ? 'text-red-600' : 'text-green-600'}`}>
                    {newTotalDays > originalTotalDays ? '+' : ''}{newTotalDays - originalTotalDays} {t('leave.days')}
                  </span>
                </div>
              )}
            </div>

            {/* Submit buttons */}
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={isSubmitting || newTotalDays === originalTotalDays}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('common.update')}
                  </div>
                ) : (
                  t('leave.updatePeriod')
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
