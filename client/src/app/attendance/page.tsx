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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Attendance Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Attendance Records</h2>
              </div>
              
              <AttendanceList />
            </div>
          </div>
          
          {user?.role === UserRole.EMPLOYEE && (
            <div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Clock In/Out</h2>
                <ClockInOut />
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}