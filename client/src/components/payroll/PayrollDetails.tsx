'use client';

import { Payroll, PayrollStatus } from '@/types/payroll';
import { useTranslation } from '@/contexts/I18nContext';
import SalaryBreakdown from './SalaryBreakdown';
import PayslipCard from './PayslipCard';
import { useState, useRef, useCallback } from 'react';

interface PayrollDetailsProps {
  payroll: Payroll;
  onApprove?: () => void;
  onMarkPaid?: () => void;
  onUpdate?: () => void;
  canEdit?: boolean;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PayrollDetails({ 
  payroll, 
  onApprove, 
  onMarkPaid, 
  onUpdate, 
  canEdit = false 
}: PayrollDetailsProps) {
  const { t } = useTranslation();
  const [view, setView] = useState<'breakdown' | 'payslip'>('breakdown');
  const printRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = useCallback(() => {
    const el = printRef.current;
    if (!el) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) return;
    const doc = iframeWindow.document;

    doc.open();
    doc.write('<!doctype html><html><head>');
    // Ensure relative URLs (images, fonts, CSS) resolve correctly
    doc.write(`<base href="${document.baseURI}">`);
    // Copy stylesheets and inline styles so print looks identical
    document.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
      doc.write((node as HTMLElement).outerHTML);
    });
    doc.write('</head><body>');
    doc.write(el.outerHTML);
    doc.write('</body></html>');
    doc.close();

    const triggerPrint = () => {
      iframeWindow.focus();
      iframeWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };

    // document.write sometimes bypasses onload; give styles a moment
    setTimeout(triggerPrint, 100);
  }, []);

  return (
    <div
      ref={printRef}
      className="space-y-6 print:space-y-4 print-scale-90"
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 print:shadow-none print:p-4 print:bg-white print:text-black">
        <div className="flex justify-between items-start mb-4 print:mb-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 print:text-xl">
              {payroll.employee.firstName} {payroll.employee.lastName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm print:text-xs print:text-gray-700">
              {monthNames[payroll.month - 1]} {payroll.year}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[payroll.status]} print:bg-gray-200 print:text-gray-800`}>
            {t(payroll.status)}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 print:gap-3 print:mb-2">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs print:text-gray-700">{t('payroll.department')}</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100 print:text-sm">
              {payroll.employee.department}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs print:text-gray-700">{t('payroll.jobTitle')}</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100 print:text-sm">
              {payroll.employee.jobTitle}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs print:text-gray-700">{t('payroll.email')}</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100 print:text-sm">
              {payroll.employee.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 print:text-xs print:text-gray-700">{t('payroll.payrollId')}</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-xs print:text-[10px] break-all">
              {payroll._id}
            </p>
          </div>
        </div>

  {/* Action Buttons */}
  <div className="flex flex-wrap gap-2 pt-4 border-t dark:border-gray-700 print:hidden">
          <button
            onClick={() => setView('breakdown')}
            className={`px-4 py-2 rounded-lg ${
              view === 'breakdown'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {t('payroll.breakdown')}
          </button>
          <button
            onClick={() => setView('payslip')}
            className={`px-4 py-2 rounded-lg ${
              view === 'payslip'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {t('payroll.payslip')}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 print:hidden"
          >
            {t('payroll.print')}
          </button>
          
          {canEdit && payroll.status === PayrollStatus.DRAFT && onApprove && (
            <button
              onClick={onApprove}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              {t('payroll.approve')}
            </button>
          )}
          
          {canEdit && payroll.status === PayrollStatus.APPROVED && onMarkPaid && (
            <button
              onClick={onMarkPaid}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {t('payroll.markAsPaid')}
            </button>
          )}
          
          {canEdit && (payroll.status === PayrollStatus.DRAFT || payroll.status === PayrollStatus.PENDING) && onUpdate && (
            <button
              onClick={onUpdate}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
            >
              {t('payroll.edit')}
            </button>
          )}
        </div>
      </div>

      {/* View Content */}
      <div className="print:block">
        {view === 'breakdown' ? (
          <SalaryBreakdown payroll={payroll} />
        ) : (
          <PayslipCard payroll={payroll} />
        )}
      </div>

      {/* Approval Info */}
      {payroll.approvedBy && (
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 print:bg-white print:border print:border-gray-300 print:p-3">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-900 dark:text-blue-100 print:text-gray-800 print:text-sm">
              {t('payroll.approvedBy')}: {payroll.approvedBy.firstName} {payroll.approvedBy.lastName}
              {payroll.approvalDate && ` on ${new Date(payroll.approvalDate).toLocaleDateString()}`}
            </span>
          </div>
        </div>
      )}

      {/* Payment Info */}
      {payroll.status === PayrollStatus.PAID && payroll.paymentDate && (
        <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4 print:bg-white print:border print:border-gray-300 print:p-3">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-900 dark:text-green-100 print:text-gray-800 print:text-sm">
              {t('payroll.paid')} on {new Date(payroll.paymentDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 print:bg-white print:border print:border-gray-300 print:p-3">
        <div className="grid grid-cols-2 gap-4 text-sm print:gap-3">
          <div>
            <p className="text-gray-600 dark:text-gray-400 print:text-xs print:text-gray-700">{t('payroll.created')}</p>
            <p className="font-medium text-gray-900 dark:text-gray-100 print:text-sm">
              {new Date(payroll.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400 print:text-xs print:text-gray-700">{t('payroll.lastUpdated')}</p>
            <p className="font-medium text-gray-900 dark:text-gray-100 print:text-sm">
              {new Date(payroll.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

