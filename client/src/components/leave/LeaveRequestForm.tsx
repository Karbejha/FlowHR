'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LeaveRequest, LeaveType } from '@/types/leave';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LeaveRequestForm({ onSubmitSuccess }: { onSubmitSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<LeaveRequest>();
  const onSubmit = async (data: LeaveRequest) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await axios.post(`${API_URL}/leave/request`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Leave request submitted successfully');
      reset();
      onSubmitSuccess?.();
    } catch (err) {
      console.error('Error submitting leave request:', err);
      toast.error('Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Submit Leave Request</h2>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="leaveType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Leave Type
          </label>
          <div className="relative">
            <select
              {...register('leaveType', { required: 'Leave type is required' })}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-3 px-4 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200 appearance-none"
            >
              <option value="" className="text-gray-500 dark:text-gray-400">Select a type</option>
              {Object.values(LeaveType).map(type => (
                <option key={type} value={type} className="text-gray-900 dark:text-gray-100">
                  {type.charAt(0).toUpperCase() + type.slice(1)} Leave
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.leaveType && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.leaveType.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                {...register('startDate', { required: 'Start date is required' })}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-3 px-4 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            {errors.startDate && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                {...register('endDate', { required: 'End date is required' })}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-3 px-4 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            {errors.endDate && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Reason for Leave
          </label>
          <div className="relative">
            <textarea
              {...register('reason', { 
                required: 'Reason is required',
                minLength: { value: 10, message: 'Reason must be at least 10 characters' }
              })}
              rows={4}
              placeholder="Please provide a detailed reason for your leave request..."
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-3 px-4 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200 resize-none"
            />
            <div className="absolute bottom-3 right-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
          {errors.reason && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.reason.message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 sm:flex-none px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 inline-flex justify-center items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Submit Request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}