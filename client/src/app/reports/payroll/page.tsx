'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { PayrollReport } from '@/types/payroll';
import { payrollAPI } from '@/lib/api';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PayrollReportPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [report, setReport] = useState<PayrollReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentDate = new Date();
  const [filters, setFilters] = useState({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear()
  });

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await payrollAPI.getPayrollReport(filters.month, filters.year);
      setReport(data);
    } catch (err: unknown) {
      setError((err as {response?: {data?: {error?: string}}}).response?.data?.error || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'manager')) {
      fetchReport();
    }
  }, [user, fetchReport]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 p-4 rounded-lg">
          {t('noAccessToReports')}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {t('payrollReport')}
        </h1>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('month')}
              </label>
              <select
                value={filters.month}
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
                {t('year')}
              </label>
              <input
                type="number"
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('totalEmployees')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {report.summary.totalEmployees}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('grossSalary')}</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(report.summary.totalGrossSalary)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('totalDeductions')}</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(report.summary.totalDeductions)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('netSalary')}</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(report.summary.totalNetSalary)}
              </p>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('averageSalary')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(report.summary.averageSalary)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('workingDays')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {report.summary.workingDays}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('totalOvertimePay')}</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(report.summary.totalOvertimePay)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('totalBonuses')}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(report.summary.totalBonuses)}
              </p>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('statusBreakdown')}
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
              {t('departmentBreakdown')}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('department')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('employees')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('totalGross')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('totalNet')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('average')}
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

