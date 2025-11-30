'use client';

import { Payroll } from '@/types/payroll';
import { useTranslation } from '@/contexts/I18nContext';

interface PayslipCardProps {
  payroll: Payroll;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PayslipCard({ payroll }: PayslipCardProps) {
  const { t } = useTranslation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const totalAllowances = 
    payroll.allowances.transportation +
    payroll.allowances.housing +
    payroll.allowances.food +
    payroll.allowances.mobile +
    payroll.allowances.other;

  const totalBonuses = 
    payroll.bonuses.performance +
    payroll.bonuses.project +
    payroll.bonuses.other;

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden print:shadow-none">
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-800 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('payroll.payslip').toUpperCase()}</h1>
            <p className="text-blue-100">{monthNames[payroll.month - 1]} {payroll.year}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">{t('payroll.paymentDate')}</p>
            <p className="font-semibold">
              {payroll.paymentDate 
                ? new Date(payroll.paymentDate).toLocaleDateString() 
                : t('payroll.pending')}
            </p>
          </div>
        </div>
      </div>

      {/* Employee Info */}
      <div className="p-6 border-b dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('payroll.employeeName')}</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {payroll.employee.firstName} {payroll.employee.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('payroll.email')}</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {payroll.employee.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('payroll.department')}</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {payroll.employee.department}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('payroll.jobTitle')}</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {payroll.employee.jobTitle}
            </p>
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
          {t('payroll.attendanceSummary')}
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {payroll.workingDays}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t('payroll.workingDays')}</p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {payroll.attendedDays}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t('payroll.attendedDays')}</p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {payroll.absentDays}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{t('payroll.absentDays')}</p>
          </div>
        </div>
      </div>

      {/* Earnings */}
      <div className="p-6 border-b dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('payroll.earnings')}</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('payroll.basicSalary')}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatCurrency(payroll.basicSalary)}
            </span>
          </div>
          {totalAllowances > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('payroll.totalAllowances')}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(totalAllowances)}
              </span>
            </div>
          )}
          {totalBonuses > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('payroll.totalBonuses')}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(totalBonuses)}
              </span>
            </div>
          )}
          {payroll.overtimePay > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t('payroll.overtime')} ({payroll.overtimeHours}h)
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatCurrency(payroll.overtimePay)}
              </span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t dark:border-gray-700 font-semibold">
            <span className="text-gray-900 dark:text-gray-100">{t('payroll.grossSalary')}</span>
            <span className="text-gray-900 dark:text-gray-100">
              {formatCurrency(payroll.grossSalary)}
            </span>
          </div>
        </div>
      </div>

      {/* Deductions */}
      <div className="p-6 border-b dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('payroll.deductions')}</h3>
        <div className="space-y-2">
          {payroll.deductions.tax > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('payroll.tax')}</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                -{formatCurrency(payroll.deductions.tax)}
              </span>
            </div>
          )}
          {payroll.deductions.socialInsurance > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('payroll.socialInsurance')}</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                -{formatCurrency(payroll.deductions.socialInsurance)}
              </span>
            </div>
          )}
          {payroll.deductions.healthInsurance > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('payroll.healthInsurance')}</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                -{formatCurrency(payroll.deductions.healthInsurance)}
              </span>
            </div>
          )}
          {payroll.deductions.unpaidLeave > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('payroll.unpaidLeave')}</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                -{formatCurrency(payroll.deductions.unpaidLeave)}
              </span>
            </div>
          )}
          {payroll.lateDeductions > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('payroll.lateDeductions')}</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                -{formatCurrency(payroll.lateDeductions)}
              </span>
            </div>
          )}
          {payroll.deductions.other > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('payroll.otherDeductions')}</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                -{formatCurrency(payroll.deductions.other)}
              </span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t dark:border-gray-700 font-semibold">
            <span className="text-gray-900 dark:text-gray-100">{t('payroll.totalDeductions')}</span>
            <span className="text-red-600 dark:text-red-400">
              -{formatCurrency(payroll.totalDeductions)}
            </span>
          </div>
        </div>
      </div>

      {/* Net Salary */}
      <div className="p-6 bg-green-50 dark:bg-green-900">
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('payroll.netSalary')}
          </span>
          <span className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(payroll.netSalary)}
          </span>
        </div>
      </div>

      {/* Notes */}
      {payroll.notes && (
        <div className="p-6 bg-gray-50 dark:bg-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('payroll.notes')}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{payroll.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
        <p>{t('payroll.payslipGenerated')}: {new Date(payroll.createdAt).toLocaleDateString()}</p>
        {payroll.approvedBy && (
          <p className="mt-1">
            {t('payroll.approvedBy')}: {payroll.approvedBy.firstName} {payroll.approvedBy.lastName}
          </p>
        )}
      </div>
    </div>
  );
}

