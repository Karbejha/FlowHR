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
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'half-day':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  const totalColumns = user?.role === UserRole.EMPLOYEE ? 4 : 
    (user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN) ? 6 : 5;

  return (
    <div className="w-full max-w-none">
      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:px-6 sm:py-6">
          <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 mb-6">
            {user?.role === UserRole.EMPLOYEE ? 'My Attendance Records' : 'Team Attendance Records'}
          </h3>
          
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {user?.role !== UserRole.EMPLOYEE && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">
                          Employee
                        </th>
                      )}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[100px]">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[80px]">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[100px]">
                        Total Hours
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[140px]">
                        Clock In/Out Times
                      </th>
                      {(user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN) && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {records.map((record, index) => (
                      <tr 
                        key={record._id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 ${
                          index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-750'
                        }`}
                      >
                        {user?.role !== UserRole.EMPLOYEE && (
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {record.employee.firstName} {record.employee.lastName}
                          </td>
                        )}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-mono">
                          {record.totalHours}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm space-y-1">
                            {record.records.map((timeRecord, index) => (
                              <div key={index} className="text-gray-900 dark:text-gray-100 font-mono text-xs">
                                <span className="text-green-600 dark:text-green-400">
                                  {new Date(timeRecord.clockIn).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                                {timeRecord.clockOut && (
                                  <>
                                    <span className="text-gray-400 dark:text-gray-500 mx-1">→</span>
                                    <span className="text-red-600 dark:text-red-400">
                                      {new Date(timeRecord.clockOut).toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        {(user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN) && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <select
                              aria-label={`Update status for ${record.employee.firstName} ${record.employee.lastName}`}
                              onChange={(e) => handleStatusUpdate(record._id, { status: e.target.value as AttendanceStatus })}
                              className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm transition-colors duration-150"
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
                          colSpan={totalColumns}
                          className="px-4 py-12 text-center"
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                              No attendance records found
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              No records available for the selected period
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}