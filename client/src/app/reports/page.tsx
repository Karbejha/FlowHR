'use client';

import { useTranslation } from '@/contexts/I18nContext';
import AuthGuard from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/auth';
import Link from 'next/link';

export default function ReportsPage() {
  const { t } = useTranslation();

  const reportCards = [
    {
      title: t('reports.demographicsTitle'),
      description: t('reports.demographicsDescription'),
      href: '/reports/demographics',
      icon: 'users',
      color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
    },
    {
      title: t('reports.timeAttendanceTitle'),
      description: t('reports.timeAttendanceDescription'),
      href: '/reports/attendance',
      icon: 'clock',
      color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
    },
    {
      title: t('reports.leaveUsageTitle'),
      description: t('reports.leaveUsageDescription'),
      href: '/reports/leave-usage',
      icon: 'calendar',
      color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300'
    },
    {
      title: t('reports.resourceAllocationTitle'),
      description: t('reports.resourceAllocationDescription'),
      href: '/reports/resource-allocation',
      icon: 'chart-pie',
      color: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300'
    },
    {
      title: t('reports.payrollReportTitle'),
      description: t('reports.payrollReportDescription'),
      href: '/reports/payroll',
      icon: 'currency',
      color: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300'
    },
    {
      title: t('reports.financialComprehensiveTitle'),
      description: t('reports.financialComprehensiveDescription'),
      href: '/reports/financial-comprehensive',
      icon: 'chart-bar',
      color: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'
    },
    {
      title: t('reports.taxDeductionsTitle'),
      description: t('reports.taxDeductionsDescription'),
      href: '/reports/tax-deductions',
      icon: 'document',
      color: 'bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300'
    },
    {
      title: t('reports.expenseComparisonTitle'),
      description: t('reports.expenseComparisonDescription'),
      href: '/reports/expense-comparison',
      icon: 'trending',
      color: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300'
    }
  ];

  return (
    <AuthGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('reports.reportsTitle')}</h1>
          <Link href="/reports/schedule">
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{t('reports.scheduleReport')}</span>
            </button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportCards.map((card, index) => (
            <Link href={card.href} key={index}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 p-6 h-full flex flex-col">                <div className={`${card.color} rounded-lg p-3 inline-flex items-center mb-4`}>
                  <div className="mr-3">
                    {card.icon === 'users' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                    {card.icon === 'clock' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {card.icon === 'calendar' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    {card.icon === 'chart-pie' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      </svg>
                    )}
                    {card.icon === 'currency' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {card.icon === 'chart-bar' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    )}
                    {card.icon === 'document' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                    {card.icon === 'trending' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    )}
                  </div>
                  <h2 className="text-xl font-bold px-2">{card.title}</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 flex-grow mb-4">{card.description}</p>
                <div className="mt-4 text-blue-600 dark:text-blue-400 flex items-center">
                  <span>{t('reports.viewReport')}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
