'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios, { AxiosError } from 'axios';
import { User, UserRole } from '@/types/auth';
import toast from 'react-hot-toast';
import AddUserForm from './AddUserForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EmployeeList() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get<User[]>(`${API_URL}/users/employees`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEmployees(data);
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;

      toast.error(err.response?.data?.error || 'Error fetching employees');
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmployeeStatus = async (employeeId: string, isActive: boolean) => {
    try {
      await axios.patch(
        `${API_URL}/users/${employeeId}/status`,
        { isActive },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      toast.success('Employee status updated successfully');
      fetchEmployees();
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;

      toast.error(err.response?.data?.error || 'Error updating employee status');
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && !showAddForm && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md"
          >
            Add New Employee
          </button>
        </div>
      )}

      {showAddForm && (
        <AddUserForm
          onSuccess={() => {
            setShowAddForm(false);
            fetchEmployees();
            toast.success('User created successfully');
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              {user?.role === UserRole.ADMIN && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {employees.map((employee) => (
              <tr key={employee._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                  {employee.firstName} {employee.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{employee.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{employee.department}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${employee.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      employee.role === UserRole.MANAGER ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                    {employee.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${employee.isActive ? 
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                {user?.role === UserRole.ADMIN && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => updateEmployeeStatus(employee._id, !employee.isActive)}
                      className={`px-3 py-1 rounded-md text-white ${
                        employee.isActive ? 
                        'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600' : 
                        'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600'
                      }`}
                    >
                      {employee.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
