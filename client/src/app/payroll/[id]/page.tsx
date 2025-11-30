'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { Payroll } from '@/types/payroll';
import { payrollAPI } from '@/lib/api';
import PayrollDetails from '@/components/payroll/PayrollDetails';

export default function PayrollDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const payrollId = params.id as string;

  const fetchPayroll = useCallback(async () => {
    try {
      setLoading(true);
      const data = await payrollAPI.getPayrollById(payrollId);
      setPayroll(data);
    } catch (err: unknown) {
      setError((err as {response?: {data?: {error?: string}}}).response?.data?.error || 'Failed to fetch payroll');
    } finally {
      setLoading(false);
    }
  }, [payrollId]);

  useEffect(() => {
    if (payrollId) {
      fetchPayroll();
    }
  }, [payrollId, fetchPayroll]);

  const handleApprove = async () => {
    if (window.confirm(t('payroll.areYouSureApprovePayroll'))) {
      try {
        await payrollAPI.approvePayroll(payrollId);
        fetchPayroll();
      } catch (err: unknown) {
        alert((err as {response?: {data?: {error?: string}}}).response?.data?.error || 'Failed to approve payroll');
      }
    }
  };

  const handleMarkPaid = async () => {
    if (window.confirm(t('payroll.areYouSureMarkPaid'))) {
      try {
        await payrollAPI.markAsPaid(payrollId);
        fetchPayroll();
      } catch (err: unknown) {
        alert((err as {response?: {data?: {error?: string}}}).response?.data?.error || 'Failed to mark as paid');
      }
    }
  };

  const canEdit = !!(user && (user.role === 'admin' || user.role === 'manager'));

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !payroll) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 p-4 rounded-lg">
          {error || t('payrollNotFound')}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('payroll.back')}
        </button>
      </div>

      <PayrollDetails
        payroll={payroll}
        onApprove={handleApprove}
        onMarkPaid={handleMarkPaid}
        canEdit={canEdit}
      />
    </div>
  );
}

