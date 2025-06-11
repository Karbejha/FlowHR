'use client';
import { UserRole } from '@/types/auth';
import AuthGuard from '@/components/auth/AuthGuard';
import EmployeeList from '@/components/employees/EmployeeList';
import { useTranslation } from '@/contexts/I18nContext';

export default function EmployeesPage() {
  const { t } = useTranslation();
  
  return (
    <AuthGuard allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8 safe-top">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-gray-900 dark:text-gray-100">
            {t('employee.employeeManagement')}
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-4 md:p-6 border border-gray-200 dark:border-gray-700 transition-all duration-200">
            <EmployeeList />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}