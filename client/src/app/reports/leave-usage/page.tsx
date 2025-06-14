'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import AuthGuard from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/auth';
import api from '@/lib/api';
import OperationalDashboard from '@/components/reports/OperationalDashboard';

// Define the leave usage data structure
interface LeaveUsageData {
  totalLeaveRequests: number;
  totalDaysTaken: number;
  leaveByType: Record<string, number>;
  leaveByDepartment: Record<string, number>;
  leaveByMonth: number[];
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

export default function LeaveUsagePage() {
  const { t } = useTranslation();
  const [leaveUsageData, setLeaveUsageData] = useState<LeaveUsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const fetchLeaveUsageData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/reports/leave-usage?year=${year}`);
        setLeaveUsageData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching leave usage data:', err);
        setError(
          err instanceof Error 
            ? err.message 
            : 'Failed to fetch leave usage data'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveUsageData();
  }, [year]);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYear(parseInt(e.target.value));
  };

  // Generate year options (current year and 5 years back)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <AuthGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t('reports.leaveUsageTitle')}</h1>
          
          <div className="flex items-center">
            <label htmlFor="yearFilter" className="mr-2">{t('reports.filterByYear')}:</label>
            <select
              id="yearFilter"
              value={year}
              onChange={handleYearChange}
              className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2"
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        
        {isLoading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {!isLoading && !error && leaveUsageData && (
          <OperationalDashboard 
            reportType="leave" 
            leaveUsageData={leaveUsageData} 
          />
        )}
      </div>
    </AuthGuard>
  );
}
