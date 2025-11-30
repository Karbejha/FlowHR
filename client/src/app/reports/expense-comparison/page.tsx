'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import AuthGuard from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/auth';
import api from '@/lib/api';
import ReportActions from '@/components/reports/ReportActions';
import ReportFilters, { FilterOptions } from '@/components/reports/ReportFilters';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { isRTL } from '@/lib/i18n-config';

interface ExpenseComparisonData {
  summary: {
    currentPeriodExpenses: number;
    previousPeriodExpenses: number;
    changeAmount: number;
    changePercentage: number;
  };
  monthlyComparison: Array<{
    month: string;
    currentYear: number;
    previousYear: number;
    difference: number;
  }>;
  departmentComparison: Array<{
    department: string;
    currentPeriod: number;
    previousPeriod: number;
    change: number;
    changePercentage: number;
  }>;
  categoryComparison: Array<{
    category: string;
    currentPeriod: number;
    previousPeriod: number;
    change: number;
  }>;
  forecast: Array<{
    month: string;
    actual: number;
    forecast: number;
  }>;
}

export default function ExpenseComparisonPage() {
  const { t, locale } = useTranslation();
  const rtlMode = isRTL(locale);
  const [data, setData] = useState<ExpenseComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/reports/expense-comparison', {
        params: filters
      });
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching expense comparison data:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to fetch expense comparison data'
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <AuthGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('reports.expenseComparisonTitle')}</h1>
        
        <ReportFilters
          onFilterChange={setFilters}
          showDateRange={true}
          showDepartment={true}
          showMonthYear={true}
          storageKey="expense-comparison-filters"
        />

        <ReportActions
          reportTitle={t('reports.expenseComparisonTitle')}
          reportData={data}
        />
        
        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        {!isLoading && !error && data && (
          <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg shadow">
                <h4 className="text-sm font-medium text-blue-500 dark:text-blue-300">{t('reports.currentPeriod')}</h4>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">{formatCurrency(data.summary.currentPeriodExpenses)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg shadow">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-300">{t('reports.previousPeriod')}</h4>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">{formatCurrency(data.summary.previousPeriodExpenses)}</p>
              </div>
              <div className={`p-4 rounded-lg shadow ${data.summary.changeAmount >= 0 ? 'bg-red-50 dark:bg-red-900' : 'bg-green-50 dark:bg-green-900'}`}>
                <h4 className={`text-sm font-medium ${data.summary.changeAmount >= 0 ? 'text-red-500 dark:text-red-300' : 'text-green-500 dark:text-green-300'}`}>
                  {t('reports.changeAmount')}
                </h4>
                <p className={`text-2xl font-bold ${data.summary.changeAmount >= 0 ? 'text-red-700 dark:text-red-200' : 'text-green-700 dark:text-green-200'}`}>
                  {data.summary.changeAmount >= 0 ? '+' : ''}{formatCurrency(data.summary.changeAmount)}
                </p>
              </div>
              <div className={`p-4 rounded-lg shadow ${data.summary.changePercentage >= 0 ? 'bg-red-50 dark:bg-red-900' : 'bg-green-50 dark:bg-green-900'}`}>
                <h4 className={`text-sm font-medium ${data.summary.changePercentage >= 0 ? 'text-red-500 dark:text-red-300' : 'text-green-500 dark:text-green-300'}`}>
                  {t('reports.changePercentage')}
                </h4>
                <p className={`text-2xl font-bold ${data.summary.changePercentage >= 0 ? 'text-red-700 dark:text-red-200' : 'text-green-700 dark:text-green-200'}`}>
                  {data.summary.changePercentage >= 0 ? '+' : ''}{data.summary.changePercentage.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Monthly Comparison Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                {t('reports.monthlyComparison')}
              </h3>
              <div className="h-80" dir={rtlMode ? "rtl" : "ltr"}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={rtlMode ? { textAlign: 'right', direction: 'rtl' } : undefined}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="currentYear" 
                      stroke="#0088FE" 
                      strokeWidth={2}
                      name={t('reports.currentYear')}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="previousYear" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      name={t('reports.previousYear')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Comparison Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                {t('reports.departmentComparison')}
              </h3>
              <div className="h-80" dir={rtlMode ? "rtl" : "ltr"}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.departmentComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={rtlMode ? { textAlign: 'right', direction: 'rtl' } : undefined}
                    />
                    <Legend />
                    <Bar dataKey="currentPeriod" fill="#0088FE" name={t('reports.currentPeriod')} />
                    <Bar dataKey="previousPeriod" fill="#82ca9d" name={t('reports.previousPeriod')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Forecast Chart */}
            {data.forecast && data.forecast.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  {t('reports.expenseForecast')}
                </h3>
                <div className="h-80" dir={rtlMode ? "rtl" : "ltr"}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.forecast}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={rtlMode ? { textAlign: 'right', direction: 'rtl' } : undefined}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke="#0088FE" 
                        strokeWidth={2}
                        name={t('reports.actual')}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="forecast" 
                        stroke="#FF8042" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name={t('reports.forecast')}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Department Comparison Table */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                {t('reports.detailedDepartmentComparison')}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('reports.department')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('reports.currentPeriod')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('reports.previousPeriod')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('reports.change')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('reports.changePercentage')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.departmentComparison.map((dept, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {dept.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(dept.currentPeriod)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(dept.previousPeriod)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${dept.change >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {dept.change >= 0 ? '+' : ''}{formatCurrency(dept.change)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${dept.changePercentage >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {dept.changePercentage >= 0 ? '+' : ''}{dept.changePercentage.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

