'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import GeneratePayrollForm from '@/components/payroll/GeneratePayrollForm';

export default function GeneratePayrollPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 p-4 rounded-lg">
          {t('payroll.noAccessToGeneratePayroll')}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('payroll.generatePayroll')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('payroll.generatePayrollDescription')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <GeneratePayrollForm
            onSuccess={() => {
              router.push('/payroll');
            }}
            onCancel={() => {
              router.back();
            }}
          />
        </div>
      </div>
    </div>
  );
}

