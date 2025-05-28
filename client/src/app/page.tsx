'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import { UserRole } from '@/types/auth';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoginForm />
      </div>
    );
  }

  const DashboardCard = ({ title, description, href }: { title: string; description: string; href: string }) => (
    <Link href={href}>
      <div className="p-6 bg-white rounded-lg shadow transition-shadow hover:shadow-md cursor-pointer">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-gray-600">{description}</p>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user?.firstName} {user?.lastName} ({user?.role})
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {user?.role === UserRole.ADMIN && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <DashboardCard
              title="Employee Management"
              description="Manage employee records and information"
              href="/employees"
            />
            <DashboardCard
              title="Leave Management"
              description="Handle leave requests and approvals"
              href="/leave"
            />
            <DashboardCard
              title="Attendance Tracking"
              description="Monitor employee attendance and time tracking"
              href="/attendance"
            />
          </div>
        )}

        {user?.role === UserRole.MANAGER && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <DashboardCard
              title="Team Management"
              description="Manage your team members"
              href="/team"
            />
            <DashboardCard
              title="Leave Management"
              description="Review and manage team leave requests"
              href="/leave"
            />
            <DashboardCard
              title="Performance Management"
              description="Track and evaluate team performance"
              href="/performance"
            />
          </div>
        )}

        {user?.role === UserRole.EMPLOYEE && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <DashboardCard
              title="My Profile"
              description="View and update your information"
              href="/profile"
            />
            <DashboardCard
              title="Leave Requests"
              description="Submit and track your leave requests"
              href="/leave"
            />
            <DashboardCard
              title="Attendance"
              description="View and manage your attendance"
              href="/attendance"
            />
          </div>
        )}
      </main>
    </div>
  );
}
