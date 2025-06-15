'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import AuthGuard from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/auth';
import api from '@/lib/api';
import DemographicsDashboard from '@/components/reports/DemographicsDashboard';

// Define the demographics data structure
interface DemographicsData {
  totalEmployees: number;
  departmentDistribution: {
    _id: string;
    count: number;
  }[];
  roleDistribution: {
    _id: string;
    count: number;
  }[];
  ageDistribution: {
    range: string;
    count: number;
  }[];
  tenureDistribution: {
    range: string;
    count: number;
  }[];
  genderDistribution: {
    male: number;
    female: number;
    other: number;
    notSpecified: number;
  };
}

export default function ReportsPage() {
  const { t } = useTranslation();
  const [demographicsData, setDemographicsData] = useState<DemographicsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDemographicsData = async () => {      try {
        setIsLoading(true);
        const response = await api.get('/reports/demographics');
        setDemographicsData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching demographics data:', err);
        setError(
          err instanceof Error 
            ? err.message 
            : 'Failed to fetch demographics data'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDemographicsData();
  }, []);
  return (
    <AuthGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">{t('reports.demographicsTitle')}</h1>
        
        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 sm:px-4 sm:py-3 rounded mb-4 text-sm sm:text-base">
            <p>{error}</p>
          </div>
        )}
        
        {!isLoading && !error && demographicsData && (
          <DemographicsDashboard data={demographicsData} />
        )}
      </div>
    </AuthGuard>
  );
}
