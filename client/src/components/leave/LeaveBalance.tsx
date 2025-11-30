'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface LeaveBalanceData {
  annual: number;
  sick: number;
  casual: number;
  unpaid?: number;
  maternity?: number;
  paternity?: number;
  other?: number;
}

export default function LeaveBalance() {
  const { t } = useTranslation();
  const [balance, setBalance] = useState<LeaveBalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();  const fetchLeaveBalance = useCallback(async () => {
    if (!token) {
      toast.error(t('auth.authenticationRequired'));
      return;
    }
    
    try {
      const { data } = await axios.get(`${API_URL}/leave/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBalance(data);
    } catch (err) {
      console.error('Error fetching leave balance:', err);
      toast.error(t('leave.failedToFetchBalance'));
    } finally {
      setIsLoading(false);
    }
  }, [token, t]);

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchLeaveBalance();
  };

  useEffect(() => {
    fetchLeaveBalance();
  }, [fetchLeaveBalance]);
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16 mx-auto mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-8 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-8 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!balance) {
    return null;
  }
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6 transition-all duration-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('leave.availableLeaveBalance')}</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isLoading ? t('common.refreshing') : t('common.refresh')}
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Annual Leave */}
        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 border border-green-200 dark:border-green-700/50 rounded-xl transition-all duration-200 hover:shadow-md dark:hover:shadow-lg hover:scale-[1.02]">
          <div className="w-12 h-12 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>          <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">{t('leave.annual')}</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{Number.isInteger(balance.annual) ? balance.annual : balance.annual.toFixed(1)}</div>
          <div className="text-xs text-green-600 dark:text-green-400 font-medium">{t('leave.daysAvailable')}</div>
        </div>
        
        {/* Sick Leave */}
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700/50 rounded-xl transition-all duration-200 hover:shadow-md dark:hover:shadow-lg hover:scale-[1.02]">
          <div className="w-12 h-12 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>          <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">{t('leave.sick')}</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{Number.isInteger(balance.sick) ? balance.sick : balance.sick.toFixed(1)}</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">{t('leave.daysAvailable')}</div>
        </div>
        
        {/* Casual Leave */}
        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 border border-purple-200 dark:border-purple-700/50 rounded-xl transition-all duration-200 hover:shadow-md dark:hover:shadow-lg hover:scale-[1.02]">
          <div className="w-12 h-12 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>          <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">{t('leave.casual')}</div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{Number.isInteger(balance.casual) ? balance.casual : balance.casual.toFixed(1)}</div>
          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">{t('leave.daysAvailable')}</div>
        </div>        {/* Unpaid Leave - Only show if available */}
        {balance.unpaid !== undefined && (
          <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/30 border border-orange-200 dark:border-orange-700/50 rounded-xl transition-all duration-200 hover:shadow-md dark:hover:shadow-lg hover:scale-[1.02]">
            <div className="w-12 h-12 bg-orange-500 dark:bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>            <div className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">{t('leave.unpaid')}</div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{Number.isInteger(balance.unpaid) ? balance.unpaid : balance.unpaid?.toFixed(1)}</div>
            <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">{t('leave.daysAvailable')}</div>
          </div>
        )}

        {/* Maternity Leave - Only show if available */}
        {balance.maternity !== undefined && (
          <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/30 border border-pink-200 dark:border-pink-700/50 rounded-xl transition-all duration-200 hover:shadow-md dark:hover:shadow-lg hover:scale-[1.02]">
            <div className="w-12 h-12 bg-pink-500 dark:bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>            <div className="text-sm font-medium text-pink-700 dark:text-pink-300 mb-1">{t('leave.maternity')}</div>
            <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">{Number.isInteger(balance.maternity) ? balance.maternity : balance.maternity?.toFixed(1)}</div>
            <div className="text-xs text-pink-600 dark:text-pink-400 font-medium">{t('leave.daysAvailable')}</div>
          </div>
        )}        {/* Paternity Leave - Only show if available */}
        {balance.paternity !== undefined && (
          <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/30 border border-indigo-200 dark:border-indigo-700/50 rounded-xl transition-all duration-200 hover:shadow-md dark:hover:shadow-lg hover:scale-[1.02]">
            <div className="w-12 h-12 bg-indigo-500 dark:bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>            <div className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-1">{t('leave.paternity')}</div>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{Number.isInteger(balance.paternity) ? balance.paternity : balance.paternity?.toFixed(1)}</div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{t('leave.daysAvailable')}</div>
          </div>
        )}

        {/* Other Leave - Only show if available */}
        {balance.other !== undefined && (
          <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/30 border border-gray-200 dark:border-gray-700/50 rounded-xl transition-all duration-200 hover:shadow-md dark:hover:shadow-lg hover:scale-[1.02]">
            <div className="w-12 h-12 bg-gray-500 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('leave.other')}</div>
            <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">{Number.isInteger(balance.other) ? balance.other : balance.other?.toFixed(1)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">{t('leave.daysAvailable')}</div>
          </div>
        )}
      </div>

      {/* Summary Section */}      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('leave.totalLeaveDaysAvailable')}
          </div>          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {(balance.annual + balance.sick + balance.casual + (balance.unpaid || 0) + (balance.maternity || 0) + (balance.paternity || 0) + (balance.other || 0))} {t('leave.days')}
          </div>
        </div>
      </div>
    </div>
  );
}