'use client';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import ClockInOut from '@/components/attendance/ClockInOut';
import AttendanceList from '@/components/attendance/AttendanceList';
import AuthGuard from '@/components/auth/AuthGuard';

export default function AttendancePage() {
  const { user } = useAuth();
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl safe-top">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-gray-900 dark:text-gray-100">
            Attendance Management
          </h1>
          
          {user?.role === UserRole.EMPLOYEE ? (
            <div className="space-y-8">
              {/* Clock In/Out Section for Employees */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <ClockInOut />
              </div>
              
              {/* Attendance Records Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    My Attendance Records
                  </h2>
                </div>
                <AttendanceList />
              </div>
            </div>
          ) : (
            /* Full width for Managers/Admins */
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  All Attendance Records
                </h2>
              </div>
              <AttendanceList />
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}