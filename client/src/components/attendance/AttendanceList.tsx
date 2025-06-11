'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Attendance, AttendanceStatusUpdate } from '@/types/attendance';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
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
  const { t } = useTranslation();
  const [records, setRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token } = useAuth();
  const fetchAttendanceRecords = useCallback(async () => {    if (!token) {
      toast.error(t('messages.authenticationRequired'));
      return;
    }
    
    try {
      setIsLoading(true);
      const endpoint = user?.role === UserRole.EMPLOYEE ? 'my-records' : 'team';
      const { data } = await axios.get(`${API_URL}/attendance/${endpoint}`, {
        params: { startDate, endDate },
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(data);    } catch {
      toast.error(t('messages.failedToFetchAttendance'));
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, user?.role, token, t]);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [fetchAttendanceRecords]);
  const handleStatusUpdate = async (attendanceId: string, update: AttendanceStatusUpdate) => {    if (!token) {
      toast.error(t('messages.authenticationRequired'));
      return;
    }
    
    try {
      await axios.patch(`${API_URL}/attendance/${attendanceId}`, update, {
        headers: { Authorization: `Bearer ${token}` }
      });      toast.success(t('messages.attendanceStatusUpdated'));
      fetchAttendanceRecords();    } catch {
      toast.error(t('messages.failedToUpdateAttendanceStatus'));
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
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  const totalColumns = user?.role === UserRole.EMPLOYEE ? 4 : 
    (user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN) ? 6 : 5;

  return (
    <div className="w-full max-w-none">
      <div className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-4 py-5 sm:px-6 sm:py-6">          <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 mb-6">
            {user?.role === UserRole.EMPLOYEE ? t('attendance.myAttendanceRecords') : t('attendance.teamAttendanceRecords')}
          </h3>
          
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>{user?.role !== UserRole.EMPLOYEE && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">
                          {t('attendance.employee')}
                        </th>
                      )}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[100px]">
                        {t('attendance.date')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[80px]">
                        {t('attendance.status')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[100px]">
                        {t('attendance.totalHours')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[140px]">
                        {t('attendance.clockInOutTimes')}
                      </th>
                      {(user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN) && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-[120px]">
                          {t('common.actions')}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {records.map((record) => (
                      <tr key={record._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 bg-white dark:bg-gray-800">
                        {user?.role !== UserRole.EMPLOYEE && (
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                            {record.employee.firstName} {record.employee.lastName}
                          </td>
                        )}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(record.status)}`}>
                            {t(`attendance.${record.status}`)}
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
                        </td>                        {(user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN) && (
                          <td className="px-4 py-4 whitespace-nowrap">                            <select
                              aria-label={t('attendance.updateStatusFor', { name: `${record.employee.firstName} ${record.employee.lastName}` })}
                              onChange={(e) => handleStatusUpdate(record._id, { status: e.target.value as AttendanceStatus })}
                              className="block w-full rounded-lg border-2 border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm hover:border-gray-400 dark:hover:border-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:outline-none sm:text-sm transition-all duration-200 ease-in-out cursor-pointer"
                              value={record.status}
                            >
                              <option value="present" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">{t('attendance.present')}</option>
                              <option value="absent" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">{t('attendance.absent')}</option>
                              <option value="late" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">{t('attendance.late')}</option>
                              <option value="half-day" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">{t('attendance.halfDay')}</option>
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
                            </div>                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                              {t('attendance.noAttendanceRecords')}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {t('attendance.noRecordsAvailable')}
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