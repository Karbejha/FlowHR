'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { UserRole } from '@/types/auth';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import UserDropdown from './UserDropdown';
import NotificationDropdown from './NotificationDropdown';
import LanguageSwitcher from './LanguageSwitcher';
import { useState } from 'react';
import Logo from './Logo';

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthenticated) return null;

  const isActive = (path: string) => pathname === path;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const NavigationLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      onClick={closeMobileMenu}
      className={`${
        isActive(href)
          ? 'bg-gray-900 dark:bg-gray-800 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-gray-800 dark:bg-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Logo />
            </div>            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {/* Calendar - Available for all users */}
                <Link
                  href="/calendar"
                  className={`${
                    isActive('/calendar')
                      ? 'bg-gray-900 dark:bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
                >
                  {t('navigation.calendar')}
                </Link>

                {user?.role === UserRole.EMPLOYEE && (
                  <>
                    <Link
                      href="/employees"
                      className={`${
                        isActive('/employees')
                          ? 'bg-gray-900 dark:bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
                    >
                      {t('navigation.team')}
                    </Link>
                    <Link
                      href="/leave"
                      className={`${
                        isActive('/leave')
                          ? 'bg-gray-900 dark:bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
                    >
                      {t('navigation.leaveManagement')}
                    </Link>
                    <Link
                      href="/attendance"
                      className={`${
                        isActive('/attendance')
                          ? 'bg-gray-900 dark:bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
                    >
                      {t('navigation.attendance')}
                    </Link>
                    <Link
                      href="/payroll/my-payslips"
                      className={`${
                        pathname.startsWith('/payroll')
                          ? 'bg-gray-900 dark:bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
                    >
                      {t('payroll.myPayslips')}
                    </Link>

                    <Link
                      href="/help-center"
                      className={`${
                        isActive('/help-center')
                          ? 'bg-gray-900 dark:bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200`}
                    >
                      {t('navigation.help')}
                    </Link>
                  </>
                )}
                
                {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && (
                  <>                    <Link
                      href="/employees"
                      className={`${
                        isActive('/employees')
                          ? 'bg-gray-900 dark:bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-bold transition-colors duration-200`}
                    >
                      {t('navigation.employees')}
                    </Link>
                    <Link
                      href="/leave"
                      className={`${
                        isActive('/leave')
                          ? 'bg-gray-900 dark:bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-bold transition-colors duration-200`}
                    >
                      {t('navigation.leaveRequests')}
                    </Link>
                    <Link
                      href="/attendance"
                      className={`${
                        isActive('/attendance')
                          ? 'bg-gray-900 dark:bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-bold transition-colors duration-200`}
                    >
                      {t('navigation.teamAttendance')}
                    </Link>
                    <Link
                      href="/payroll"
                      className={`${
                        pathname.startsWith('/payroll')
                          ? 'bg-gray-900 dark:bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-bold transition-colors duration-200`}
                    >
                      {t('payroll.title')}
                    </Link>
                    {user?.role === UserRole.ADMIN && (
                      <Link
                        href="/reports"
                        className={`${
                          pathname.startsWith('/reports')
                            ? 'bg-gray-900 dark:bg-gray-800 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        } px-3 py-2 rounded-md text-sm font-bold transition-colors duration-200`}
                      >
                        {t('navigation.reports')}
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            <NotificationDropdown />
            <LanguageSwitcher variant="compact" />
            <ThemeToggle />
            <UserDropdown />
          </div>          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <NotificationDropdown />
            <LanguageSwitcher variant="compact" />
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-700 dark:bg-gray-800">
            {/* Calendar - Available for all users */}
            <NavigationLink href="/calendar">{t('navigation.calendar')}</NavigationLink>

            {user?.role === UserRole.EMPLOYEE && (
              <>
                <NavigationLink href="/employees">{t('navigation.team')}</NavigationLink>
                <NavigationLink href="/leave">{t('navigation.leaveManagement')}</NavigationLink>
                <NavigationLink href="/attendance">{t('navigation.attendance')}</NavigationLink>
                <NavigationLink href="/payroll/my-payslips">{t('payroll.myPayslips')}</NavigationLink>
              </>
            )}
            
            {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && (
              <>
                <NavigationLink href="/employees">{t('navigation.employees')}</NavigationLink>
                <NavigationLink href="/leave">{t('navigation.leaveRequests')}</NavigationLink>
                <NavigationLink href="/attendance">{t('navigation.teamAttendance')}</NavigationLink>
                <NavigationLink href="/payroll">{t('payroll.title')}</NavigationLink>
                {user?.role === UserRole.ADMIN && (
                  <NavigationLink href="/reports">{t('navigation.reports')}</NavigationLink>
                )}
              </>
            )}
            
            {/* Mobile User Menu */}
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="px-3">
                <UserDropdown />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
