'use client';

import { Payroll, PayrollStatus } from '@/types/payroll';
import Link from 'next/link';
import { useTranslation } from '@/contexts/I18nContext';

interface PayrollListProps {
  payrolls: Payroll[];
  onDelete?: (id: string) => void;
  onApprove?: (id: string) => void;
  showActions?: boolean;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
};

const getMonthName = (monthIndex: number, t: (key: string) => string) => {
  const months = [
    'payroll.january', 'payroll.february', 'payroll.march', 'payroll.april',
    'payroll.may', 'payroll.june', 'payroll.july', 'payroll.august',
    'payroll.september', 'payroll.october', 'payroll.november', 'payroll.december'
  ];
  return t(months[monthIndex - 1]);
};

export default function PayrollList({ payrolls, onDelete, onApprove, showActions = true }: PayrollListProps) {
  const { t } = useTranslation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('payroll.employee')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('payroll.period')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('payroll.grossSalary')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('payroll.deductions')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('payroll.netSalary')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              {t('payroll.status')}
            </th>
            {showActions && (
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('payroll.actions')}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {payrolls.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 7 : 6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                {t('payroll.noPayrollsFound')}
              </td>
            </tr>
          ) : (
            payrolls.map((payroll) => (
              <tr key={payroll._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {payroll.employee.firstName} {payroll.employee.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {payroll.employee.department}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {getMonthName(payroll.month, t)} {payroll.year}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(payroll.grossSalary)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-red-600 dark:text-red-400">
                    -{formatCurrency(payroll.totalDeductions)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(payroll.netSalary)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[payroll.status]}`}>
                    {t(`payroll.${payroll.status}`)}
                  </span>
                </td>
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/payroll/${payroll._id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {t('payroll.view')}
                      </Link>
                      {payroll.status === PayrollStatus.DRAFT && onApprove && (
                        <button
                          onClick={() => onApprove(payroll._id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          {t('payroll.approve')}
                        </button>
                      )}
                      {payroll.status === PayrollStatus.DRAFT && onDelete && (
                        <button
                          onClick={() => onDelete(payroll._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          {t('payroll.delete')}
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

