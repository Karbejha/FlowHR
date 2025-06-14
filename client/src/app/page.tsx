'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import LoginForm from '@/components/auth/LoginForm';
import { UserRole } from '@/types/auth';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import BirthdayCard from '@/components/common/BirthdayCard';

export default function Home() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('homepage.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 animate-pulse delay-1000"></div>        </div>
        
        {/* Login form container */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
          <LoginForm />
        </div>
      </div>
    );
  }

  const DashboardCard = ({ 
    title, 
    description, 
    href, 
    icon 
  }: { 
    title: string; 
    description: string; 
    href: string;
    icon: React.ReactNode;
  }) => (
    <Link href={href}>
      <div className="group relative h-48 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-lg 
                      transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl 
                      cursor-pointer border border-gray-200 dark:border-gray-700 
                      hover:border-blue-200 dark:hover:border-blue-700
                      hover:-translate-y-1 hover:scale-[1.02] backdrop-blur-sm
                      flex flex-col justify-between">
        {/* Card gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 
                        dark:from-blue-900/10 dark:to-purple-900/10 rounded-2xl opacity-0 
                        group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 
                            dark:group-hover:bg-blue-800/40 transition-colors duration-300">
              {icon}
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 
                           group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
              {title}
            </h2>
          </div>
          
          <div className="flex-1 flex flex-col justify-between">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm line-clamp-3">
              {description}
            </p>
            
            {/* Arrow indicator */}
            <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 opacity-0 
                            group-hover:opacity-100 transition-all duration-300 transform 
                            translate-x-0 group-hover:translate-x-1">
              <span className="text-sm font-medium mr-1">{t('homepage.explore')}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
  const getRoleCards = () => {
    const adminCards = [
      {
        title: t('homepage.cards.employeeManagement.title'),
        description: t('homepage.cards.employeeManagement.description'),
        href: "/employees",
        icon: <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      },
      {
        title: t('homepage.cards.leaveManagement.title'),
        description: t('homepage.cards.leaveManagement.description'),
        href: "/leave",
        icon: <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      },
      {
        title: t('homepage.cards.attendanceTracking.title'),
        description: t('homepage.cards.attendanceTracking.description'),
        href: "/attendance",
        icon: <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
    ];

    const managerCards = [
      {
        title: t('homepage.cards.teamManagement.title'),
        description: t('homepage.cards.teamManagement.description'),
        href: "/team",
        icon: <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      },
      {
        title: t('homepage.cards.leaveManagementManager.title'),
        description: t('homepage.cards.leaveManagementManager.description'),
        href: "/leave",
        icon: <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      },
      {
        title: t('homepage.cards.performanceManagement.title'),
        description: t('homepage.cards.performanceManagement.description'),
        href: "/performance",
        icon: <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      }
    ];

    const employeeCards = [
      {
        title: t('homepage.cards.myProfileCard.title'),
        description: t('homepage.cards.myProfileCard.description'),
        href: "/profile",
        icon: <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      },
      {
        title: t('homepage.cards.leaveRequests.title'),
        description: t('homepage.cards.leaveRequests.description'),
        href: "/leave",
        icon: <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      },
      {
        title: t('homepage.cards.myAttendance.title'),
        description: t('homepage.cards.myAttendance.description'),
        href: "/attendance",
        icon: <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      }
    ];

    switch (user?.role) {
      case UserRole.ADMIN:
        return adminCards;
      case UserRole.MANAGER:
        return managerCards;
      case UserRole.EMPLOYEE:
        return employeeCards;
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-500">      {/* Header with enhanced styling */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg dark:shadow-2xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40 overflow-visible">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8 overflow-visible">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  {t('homepage.dashboard')}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t('homepage.welcomeBack')}
                </p>
              </div>
            </div>            <div className="flex items-center space-x-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                      {user?.role}
                    </span>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[99999] overflow-hidden">
                    <div className="py-1">                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {t('homepage.myProfile')}
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {t('homepage.settings')}
                      </Link>
                      <hr className="my-1 border-gray-200 dark:border-gray-600" />                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {t('homepage.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              
              <button
                onClick={logout}
                className="group relative px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 
                           rounded-full hover:from-red-600 hover:to-red-700 transition-all duration-200 
                           focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 
                           shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{t('homepage.logout')}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content with enhanced layout */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">        {/* Welcome section */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('homepage.welcomeUser', {
              greeting: new Date().getHours() < 12 
                ? t('homepage.goodMorning') 
                : new Date().getHours() < 18 
                  ? t('homepage.goodAfternoon') 
                  : t('homepage.goodEvening'),
              name: user?.firstName || ''
            })}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('homepage.roleAccessMessage', { role: user?.role?.toLowerCase() || '' })}
          </p>
        </div>        {/* Dashboard cards */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {getRoleCards().map((card, index) => (
            <DashboardCard
              key={index}
              title={card.title}
              description={card.description}
              href={card.href}
              icon={card.icon}
            />
          ))}
          
          {/* Birthday Card */}
          <BirthdayCard className="lg:col-span-3 sm:col-span-2" />
        </div>{/* Quick stats or additional info */}
        <div className="mt-12 p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('homepage.needHelp')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('homepage.helpDescription')}
            </p>
            <div className="flex justify-center space-x-4">
              <button className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200">
                {t('homepage.helpCenter')}
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-200">
                {t('homepage.contactSupport')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}