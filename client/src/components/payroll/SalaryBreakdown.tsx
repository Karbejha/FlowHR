'use client';

import { Payroll } from '@/types/payroll';
import { useTranslation } from '@/contexts/I18nContext';

interface SalaryBreakdownProps {
  payroll: Payroll;
}

export default function SalaryBreakdown({ payroll }: SalaryBreakdownProps) {
  const { t } = useTranslation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
    <div className="space-y-6">
      {/* Basic Salary Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {t('payroll.basicSalary')}
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">{t('payroll.basicSalary')}</span>
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(payroll.basicSalary)}
          </span>
        </div>
      </div>

      {/* Allowances Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {t('payroll.allowances')}
        </h3>
        <div className="space-y-3">
          {payroll.allowances.transportation > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('payroll.transportation')}</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                +{formatCurrency(payroll.allowances.transportation)}
              </span>
            </div>
          )}
          {payroll.allowances.housing > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('payroll.housing')}</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                +{formatCurrency(payroll.allowances.housing)}
              </span>
            </div>
          )}
          {payroll.allowances.food > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('payroll.food')}</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                +{formatCurrency(payroll.allowances.food)}
              </span>
            </div>
          )}
          {payroll.allowances.mobile > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('payroll.mobile')}</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                +{formatCurrency(payroll.allowances.mobile)}
              </span>
            </div>
          )}
          {payroll.allowances.other > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('payroll.other')}</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                +{formatCurrency(payroll.allowances.other)}
              </span>
            </div>
          )}
          <div className="border-t pt-3 flex justify-between font-semibold">
            <span className="text-gray-900 dark:text-gray-100">{t('payroll.totalAllowances')}</span>
            <span className="text-green-600 dark:text-green-400">
              +{formatCurrency(totalAllowances)}
            </span>
          </div>
        </div>
      </div>

      {/* Bonuses & Overtime Section */}
      {(totalBonuses > 0 || payroll.overtimePay > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {t('payroll.bonusesAndOvertime')}
          </h3>
          <div className="space-y-3">
            {payroll.bonuses.performance > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('payroll.performanceBonus')}</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  +{formatCurrency(payroll.bonuses.performance)}
                </span>
              </div>
            )}
            {payroll.bonuses.project > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('payroll.projectBonus')}</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  +{formatCurrency(payroll.bonuses.project)}
                </span>
              </div>
            )}
            {payroll.bonuses.other > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('payroll.otherBonus')}</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  +{formatCurrency(payroll.bonuses.other)}
                </span>
              </div>
            )}
            {payroll.overtimePay > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {t('payroll.overtime')} ({payroll.overtimeHours} {t('payroll.hours')})
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  +{formatCurrency(payroll.overtimePay)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deductions Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {t('payroll.deductions')}
        </h3>
        <div className="space-y-3">
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
          <div className="border-t pt-3 flex justify-between font-semibold">
            <span className="text-gray-900 dark:text-gray-100">{t('payroll.totalDeductions')}</span>
            <span className="text-red-600 dark:text-red-400">
              -{formatCurrency(payroll.totalDeductions)}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-6 shadow-lg">
        <div className="space-y-3">
          <div className="flex justify-between text-lg">
            <span className="text-gray-700 dark:text-gray-200">{t('payroll.grossSalary')}</span>
            <span className="font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(payroll.grossSalary)}
            </span>
          </div>
          <div className="flex justify-between text-lg">
            <span className="text-gray-700 dark:text-gray-200">{t('payroll.totalDeductions')}</span>
            <span className="font-bold text-red-600 dark:text-red-400">
              -{formatCurrency(payroll.totalDeductions)}
            </span>
          </div>
          <div className="border-t-2 border-blue-300 dark:border-blue-600 pt-3 flex justify-between text-2xl">
            <span className="font-bold text-gray-900 dark:text-gray-100">{t('payroll.netSalary')}</span>
            <span className="font-bold text-green-600 dark:text-green-400">
              {formatCurrency(payroll.netSalary)}
            </span>
          </div>
        </div>
      </div>

      {/* Attendance Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {t('payroll.attendanceInfo')}
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {payroll.workingDays}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('payroll.workingDays')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {payroll.attendedDays}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('payroll.attendedDays')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {payroll.absentDays}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('payroll.absentDays')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

