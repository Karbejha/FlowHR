'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import AuthGuard from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/auth';
import api from '@/lib/api';
import OperationalDashboard from '@/components/reports/OperationalDashboard';

// Define the time and attendance data structure
interface TimeAttendanceData {
  totalRecords: number;
  onTime: number;
  late: number;
  earlyDeparture: number;
  absent: number;
  workHoursByDepartment: Record<string, { total: number, count: number, average: number }>;
  attendanceByDay: Record<string, number>;
  averageWorkHours: number;
  latePercentage: number;
}

export default function TimeAttendancePage() {
  const { t } = useTranslation();
  const [timeAttendanceData, setTimeAttendanceData] = useState<TimeAttendanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeAttendanceData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/reports/attendance');
        setTimeAttendanceData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching time and attendance data:', err);
        setError(
          err instanceof Error 
            ? err.message 
            : 'Failed to fetch time and attendance data'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeAttendanceData();
  }, []);

  return (
    <AuthGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('reports.timeAttendanceTitle')}</h1>
        
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
        
        {!isLoading && !error && timeAttendanceData && (
          <OperationalDashboard 
            reportType="attendance" 
            timeAttendanceData={timeAttendanceData} 
          />
        )}
      </div>
    </AuthGuard>
  );
}
