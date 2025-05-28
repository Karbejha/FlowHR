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
        return 'bg-green-100 text-green-800';
      case LeaveStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case LeaveStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          {user?.role === UserRole.EMPLOYEE ? 'My Leave Requests' : 'Pending Leave Requests'}
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {user?.role !== UserRole.EMPLOYEE && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leaves.map((leave) => (
                <tr key={leave._id}>
                  {user?.role !== UserRole.EMPLOYEE && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {leave.employee.firstName} {leave.employee.lastName}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {leave.leaveType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {leave.totalDays}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {(user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN) && 
                     leave.status === LeaveStatus.PENDING && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(leave._id, { status: LeaveStatus.APPROVED })}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(leave._id, { status: LeaveStatus.REJECTED })}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {user?.role === UserRole.EMPLOYEE && 
                     leave.status === LeaveStatus.PENDING && (
                      <button
                        onClick={() => handleCancel(leave._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td 
                    colSpan={user?.role === UserRole.EMPLOYEE ? 5 : 6} 
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No leave requests found
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