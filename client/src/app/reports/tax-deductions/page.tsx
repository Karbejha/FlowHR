'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import AuthGuard from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/auth';
import api from '@/lib/api';
import ReportActions from '@/components/reports/ReportActions';
import ReportFilters, { FilterOptions } from '@/components/reports/ReportFilters';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { isRTL } from '@/lib/i18n-config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface TaxDeductionsData {
  summary: {
    totalTaxes: number;
    totalSocialInsurance: number;
    totalHealthInsurance: number;
    totalOtherDeductions: number;
    totalDeductions: number;
  };
  byDepartment: Array<{
    department: string;
    taxes: number;
    socialInsurance: number;
    healthInsurance: number;
    other: number;
    total: number;
  }>;
  byEmployee: Array<{
    employeeName: string;
    department: string;
    taxes: number;
    socialInsurance: number;
    healthInsurance: number;
    other: number;
    total: number;
  }>;
  quarterlyBreakdown: Array<{
    quarter: string;
    taxes: number;
    socialInsurance: number;
    healthInsurance: number;
    total: number;
  }>;
}

export default function TaxDeductionsPage() {
  const { t, locale } = useTranslation();
  const rtlMode = isRTL(locale);
  const [data, setData] = useState<TaxDeductionsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/reports/tax-deductions', {
        params: filters
      });
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tax deductions data:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to fetch tax deductions data'
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
      currency: 'USD'
    }).format(amount);
  };

  const handleExportPDF = () => {
    if (!data) {
      const emptyPdf = new jsPDF('l', 'mm', 'a4');
      emptyPdf.text(t('reports.noDataAvailable') || 'No data available', 15, 20);
      return emptyPdf;
    }

    const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape for wider tables
    
    // Title
    pdf.setFontSize(18);
    pdf.text(t('reports.taxDeductionsTitle'), 15, 20);
    
    // Date
    pdf.setFontSize(10);
    pdf.text(`${t('reports.generatedOn')}: ${new Date().toLocaleString()}`, 15, 28);
    
    // Summary
    pdf.setFontSize(14);
    pdf.text(t('reports.summary'), 15, 38);
    
    const summaryData = [
      [t('reports.totalTaxes'), formatCurrency(data.summary.totalTaxes)],
      [t('reports.socialInsurance'), formatCurrency(data.summary.totalSocialInsurance)],
      [t('reports.healthInsurance'), formatCurrency(data.summary.totalHealthInsurance)],
      [t('reports.otherDeductions'), formatCurrency(data.summary.totalOtherDeductions)],
      [t('reports.totalDeductions'), formatCurrency(data.summary.totalDeductions)]
    ];
    
    autoTable(pdf, {
      head: [[t('reports.deductionType'), t('reports.amount')]],
      body: summaryData,
      startY: 43,
      theme: 'striped'
    });
    
  // Department breakdown
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.text(t('reports.departmentBreakdown'), 15, 20);
    
    const deptData = data.byDepartment.map(dept => [
      dept.department,
      formatCurrency(dept.taxes),
      formatCurrency(dept.socialInsurance),
      formatCurrency(dept.healthInsurance),
      formatCurrency(dept.other),
      formatCurrency(dept.total)
    ]);
    
    autoTable(pdf, {
      head: [[
        t('reports.department'), 
        t('reports.taxes'), 
        t('reports.socialInsurance'), 
        t('reports.healthInsurance'),
        t('reports.other'),
        t('reports.total')
      ]],
      body: deptData,
      startY: 25,
      theme: 'striped',
      styles: { fontSize: 8 }
    });
    
    return pdf;
  };

  return (
    <AuthGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('reports.taxDeductionsTitle')}</h1>
        
        <ReportFilters
          onFilterChange={setFilters}
          showDateRange={true}
          showDepartment={true}
          showMonthYear={true}
          storageKey="tax-deductions-filters"
        />

        <ReportActions
          reportTitle={t('reports.taxDeductionsTitle')}
          customPDFGenerator={handleExportPDF}
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg shadow">
                <h4 className="text-sm font-medium text-red-500 dark:text-red-300">{t('reports.totalTaxes')}</h4>
                <p className="text-2xl font-bold text-red-700 dark:text-red-200">{formatCurrency(data.summary.totalTaxes)}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg shadow">
                <h4 className="text-sm font-medium text-blue-500 dark:text-blue-300">{t('reports.socialInsurance')}</h4>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">{formatCurrency(data.summary.totalSocialInsurance)}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg shadow">
                <h4 className="text-sm font-medium text-green-500 dark:text-green-300">{t('reports.healthInsurance')}</h4>
                <p className="text-2xl font-bold text-green-700 dark:text-green-200">{formatCurrency(data.summary.totalHealthInsurance)}</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg shadow">
                <h4 className="text-sm font-medium text-yellow-500 dark:text-yellow-300">{t('reports.otherDeductions')}</h4>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-200">{formatCurrency(data.summary.totalOtherDeductions)}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg shadow">
                <h4 className="text-sm font-medium text-purple-500 dark:text-purple-300">{t('reports.totalDeductions')}</h4>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-200">{formatCurrency(data.summary.totalDeductions)}</p>
              </div>
            </div>

            {/* Deduction Distribution Pie Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                {t('reports.deductionsDistribution')}
              </h3>
              <div className="h-80" dir={rtlMode ? "rtl" : "ltr"}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: t('reports.taxes'), value: data.summary.totalTaxes },
                        { name: t('reports.socialInsurance'), value: data.summary.totalSocialInsurance },
                        { name: t('reports.healthInsurance'), value: data.summary.totalHealthInsurance },
                        { name: t('reports.otherDeductions'), value: data.summary.totalOtherDeductions }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label
                    >
                      {[0, 1, 2, 3].map((index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={rtlMode ? { textAlign: 'right', direction: 'rtl' } : undefined}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quarterly Breakdown Chart */}
            {data.quarterlyBreakdown && data.quarterlyBreakdown.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  {t('reports.quarterlyBreakdown')}
                </h3>
                <div className="h-80" dir={rtlMode ? "rtl" : "ltr"}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.quarterlyBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={rtlMode ? { textAlign: 'right', direction: 'rtl' } : undefined}
                      />
                      <Legend />
                      <Bar dataKey="taxes" fill="#FF8042" name={t('reports.taxes')} />
                      <Bar dataKey="socialInsurance" fill="#0088FE" name={t('reports.socialInsurance')} />
                      <Bar dataKey="healthInsurance" fill="#00C49F" name={t('reports.healthInsurance')} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Department Breakdown Table */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                {t('reports.departmentBreakdown')}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('reports.department')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('reports.taxes')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('reports.socialInsurance')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('reports.healthInsurance')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('reports.other')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('reports.total')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.byDepartment.map((dept, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {dept.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(dept.taxes)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(dept.socialInsurance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(dept.healthInsurance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(dept.other)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-600 dark:text-purple-400">
                          {formatCurrency(dept.total)}
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

