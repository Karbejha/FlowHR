'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { User } from '@/types/auth';

interface BirthdayCardProps {
  className?: string;
}

const BirthdayCard: React.FC<BirthdayCardProps> = ({ className = '' }) => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [birthdayEmployees, setBirthdayEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current month
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed
  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });
  useEffect(() => {
    const fetchBirthdayEmployees = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        const response = await fetch(`/api/users/birthdays?month=${currentMonth}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
          console.error('Error response:', errorData);
          throw new Error(errorData.error || 'Failed to fetch birthday employees');
        }

        const data = await response.json();
        setBirthdayEmployees(data);      } catch (err) {
        console.error('Error fetching birthday employees:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load birthday employees';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBirthdayEmployees();
  }, [token, currentMonth]);

  // Function to format date as "15 June"
  const formatBirthdayDate = (date: string) => {
    const birthday = new Date(date);
    return birthday.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
  };

  // Function to get age
  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Default avatar placeholder
  const defaultAvatar = (
    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    </div>
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-700 dark:to-purple-800 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white">{`${currentMonthName} ${t('employee.birthdays') || 'Birthdays'}`}</h2>
        </div>
      </div>

      <div className="p-6">        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">{t('common.loading') || 'Loading...'}</span>
          </div>        ) : error ? (
          <div className="flex flex-col items-center justify-center py-6 text-gray-500 dark:text-gray-400">
            <svg className="w-10 h-10 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium">{error}</p>
            <p className="text-sm mt-1">{t('common.tryAgainLater') || 'Please try again later'}</p>
          </div>
        ) : birthdayEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
            </svg>
            <p>{t('employee.noBirthdaysThisMonth') || `No birthdays in ${currentMonthName}`}</p>
            <p className="text-sm mt-2">Check back next month!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {birthdayEmployees.map((employee) => (
              <div 
                key={employee._id} 
                className="flex items-center p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
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
                      {formatBirthdayDate(employee.dateOfBirth.toString())}
                      <span className="mx-1">•</span>
                      {t('employee.turningAge', { age: getAge(employee.dateOfBirth.toString()) + 1 }) || `Turning ${getAge(employee.dateOfBirth.toString()) + 1}`}
                    </p>
                    
                    {/* Birthday cake icon */}
                    <span className="text-purple-500 dark:text-purple-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 3a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm2 3a1 1 0 00-2 0v1a2 2 0 00-2 2v1a2 2 0 00-2 2v.683a3.7 3.7 0 011.055.485 1.704 1.704 0 001.89 0 3.704 3.704 0 014.11 0 1.704 1.704 0 001.89 0 3.704 3.704 0 014.11 0 1.704 1.704 0 001.89 0A3.7 3.7 0 0118 12.683V12a2 2 0 00-2-2V9a2 2 0 00-2-2V6a1 1 0 10-2 0v1h-1V6a1 1 0 10-2 0v1H8V6zm10 8.868a3.704 3.704 0 01-4.055-.036 1.704 1.704 0 00-1.89 0 3.704 3.704 0 01-4.11 0 1.704 1.704 0 00-1.89 0A3.704 3.704 0 012 14.868V17a1 1 0 001 1h14a1 1 0 001-1v-2.132zM9 3a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm3 0a1 1 0 011-1h.01a1 1 0 110 2H13a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthdayCard;
