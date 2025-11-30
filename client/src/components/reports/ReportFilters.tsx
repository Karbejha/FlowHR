'use client';

import { useTranslation } from '@/contexts/I18nContext';
import { useState, useEffect } from 'react';

export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  department?: string;
  employee?: string;
  status?: string;
  month?: number;
  year?: number;
}

interface ReportFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  showDateRange?: boolean;
  showDepartment?: boolean;
  showEmployee?: boolean;
  showStatus?: boolean;
  showMonthYear?: boolean;
  departments?: string[];
  employees?: Array<{ id: string; name: string }>;
  statuses?: string[];
  initialFilters?: FilterOptions;
  storageKey?: string;
}

export default function ReportFilters({
  onFilterChange,
  showDateRange = true,
  showDepartment = true,
  showEmployee = false,
  showStatus = false,
  showMonthYear = false,
  departments = [],
  employees = [],
  statuses = [],
  initialFilters = {},
  storageKey
}: ReportFiltersProps) {
  const { t } = useTranslation();
  const currentDate = new Date();
  
  // Load saved filters from localStorage if storageKey is provided
  const loadSavedFilters = (): FilterOptions => {
    if (storageKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing saved filters:', e);
        }
      }
    }
    return initialFilters;
  };

  const [filters, setFilters] = useState<FilterOptions>(loadSavedFilters());

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(filters));
    }
    onFilterChange(filters);
  }, [filters, storageKey, onFilterChange]);

  const handleFilterChange = (key: keyof FilterOptions, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {};
    setFilters(resetFilters);
    if (storageKey && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  };

  // Generate year options (current year and 5 years back)
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentDate.getFullYear() - i);

  const monthNames = [
    t('reports.months.january'),
    t('reports.months.february'),
    t('reports.months.march'),
    t('reports.months.april'),
    t('reports.months.may'),
    t('reports.months.june'),
    t('reports.months.july'),
    t('reports.months.august'),
    t('reports.months.september'),
    t('reports.months.october'),
    t('reports.months.november'),
    t('reports.months.december')
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 print:hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t('reports.filters')}
        </h3>
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {t('reports.resetFilters')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Date Range Filters */}
        {showDateRange && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('reports.startDate')}
              </label>
              <input
                type="date"
                title='Start Date'
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('reports.endDate')}
              </label>
              <input
                type="date"
                title='End Date'
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </>
        )}

        {/* Month and Year Filters */}
        {showMonthYear && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('reports.month')}
              </label>
              <select
                title='Month'
                value={filters.month || ''}
                onChange={(e) => handleFilterChange('month', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('reports.allMonths')}</option>
                {monthNames.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('reports.year')}
              </label>
              <select
                title='Year'
                value={filters.year || ''}
                onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t('reports.allYears')}</option>
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Department Filter */}
        {showDepartment && departments.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('reports.department')}
            </label>
            <select
              title='Department'
              value={filters.department || ''}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('reports.allDepartments')}</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        )}

        {/* Employee Filter */}
        {showEmployee && employees.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('reports.employee')}
            </label>
            <select
              title='Employee'
              value={filters.employee || ''}
              onChange={(e) => handleFilterChange('employee', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('reports.allEmployees')}</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Status Filter */}
        {showStatus && statuses.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('reports.status')}
            </label>
            <select
              title='Status'
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('reports.allStatuses')}</option>
              {statuses.map(status => (
                <option key={status} value={status}>{t(`reports.status_${status}`)}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

