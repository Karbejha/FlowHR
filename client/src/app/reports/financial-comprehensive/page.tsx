'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import AuthGuard from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/auth';
import api from '@/lib/api';
import ReportActions from '@/components/reports/ReportActions';
import ReportFilters, { FilterOptions } from '@/components/reports/ReportFilters';
import FinancialCharts from '@/components/reports/FinancialCharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

type PdfWithAutoTable = jsPDF & {
  lastAutoTable?: {
    finalY: number;
  };
};

interface ComprehensiveFinancialData {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
  };
  byDepartment: Array<{
    department: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  expenseBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export default function ComprehensiveFinancialPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<ComprehensiveFinancialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/reports/financial-comprehensive', {
        params: filters
      });
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching comprehensive financial data:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to fetch comprehensive financial data'
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
      const emptyPdf = new jsPDF('p', 'mm', 'a4');
      emptyPdf.text(t('reports.noDataAvailable') || 'No data available', 15, 20);
      return emptyPdf;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Title
    pdf.setFontSize(18);
    pdf.text(t('reports.financialComprehensiveTitle'), 15, 20);
    
    // Date
    pdf.setFontSize(10);
    pdf.text(`${t('reports.generatedOn')}: ${new Date().toLocaleString()}`, 15, 28);
    
    // Summary
    pdf.setFontSize(14);
    pdf.text(t('reports.summary'), 15, 40);
    
    const summaryData = [
      [t('reports.totalRevenue'), formatCurrency(data.summary.totalRevenue)],
      [t('reports.totalExpenses'), formatCurrency(data.summary.totalExpenses)],
      [t('reports.netProfit'), formatCurrency(data.summary.netProfit)],
      [t('reports.profitMargin'), `${data.summary.profitMargin.toFixed(2)}%`]
    ];
    
    autoTable(pdf, {
      head: [[t('reports.metric'), t('reports.value')]],
      body: summaryData,
      startY: 45,
      theme: 'striped'
    });
    
    // Department breakdown
  const finalY = (pdf as PdfWithAutoTable).lastAutoTable?.finalY ?? 90;
    pdf.setFontSize(14);
    pdf.text(t('reports.byDepartment'), 15, finalY + 10);
    
    const deptData = data.byDepartment.map(dept => [
      dept.department,
      formatCurrency(dept.revenue),
      formatCurrency(dept.expenses),
      formatCurrency(dept.profit)
    ]);
    
    autoTable(pdf, {
      head: [[t('reports.department'), t('reports.revenue'), t('reports.expenses'), t('reports.profit')]],
      body: deptData,
      startY: finalY + 15,
      theme: 'striped'
    });
    
    return pdf;
  };

  const handleExportExcel = () => {
    if (!data) return;

    const wb = XLSX.utils.book_new();
    
    // Summary sheet
    const summaryWS = XLSX.utils.json_to_sheet([
      {
        [t('reports.metric')]: t('reports.totalRevenue'),
        [t('reports.value')]: data.summary.totalRevenue
      },
      {
        [t('reports.metric')]: t('reports.totalExpenses'),
        [t('reports.value')]: data.summary.totalExpenses
      },
      {
        [t('reports.metric')]: t('reports.netProfit'),
        [t('reports.value')]: data.summary.netProfit
      },
      {
        [t('reports.metric')]: t('reports.profitMargin'),
        [t('reports.value')]: `${data.summary.profitMargin}%`
      }
    ]);
    XLSX.utils.book_append_sheet(wb, summaryWS, t('reports.summary'));
    
    // Department sheet
    const deptWS = XLSX.utils.json_to_sheet(data.byDepartment.map(dept => ({
      [t('reports.department')]: dept.department,
      [t('reports.revenue')]: dept.revenue,
      [t('reports.expenses')]: dept.expenses,
      [t('reports.profit')]: dept.profit
    })));
    XLSX.utils.book_append_sheet(wb, deptWS, t('reports.departments'));
    
    // Monthly trends sheet
    const trendsWS = XLSX.utils.json_to_sheet(data.monthlyTrends.map(trend => ({
      [t('reports.month')]: trend.month,
      [t('reports.revenue')]: trend.revenue,
      [t('reports.expenses')]: trend.expenses,
      [t('reports.profit')]: trend.profit
    })));
    XLSX.utils.book_append_sheet(wb, trendsWS, t('reports.trends'));
    
    XLSX.writeFile(wb, `Financial_Comprehensive_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <AuthGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('reports.financialComprehensiveTitle')}</h1>
        
        <ReportFilters
          onFilterChange={setFilters}
          showDateRange={true}
          showDepartment={true}
          showMonthYear={true}
          storageKey="financial-comprehensive-filters"
        />

        <ReportActions
          reportTitle={t('reports.financialComprehensiveTitle')}
          customPDFGenerator={handleExportPDF}
          customExcelGenerator={handleExportExcel}
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
              <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg shadow">
                <h4 className="text-sm font-medium text-green-500 dark:text-green-300">{t('reports.totalRevenue')}</h4>
                <p className="text-2xl font-bold text-green-700 dark:text-green-200">{formatCurrency(data.summary.totalRevenue)}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg shadow">
                <h4 className="text-sm font-medium text-red-500 dark:text-red-300">{t('reports.totalExpenses')}</h4>
                <p className="text-2xl font-bold text-red-700 dark:text-red-200">{formatCurrency(data.summary.totalExpenses)}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg shadow">
                <h4 className="text-sm font-medium text-blue-500 dark:text-blue-300">{t('reports.netProfit')}</h4>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">{formatCurrency(data.summary.netProfit)}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg shadow">
                <h4 className="text-sm font-medium text-purple-500 dark:text-purple-300">{t('reports.profitMargin')}</h4>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-200">{data.summary.profitMargin.toFixed(2)}%</p>
              </div>
            </div>

            {/* Charts */}
            <FinancialCharts
              data={{
                trends: data.monthlyTrends,
                distribution: data.expenseBreakdown.map((item) => ({
                  name: item.category,
                  value: item.amount,
                  percentage: item.percentage
                }))
              }}
              chartType="all"
            />

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
                        {t('reports.revenue')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('reports.expenses')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('reports.profit')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.byDepartment.map((dept, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          {dept.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                          {formatCurrency(dept.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                          {formatCurrency(dept.expenses)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                          {formatCurrency(dept.profit)}
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

