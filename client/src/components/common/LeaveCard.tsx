'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { Leave, LeaveType } from '@/types/leave';
import { User } from '@/types/auth';

interface LeaveCardProps {
  className?: string;
}

const LeaveCard: React.FC<LeaveCardProps> = ({ className = '' }) => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [leaveRequests, setLeaveRequests] = useState<Leave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4; // Show only 4 leave requests per page

  // Get current month
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      if (!token) return;

      try {
        setIsLoading(true);        
        // Include token in the headers for authentication
        const response = await fetch(`/api/leave/monthly?month=${currentMonth}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies
        });
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = { error: 'Failed to parse error response' };
          }
          console.error('Error response:', errorData);
          throw new Error(errorData.error || 'Failed to fetch leave requests');
        }

        const data = await response.json();
        
        // Sort leave requests by start date (closest first)
        const sortedLeaves = [...data].sort((a, b) => {
          const dateA = new Date(a.startDate);
          const dateB = new Date(b.startDate);
          return dateA.getTime() - dateB.getTime();
        });
        
        setLeaveRequests(sortedLeaves);
      } catch (err) {
        console.error('Error fetching leave requests:', err);
        setError('Failed to load leave requests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [token, currentMonth]);

  // Function to format date as "15 June"
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
  };

  // Function to get leave type display name
  const getLeaveTypeName = (type: LeaveType) => {
    switch (type) {
      case LeaveType.ANNUAL:
        return t('leave.types.annual');
      case LeaveType.SICK:
        return t('leave.types.sick');
      case LeaveType.CASUAL:
        return t('leave.types.casual');
      case LeaveType.UNPAID:
        return t('leave.types.unpaid');
      case LeaveType.MATERNITY:
        return t('leave.types.maternity');
      case LeaveType.PATERNITY:
        return t('leave.types.paternity');
      case LeaveType.OTHER:
        return t('leave.types.other');
      default:
        return type;
    }
  };

  // Default avatar placeholder
  const defaultAvatar = (
    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    </div>
  );

  // Calculate pagination
  const totalPages = Math.ceil(leaveRequests.length / itemsPerPage);
  const paginatedLeaveRequests = leaveRequests.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">
            {`${currentMonthName} ${t('leave.monthlyLeaves') || 'Leave Requests'}`}
          </h2>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">{t('common.loading') || 'Loading...'}</span>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">{error}</div>
        ) : leaveRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>{t('leave.noLeavesThisMonth') || `No leave requests in ${currentMonthName}`}</p>
            <p className="text-sm mt-2">Everyone is working hard!</p>
          </div>
        ) : (
          <div>
            <div className="space-y-4 min-h-[280px]">
              {paginatedLeaveRequests.map((leave) => {
                const employee = leave.employee as unknown as User;
                return (
                  <div 
                    key={leave._id} 
                    className="flex items-center p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors shadow-sm"
                  >
                    {employee.avatar ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={employee.avatar}
                          alt={`${employee.firstName} ${employee.lastName}`}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : defaultAvatar}
                    
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {employee.firstName} {employee.lastName}
                      </h3>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                          <span className="mx-1">•</span>
                          {getLeaveTypeName(leave.leaveType)}
                          <span className="mx-1">•</span>
                          {leave.totalDays} {leave.totalDays === 1 ? t('common.day') : t('common.days')}
                        </p>
                        
                        {/* Calendar icon */}
                        <span className="text-green-500 dark:text-green-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-500 disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={currentPage === 0}
                  aria-label={t('common.previous')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {currentPage + 1} / {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-500 disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={currentPage === totalPages - 1}
                  aria-label={t('common.next')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveCard;
