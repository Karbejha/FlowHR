'use client';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import LeaveRequestForm from '@/components/leave/LeaveRequestForm';
import LeaveList from '@/components/leave/LeaveList';
import LeaveBalance from '@/components/leave/LeaveBalance';
import AuthGuard from '@/components/auth/AuthGuard';
import { useState } from 'react';

export default function LeavePage() {
  const { user } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
            Leave Management
          </h1>
          
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
            {/* Main Leave Requests Section */}
            <div className={`${user?.role === UserRole.EMPLOYEE ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-all duration-200 h-fit">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Leave Requests
                  </h2>
                  {user?.role === UserRole.EMPLOYEE && (
                    <button
                      onClick={() => setShowRequestForm(!showRequestForm)}
                      className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-medium text-sm whitespace-nowrap"
                    >
                      {showRequestForm ? 'Cancel' : 'New Request'}
                    </button>
                  )}
                </div>
                
                {showRequestForm && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <LeaveRequestForm
                      onSubmitSuccess={() => setShowRequestForm(false)}
                    />
                  </div>
                )}
                
                <div className="overflow-hidden">
                  <LeaveList />
                </div>
              </div>
            </div>

            {/* Leave Balance Sidebar - Only for Employees */}
            {user?.role === UserRole.EMPLOYEE && (
              <div className="xl:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-all duration-200 sticky top-4">
                  <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
                    Leave Balance
                  </h2>
                  <LeaveBalance />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}