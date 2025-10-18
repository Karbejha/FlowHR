'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { Payroll } from '@/types/payroll';
import { payrollAPI } from '@/lib/api';
import PayrollList from '@/components/payroll/PayrollList';
import Link from 'next/link';

const getMonthName = (index: number, t: (key: string) => string) => {
  if (index === 0) return t('payroll.allMonths');
  const months = [
    'payroll.january', 'payroll.february', 'payroll.march', 'payroll.april',
    'payroll.may', 'payroll.june', 'payroll.july', 'payroll.august',
    'payroll.september', 'payroll.october', 'payroll.november', 'payroll.december'
  ];
  return t(months[index - 1]);
};

export default function PayrollPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [filteredPayrolls, setFilteredPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState({
    year: currentYear,
    month: 0, // 0 = All months
    status: '',
    department: ''
  });

  const fetchPayrolls = useCallback(async () => {
    try {
      setLoading(true);
      const data = await payrollAPI.getAllPayrolls();
      setPayrolls(data);
    } catch (err: unknown) {
      setError((err as {response?: {data?: {error?: string}}}).response?.data?.error || 'Failed to fetch payrolls');
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...payrolls];

    if (filters.year) {
      filtered = filtered.filter(p => p.year === filters.year);
    }

    if (filters.month > 0) {
      filtered = filtered.filter(p => p.month === filters.month);
    }

    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    if (filters.department) {
      filtered = filtered.filter(p => p.employee.department === filters.department);
    }

    setFilteredPayrolls(filtered);
  }, [filters, payrolls]);

  useEffect(() => {
    if (user) {
      fetchPayrolls();
    }
  }, [user, fetchPayrolls]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleDelete = async (id: string) => {
    if (window.confirm(t('payroll.areYouSureDeletePayroll'))) {
      try {
        await payrollAPI.deletePayroll(id);
        fetchPayrolls();
      } catch (err: unknown) {
        alert((err as {response?: {data?: {error?: string}}}).response?.data?.error || 'Failed to delete payroll');
      }
    }
  };

  const handleApprove = async (id: string) => {
    if (window.confirm(t('payroll.areYouSureApprovePayroll'))) {
      try {
        await payrollAPI.approvePayroll(id);
        fetchPayrolls();
      } catch (err: unknown) {
        alert((err as {response?: {data?: {error?: string}}}).response?.data?.error || 'Failed to approve payroll');
      }
    }
  };

  const departments = Array.from(new Set(payrolls.map(p => p.employee.department)));

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 p-4 rounded-lg">
          {t('payroll.noAccessToPayroll')}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t('payroll.payrollManagement')}
          </h1>
          <div className="flex space-x-2">
            <Link
              href="/payroll/generate"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {t('payroll.generatePayroll')}
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('payroll.year')}
              </label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
              >
                {[currentYear, currentYear - 1, currentYear - 2].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('payroll.month')}
              </label>
              <select
                value={filters.month}
                onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
              >
                {Array.from({ length: 13 }, (_, i) => (
                  <option key={i} value={i}>{getMonthName(i, t)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('payroll.status')}
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">{t('payroll.allStatuses')}</option>
                <option value="draft">{t('payroll.draft')}</option>
                <option value="pending">{t('payroll.pending')}</option>
                <option value="approved">{t('payroll.approved')}</option>
                <option value="paid">{t('payroll.paid')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('payroll.department')}
              </label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">{t('payroll.allDepartments')}</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('payroll.totalPayrolls')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {filteredPayrolls.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('payroll.draft')}</p>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {filteredPayrolls.filter(p => p.status === 'draft').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('payroll.approved')}</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {filteredPayrolls.filter(p => p.status === 'approved').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('payroll.paid')}</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {filteredPayrolls.filter(p => p.status === 'paid').length}
            </p>
          </div>
        </div>
      </div>

      {/* Payroll List */}
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
            onDelete={handleDelete}
            onApprove={handleApprove}
            showActions={true}
          />
        </div>
      )}
    </div>
  );
}

