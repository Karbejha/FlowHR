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
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">
            Attendance Management
          </h1>
          
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
            {/* Main Attendance Records Section */}
            <div className={`${user?.role === UserRole.EMPLOYEE ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-all duration-200 h-fit">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Attendance Records
                  </h2>
                </div>
                
                <div className="overflow-hidden">
                  <AttendanceList />
                </div>
              </div>
            </div>
            
            {/* Clock In/Out Sidebar - Only for Employees */}
            {user?.role === UserRole.EMPLOYEE && (
              <div className="xl:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-all duration-200 sticky top-4">
                  <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
                    Clock In/Out
                  </h2>
                  <ClockInOut />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}