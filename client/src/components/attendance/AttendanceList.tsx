'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Attendance, AttendanceStatusUpdate } from '@/types/attendance';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AttendanceListProps {
  startDate?: string;
  endDate?: string;
}

type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day';

export default function AttendanceList({ 
  startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
}: AttendanceListProps) {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchAttendanceRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const endpoint = user?.role === UserRole.EMPLOYEE ? 'my-records' : 'team';
      const { data } = await axios.get(`${API_URL}/attendance/${endpoint}`, {
        params: { startDate, endDate }
      });
      setRecords(data);
    } catch (err) {
      console.error('Error fetching attendance records:', err);
      toast.error('Failed to fetch attendance records');
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, user?.role]);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [fetchAttendanceRecords]);

  const handleStatusUpdate = async (attendanceId: string, update: AttendanceStatusUpdate) => {
    try {
      await axios.patch(`${API_URL}/attendance/${attendanceId}`, update);
      toast.success('Attendance status updated successfully');
      fetchAttendanceRecords();
    } catch (err) {
      console.error('Error updating attendance status:', err);
      toast.error('Failed to update attendance status');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'half-day':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          {user?.role === UserRole.EMPLOYEE ? 'My Attendance Records' : 'Team Attendance Records'}
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
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clock In/Out Times
                </th>
                {(user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN) && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record._id}>
                  {user?.role !== UserRole.EMPLOYEE && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.employee.firstName} {record.employee.lastName}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.totalHours}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {record.records.map((timeRecord, index) => (
                        <div key={index} className="mb-1">
                          {new Date(timeRecord.clockIn).toLocaleTimeString()}
                          {timeRecord.clockOut && (
                            <> - {new Date(timeRecord.clockOut).toLocaleTimeString()}</>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  {(user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN) && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        aria-label={`Update status for ${record.employee.firstName} ${record.employee.lastName}`}
                        onChange={(e) => handleStatusUpdate(record._id, { status: e.target.value as AttendanceStatus })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={record.status}
                      >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="half-day">Half Day</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td 
                    colSpan={user?.role === UserRole.EMPLOYEE ? 4 : 5}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No attendance records found for the selected period
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