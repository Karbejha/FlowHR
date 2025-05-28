'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import UserDropdown from './UserDropdown';

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();

  if (!isAuthenticated) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gray-800 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white text-lg font-bold">HR System</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {user?.role === UserRole.EMPLOYEE && (
                  <>
                    <Link
                      href="/leave"
                      className={`${
                        isActive('/leave')
                          ? 'bg-gray-900 dark:bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-medium`}
                    >
                      Leave Management
                    </Link>
                    <Link
                      href="/attendance"
                      className={`${
                        isActive('/attendance')
                          ? 'bg-gray-900 dark:bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-medium`}
                    >
                      Attendance
                    </Link>
                  </>
                )}
                
                {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && (
                  <>
                    <Link
                      href="/employees"
                      className={`${
                        isActive('/employees')
                          ? 'bg-gray-900 dark:bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-medium`}
                    >
                      Employees
                    </Link>
                    <Link
                      href="/leave"
                      className={`${
                        isActive('/leave')
                          ? 'bg-gray-900 dark:bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-medium`}
                    >
                      Leave Requests
                    </Link>
                    <Link
                      href="/attendance"
                      className={`${
                        isActive('/attendance')
                          ? 'bg-gray-900 dark:bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      } px-3 py-2 rounded-md text-sm font-medium`}
                    >
                      Team Attendance
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <UserDropdown />
          </div>
        </div>
      </div>
    </nav>
  );
}
