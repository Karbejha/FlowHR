'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { PayrollReport } from '@/types/payroll';
import { payrollAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PayrollReportPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [report, setReport] = useState<PayrollReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);

  const currentDate = new Date();
  const [filters, setFilters] = useState({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear()
  });

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setUnauthorized(false);
      const data = await payrollAPI.getPayrollReport(filters.month, filters.year);
      setReport(data);
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number; data?: { error?: string } } };
      const status = axiosError?.response?.status;
      if (status === 401 || status === 403) {
        setUnauthorized(true);
        setError('');
      } else {
        setError(axiosError?.response?.data?.error || 'Failed to fetch report');
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Show loading while fetching report
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Show login required if unauthorized
  if (unauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <svg 
                className="mx-auto h-16 w-16 text-blue-600 dark:text-blue-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {t('auth.loginRequired') || 'Authentication Required'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('auth.loginToViewReport') || 'Please login to view this report'}
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {t('auth.goToLogin') || 'Go to Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show error if there's an error
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  // Show report
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {t('reports.payrollReportTitle')}
        </h1>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('reports.month')}
              </label>
              <select
                value={filters.month}
                title='Month'
                onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('reports.year')}
              </label>
              <input
                type="number"
                title='Year'
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                min="2020"
                max="2100"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 p-4 rounded-lg">
          {error}
        </div>
      ) : report ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('reports.totalEmployees')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {report.summary.totalEmployees}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('reports.grossSalary')}</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(report.summary.totalGrossSalary)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('reports.totalDeductions')}</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(report.summary.totalDeductions)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('reports.netSalary')}</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(report.summary.totalNetSalary)}
              </p>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('reports.averageSalary')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(report.summary.averageSalary)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('reports.workingDays')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {report.summary.workingDays}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('reports.totalOvertimePay')}</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(report.summary.totalOvertimePay)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('reports.totalBonuses')}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(report.summary.totalBonuses)}
              </p>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('reports.statusBreakdown')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {report.summary.byStatus.draft}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('draft')}</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {report.summary.byStatus.pending}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('pending')}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {report.summary.byStatus.approved}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('approved')}</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {report.summary.byStatus.paid}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('paid')}</p>
              </div>
            </div>
          </div>

          {/* Department Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('reports.departmentBreakdown')}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('employees.department')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('reports.employees')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('reports.totalGross')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('reports.totalNet')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('reports.average')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.entries(report.summary.byDepartment).map(([dept, data]) => (
                    <tr key={dept}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {dept}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {data.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {formatCurrency(data.totalGrossSalary)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                        {formatCurrency(data.totalNetSalary)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                        {formatCurrency(data.averageSalary)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
