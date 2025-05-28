'use client';

import { UserRole } from '@/types/auth';
import AuthGuard from '@/components/auth/AuthGuard';
import EmployeeList from '@/components/employees/EmployeeList';

export default function EmployeesPage() {
  return (
    <AuthGuard allowedRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Employee Management</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <EmployeeList />
        </div>
      </div>
    </AuthGuard>
  );
}
