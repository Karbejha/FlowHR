'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import AuthGuard from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/auth';
import api from '@/lib/api';
import OperationalDashboard from '@/components/reports/OperationalDashboard';

// Define the resource allocation data structure
interface ResourceAllocationData {
  totalEmployees: number;
  employeesByDepartment: Record<string, number>;
  employeesByRole: Record<string, number>;
  departmentAllocation: Array<{ department: string; count: number; percentage: number }>;
  roleDistribution: Array<{ role: string; count: number; percentage: number }>;
  projectAllocation: Array<{ projectName: string; employees: number; allocation: number }>;
}

export default function ResourceAllocationPage() {
  const { t } = useTranslation();
  const [resourceAllocationData, setResourceAllocationData] = useState<ResourceAllocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResourceAllocationData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/reports/resource-allocation');
        setResourceAllocationData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching resource allocation data:', err);
        setError(
          err instanceof Error 
            ? err.message 
            : 'Failed to fetch resource allocation data'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchResourceAllocationData();
  }, []);

  return (
    <AuthGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('reports.resourceAllocationTitle')}</h1>
        
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
        
        {!isLoading && !error && resourceAllocationData && (
          <OperationalDashboard 
            reportType="resource" 
            resourceAllocationData={resourceAllocationData} 
          />
        )}
      </div>
    </AuthGuard>
  );
}
