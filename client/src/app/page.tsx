'use client';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { UserRole } from '@/types/auth';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        </div>
        
        {/* Theme toggle for login page */}
        <div className="absolute top-6 right-6 z-10">
          <div className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <ThemeToggle />
          </div>
        </div>
        
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
              <span className="text-sm font-medium mr-1">Explore</span>
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
        title: "Employee Management",
        description: "Manage employee records, profiles, and organizational structure with comprehensive tools for HR operations.",
        href: "/employees",
        icon: <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      },
      {
        title: "Leave Management",
        description: "Handle leave requests, approvals, and maintain comprehensive leave policies for all employees.",
        href: "/leave",
        icon: <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      },
      {
        title: "Attendance Tracking",
        description: "Monitor employee attendance, time tracking, and generate detailed reports for workforce management.",
        href: "/attendance",
        icon: <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
    ];

    const managerCards = [
      {
        title: "Team Management",
        description: "Manage your team members, assignments, and foster collaboration.",
        href: "/team",
        icon: <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      },
      {
        title: "Leave Management",
        description: "Review and manage team leave requests with streamlined approval workflows.",
        href: "/leave",
        icon: <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      },
      {
        title: "Performance Management",
        description: "Track and evaluate team performance with comprehensive analytics.",
        href: "/performance",
        icon: <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      }
    ];

    const employeeCards = [
      {
        title: "My Profile",
        description: "View and update your personal information and preferences.",
        href: "/profile",
        icon: <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      },
      {
        title: "Leave Requests",
        description: "Submit and track your leave requests with real-time status updates.",
        href: "/leave",
        icon: <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      },
      {
        title: "My Attendance",
        description: "View and manage your attendance records and time tracking.",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-500">
      {/* Header with enhanced styling */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg dark:shadow-2xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Welcome back, let&lsquo;s get things done
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                    {user?.role}
                  </span>
                </div>
              </div>
              
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                <ThemeToggle />
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
                  <span>Logout</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content with enhanced layout */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Welcome section */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.firstName}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Here&lsquo;s what you can do today with your {user?.role.toLowerCase()} access
          </p>
        </div>

        {/* Dashboard cards */}
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
        </div>

        {/* Quick stats or additional info */}
        <div className="mt-12 p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Need Help?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Check out our help center or contact support for assistance.
            </p>
            <div className="flex justify-center space-x-4">
              <button className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200">
                Help Center
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-200">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}