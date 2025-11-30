'use client';

import { useTranslation } from '@/contexts/I18nContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Line, Area, AreaChart
} from 'recharts';
import { isRTL } from '@/lib/i18n-config';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

interface FinancialChartsProps {
  data: {
    revenue?: Array<{ name: string; value: number }>;
    expenses?: Array<{ name: string; value: number }>;
    trends?: Array<{ month: string; revenue: number; expenses: number; profit: number }>;
    distribution?: Array<{ name: string; value: number; percentage: number }>;
  };
  chartType?: 'revenue' | 'expenses' | 'trends' | 'distribution' | 'all';
}

export default function FinancialCharts({ data, chartType = 'all' }: FinancialChartsProps) {
  const { t, locale } = useTranslation();
  const rtlMode = isRTL(locale);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const renderRevenueChart = () => {
    if (!data.revenue || data.revenue.length === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {t('reports.revenueChart')}
        </h3>
        <div className="h-80" dir={rtlMode ? "rtl" : "ltr"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.revenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={rtlMode ? { textAlign: 'right', direction: 'rtl' } : undefined}
              />
              <Legend />
              <Bar dataKey="value" fill="#00C49F" name={t('reports.revenue')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderExpensesChart = () => {
    if (!data.expenses || data.expenses.length === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {t('reports.expensesChart')}
        </h3>
        <div className="h-80" dir={rtlMode ? "rtl" : "ltr"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.expenses}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={rtlMode ? { textAlign: 'right', direction: 'rtl' } : undefined}
              />
              <Legend />
              <Bar dataKey="value" fill="#FF8042" name={t('reports.expenses')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderTrendsChart = () => {
    if (!data.trends || data.trends.length === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {t('reports.financialTrends')}
        </h3>
        <div className="h-80" dir={rtlMode ? "rtl" : "ltr"}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={rtlMode ? { textAlign: 'right', direction: 'rtl' } : undefined}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stackId="1" 
                stroke="#00C49F" 
                fill="#00C49F" 
                name={t('reports.revenue')}
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stackId="2" 
                stroke="#FF8042" 
                fill="#FF8042" 
                name={t('reports.expenses')}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#0088FE" 
                strokeWidth={3}
                name={t('reports.profit')}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderDistributionChart = () => {
    if (!data.distribution || data.distribution.length === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {t('reports.distributionChart')}
        </h3>
        <div className="h-80" dir={rtlMode ? "rtl" : "ltr"}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.distribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
              >
                {data.distribution.map((entry, index) => (
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
    );
  };

  return (
    <div>
      {(chartType === 'revenue' || chartType === 'all') && renderRevenueChart()}
      {(chartType === 'expenses' || chartType === 'all') && renderExpensesChart()}
      {(chartType === 'trends' || chartType === 'all') && renderTrendsChart()}
      {(chartType === 'distribution' || chartType === 'all') && renderDistributionChart()}
    </div>
  );
}

