'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { LeaveRequest, LeaveType } from '@/types/leave';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const WORKING_HOURS_PER_DAY = 8;

interface LeaveBalanceData {
  annual: number;
  sick: number;
  casual: number;
  unpaid?: number;
  maternity?: number;
  paternity?: number;
  other?: number;
}

export default function LeaveRequestForm({ onSubmitSuccess }: { onSubmitSuccess?: () => void }) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [balance, setBalance] = useState<LeaveBalanceData | null>(null);
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);
  const [insufficientBalanceDetails, setInsufficientBalanceDetails] = useState<{
    leaveType: string;
    requestedDays: number;
    availableDays: number;
  } | null>(null);
  const [showTenureModal, setShowTenureModal] = useState(false);
  const [userHireDate, setUserHireDate] = useState<Date | null>(null);
  const [isHourlyLeave, setIsHourlyLeave] = useState(false);
  
  const { token, user } = useAuth();
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<LeaveRequest>();
  
  // Watch form values for dynamic calculations
  const watchStartDate = watch('startDate');
  const watchEndDate = watch('endDate');
  const watchStartTime = watch('startTime');
  const watchEndTime = watch('endTime');

  // Fetch leave balance
  const fetchLeaveBalance = useCallback(async () => {
    if (!token) return;
    
    try {
      const { data } = await axios.get(`${API_URL}/leave/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalance(data);
    } catch (err) {
      console.error('Error fetching leave balance:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchLeaveBalance();
    // Set user hire date from auth context
    if (user?.hireDate) {
      setUserHireDate(new Date(user.hireDate));
    }
  }, [fetchLeaveBalance, user]);

  // Calculate requested days
  const calculateDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Calculate hours for hourly leave
  const calculateHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    if (endMinutes <= startMinutes) return 0;
    return Math.round(((endMinutes - startMinutes) / 60) * 100) / 100;
  };

  // Calculate days from hours
  const calculateDaysFromHours = (hours: number): number => {
    return Math.round((hours / WORKING_HOURS_PER_DAY) * 100) / 100;
  };

  // Get current duration display
  const getDurationDisplay = (): string => {
    if (isHourlyLeave) {
      const hours = calculateHours(watchStartTime || '', watchEndTime || '');
      if (hours > 0) {
        const days = calculateDaysFromHours(hours);
        return `${hours} ${t('common.hours')} (${days} ${t('common.days')})`;
      }
      return '0 ' + t('common.hours');
    } else {
      const days = calculateDays(watchStartDate || '', watchEndDate || '');
      return `${days} ${t('common.days')}`;
    }
  };

  // Check if user has been employed for at least 3 months
  const checkEmploymentTenure = (): boolean => {
    if (!userHireDate) return true; // If no hire date, allow request (backward compatibility)
    
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    if (userHireDate > threeMonthsAgo) {
      setShowTenureModal(true);
      return false;
    }
    return true;
  };

  // Check leave balance
  const checkLeaveBalance = (leaveType: LeaveType, startDate: string, endDate: string, startTime?: string, endTime?: string): boolean => {
    if (!balance || !startDate || !endDate) return true;
    
    let requestedDays: number;
    if (isHourlyLeave && startTime && endTime) {
      const hours = calculateHours(startTime, endTime);
      requestedDays = calculateDaysFromHours(hours);
    } else {
      requestedDays = calculateDays(startDate, endDate);
    }
    
    const balanceType = leaveType.toLowerCase() as keyof LeaveBalanceData;
    const availableDays = balance[balanceType] || 0;
    
    if (availableDays < requestedDays) {
      setInsufficientBalanceDetails({
        leaveType: leaveType.charAt(0).toUpperCase() + leaveType.slice(1),
        requestedDays,
        availableDays
      });
      setShowInsufficientBalanceModal(true);
      return false;
    }
    return true;
  };  const onSubmit = async (data: LeaveRequest) => {
    if (!token) {
      toast.error(t('messages.authenticationRequired'));
      return;
    }

    // Check employment tenure (3 months minimum)
    if (!checkEmploymentTenure()) {
      return; // Modal will be shown by checkEmploymentTenure
    }

    // Check leave balance before submitting
    if (!checkLeaveBalance(data.leaveType, data.startDate, data.endDate, data.startTime, data.endTime)) {
      return; // Modal will be shown by checkLeaveBalance
    }
    
    // Validate hourly leave times
    if (isHourlyLeave) {
      if (!data.startTime || !data.endTime) {
        toast.error(t('leave.timeRequired'));
        return;
      }
      const hours = calculateHours(data.startTime, data.endTime);
      if (hours < 1) {
        toast.error(t('leave.minimumHourlyDuration'));
        return;
      }
    }
      try {
      setIsSubmitting(true);
        const requestData = {
        ...data,
        isHourlyLeave,
        ...(isHourlyLeave ? { startTime: data.startTime, endTime: data.endTime } : {})
      };
      
        const response = await axios.post(`${API_URL}/leave/request`, requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        toast.success(t('leave.requestSubmitted'));
        reset();
        setIsHourlyLeave(false); // Reset hourly leave toggle
        fetchLeaveBalance(); // Refresh balance after successful submission
        onSubmitSuccess?.();
      }
    } catch (err: unknown) {      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string }; status?: number } };
        const errorMessage = axiosErr.response?.data?.error || t('messages.failedToSubmitLeaveRequest');
        
        // Check if error is about tenure requirement
        if (errorMessage.includes('3 months') || errorMessage.includes('at least 3 months')) {
          setShowTenureModal(true);
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error(t('messages.failedToSubmitLeaveRequest'));
      }
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
        </div>        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('leave.submitRequest')}</h2>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="leaveType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('leave.leaveType')}
          </label>
          <div className="relative">
            <select
              {...register('leaveType', { required: t('leave.leaveTypeRequired') })}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-3 px-4 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200 appearance-none"
            >
              <option value="" className="text-gray-500 dark:text-gray-400">{t('leave.selectLeaveType')}</option>
              {Object.values(LeaveType).map(type => (
                <option key={type} value={type} className="text-gray-900 dark:text-gray-100">
                  {t(`leave.${type}`)}
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

        {/* Hourly Leave Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <label htmlFor="isHourlyLeave" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t('leave.hourlyLeave')}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('leave.hourlyLeaveDescription')}</p>
            </div>
          </div>
          <button
            type="button"
            id="isHourlyLeave"
            aria-label={`${t('leave.hourlyLeave')}: ${isHourlyLeave ? 'enabled' : 'disabled'}`}
            title={t('leave.hourlyLeave')}
            onClick={() => setIsHourlyLeave(!isHourlyLeave)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isHourlyLeave ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span className="sr-only">{t('leave.hourlyLeave')}</span>
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isHourlyLeave ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>            <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('leave.startDate')}
            </label>
            <div className="relative">
              <input
                type="date"
                {...register('startDate', { required: t('leave.startDateRequired') })}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-3 px-4 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200"
              />
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

          <div>            <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('leave.endDate')}
            </label>
            <div className="relative">
              <input
                type="date"
                {...register('endDate', { required: t('leave.endDateRequired') })}
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-3 px-4 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200"
              />
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

        {/* Time Pickers for Hourly Leave */}
        {isHourlyLeave && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="startTime" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('leave.startTime')}
              </label>
              <div className="relative">
                <input
                  type="time"
                  {...register('startTime', { required: isHourlyLeave ? t('leave.startTimeRequired') : false })}
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-3 px-4 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200"
                />
              </div>
              {errors.startTime && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.startTime.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('leave.endTime')}
              </label>
              <div className="relative">
                <input
                  type="time"
                  {...register('endTime', { required: isHourlyLeave ? t('leave.endTimeRequired') : false })}
                  className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-3 px-4 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200"
                />
              </div>
              {errors.endTime && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.endTime.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Duration Display */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {t('leave.duration')}:
            </span>
            <span className="text-sm font-bold text-blue-800 dark:text-blue-200">
              {getDurationDisplay()}
            </span>
          </div>
        </div>        <div>
          <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('leave.reason')}
          </label>
          <div className="relative">
            <textarea
              {...register('reason', { 
                required: t('leave.reasonRequired'),
                minLength: { value: 10, message: t('leave.reasonMinLength') }
              })}
              rows={4}
              placeholder={t('leave.reasonPlaceholder')}
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

        <div className="flex flex-col sm:flex-row gap-3 pt-4">          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 sm:flex-none px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20"
          >
            {t('common.reset')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 inline-flex justify-center items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                {t('common.submitting')}
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                {t('leave.submitRequest')}
              </>
            )}</button>
        </div>
      </form>

      {/* Insufficient Balance Modal */}
      {showInsufficientBalanceModal && insufficientBalanceDetails && (
        <div 
          className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50"
          onClick={() => setShowInsufficientBalanceModal(false)}
        >
          <div 
            className="relative p-4 w-full max-w-md h-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal content */}
            <div className="relative p-4 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
              <button 
                type="button" 
                className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => setShowInsufficientBalanceModal(false)}
              >
                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              
              <svg className="text-red-400 dark:text-red-500 w-11 h-11 mb-3.5 mx-auto" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
                <p className="mb-4 text-gray-500 dark:text-gray-300">
                <span className="font-semibold text-red-600 dark:text-red-400">{t('leave.insufficientBalance')}</span>
                <br />
                {t('leave.insufficientBalanceMessage', {
                  requestedDays: insufficientBalanceDetails.requestedDays,
                  leaveType: insufficientBalanceDetails.leaveType,
                  availableDays: insufficientBalanceDetails.availableDays
                })}
              </p>
              
              <div className="flex justify-center items-center">
                <button 
                  type="button" 
                  className="py-2 px-4 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900"
                  onClick={() => setShowInsufficientBalanceModal(false)}
                >
                  {t('common.understand')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Employment Tenure Modal */}
      {showTenureModal && (
        <div 
          className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50"
          onClick={() => setShowTenureModal(false)}
        >
          <div 
            className="relative p-4 w-full max-w-md h-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal content */}
            <div className="relative p-4 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
              <button 
                type="button" 
                className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => setShowTenureModal(false)}
              >
                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              
              <svg className="text-amber-400 dark:text-amber-500 w-11 h-11 mb-3.5 mx-auto" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
                <p className="mb-4 text-gray-500 dark:text-gray-300">
                <span className="font-semibold text-amber-600 dark:text-amber-400">{t('leave.tenureRequirement')}</span>
                <br />
                {t('leave.tenureRequirementMessage')}
              </p>
              
              <div className="flex justify-center items-center">
                <button 
                  type="button" 
                  className="py-2 px-4 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:ring-4 focus:outline-none focus:ring-amber-300 dark:bg-amber-500 dark:hover:bg-amber-600 dark:focus:ring-amber-900"
                  onClick={() => setShowTenureModal(false)}
                >
                  {t('common.understand')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}