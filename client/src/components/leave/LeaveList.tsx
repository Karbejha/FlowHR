'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Leave, LeaveStatus, LeaveStatusUpdate } from '@/types/leave';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LeaveList() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchLeaves = useCallback(async () => {
    try {
      setIsLoading(true);
      const endpoint = user?.role === UserRole.EMPLOYEE ? 'my-requests' : 'pending';
      const { data } = await axios.get(`${API_URL}/leave/${endpoint}`);
      setLeaves(data);
    } catch (err) {
      console.error('Error fetching leaves:', err);
      toast.error('Failed to fetch leave requests');
    } finally {
      setIsLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleStatusUpdate = async (leaveId: string, update: LeaveStatusUpdate) => {
    try {
      await axios.post(`${API_URL}/leave/${leaveId}/status`, update);
      toast.success('Leave request updated successfully');
      fetchLeaves();
    } catch (err) {
      console.error('Error updating leave status:', err);
      toast.error('Failed to update leave request');
    }
  };

  const handleCancel = async (leaveId: string) => {
    try {
      await axios.post(`${API_URL}/leave/${leaveId}/cancel`);
      toast.success('Leave request cancelled successfully');
      fetchLeaves();
    } catch (err) {
      console.error('Error cancelling leave:', err);
      toast.error('Failed to cancel leave request');
    }
  };

  const getStatusBadgeColor = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700';
      case LeaveStatus.REJECTED:
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700';
      case LeaveStatus.CANCELLED:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md dark:shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-6">
          {user?.role === UserRole.EMPLOYEE ? 'My Leave Requests' : 'Pending Leave Requests'}
        </h3>
        
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {user?.role !== UserRole.EMPLOYEE && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Employee
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {leaves.map((leave) => (
                <tr key={leave._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                  {user?.role !== UserRole.EMPLOYEE && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {leave.employee.firstName} {leave.employee.lastName}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 capitalize">
                    {leave.leaveType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                      <span>{new Date(leave.startDate).toLocaleDateString()}</span>
                      <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">-</span>
                      <span>{new Date(leave.endDate).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {leave.totalDays}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col sm:flex-row gap-2">
                      {(user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN) && 
                       leave.status === LeaveStatus.PENDING && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(leave._id, { status: LeaveStatus.APPROVED })}
                            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors duration-150 px-2 py-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(leave._id, { status: LeaveStatus.REJECTED })}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-150 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {user?.role === UserRole.EMPLOYEE && 
                       leave.status === LeaveStatus.PENDING && (
                        <button
                          onClick={() => handleCancel(leave._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-150 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td 
                    colSpan={user?.role === UserRole.EMPLOYEE ? 5 : 6} 
                    className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>No leave requests found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}