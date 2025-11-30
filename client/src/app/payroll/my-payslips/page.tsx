'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { Payroll } from '@/types/payroll';
import { payrollAPI } from '@/lib/api';
import PayrollList from '@/components/payroll/PayrollList';

export default function MyPayslipsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [filteredPayrolls, setFilteredPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const fetchPayslips = useCallback(async () => {
    try {
      setLoading(true);
      const data = await payrollAPI.getMyPayslips(selectedYear);
      setPayrolls(data);
      setFilteredPayrolls(data);
    } catch (err: unknown) {
      setError((err as {response?: {data?: {error?: string}}}).response?.data?.error || 'Failed to fetch payslips');
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (user) {
      fetchPayslips();
    }
  }, [user, fetchPayslips]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalPaid = payrolls
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.netSalary, 0);

  const averageSalary = payrolls.length > 0
    ? payrolls.reduce((sum, p) => sum + p.netSalary, 0) / payrolls.length
    : 0;

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 p-4 rounded-lg">
          {t('pleaseLogin')}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {t('payroll.myPayslips')}
        </h1>

        {/* Year Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('payroll.selectYear')}
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            title={t('payroll.selectYear')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
          >
            {[currentYear, currentYear - 1, currentYear - 2, currentYear - 3].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('payroll.totalPayslips')}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {payrolls.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('payroll.totalPaid')}</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('payroll.averageSalary')}</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(averageSalary)}
            </p>
          </div>
        </div>
      </div>

      {/* Payslips List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 p-4 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <PayrollList
            payrolls={filteredPayrolls}
            showActions={false}
          />
        </div>
      )}
    </div>
  );
}

