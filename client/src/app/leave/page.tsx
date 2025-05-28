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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Leave Management</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Leave Requests</h2>
                {user?.role === UserRole.EMPLOYEE && (
                  <button
                    onClick={() => setShowRequestForm(!showRequestForm)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    {showRequestForm ? 'Cancel' : 'New Request'}
                  </button>
                )}
              </div>

              {showRequestForm && (
                <div className="mb-6">
                  <LeaveRequestForm
                    onSubmitSuccess={() => setShowRequestForm(false)}
                  />
                </div>
              )}

              <LeaveList />
            </div>
          </div>

          {user?.role === UserRole.EMPLOYEE && (
            <div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Leave Balance</h2>
                <LeaveBalance />
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}