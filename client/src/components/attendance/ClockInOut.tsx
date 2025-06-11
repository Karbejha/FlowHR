'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Attendance } from '@/types/attendance';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import toast from 'react-hot-toast';
import { 
  ClockIcon, 
  PlayIcon, 
  StopIcon, 
  ChartBarIcon,
  CalendarDaysIcon,
  ClockIcon as ClockSolidIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  lateDays: number;
  workingHours: number;
  avgHoursPerDay: number;
}

export default function ClockInOut() {
  const { t } = useTranslation();
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workTimer, setWorkTimer] = useState<string>('00:00:00');
  const { token } = useAuth();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getLastRecord = useCallback(() => {
    if (!todayAttendance?.records?.length) return null;
    return todayAttendance.records[todayAttendance.records.length - 1];
  }, [todayAttendance]);

  const isCurrentlyWorking = useCallback(() => {
    const lastRecord = getLastRecord();
    return lastRecord && !lastRecord.clockOut;
  }, [getLastRecord]);

  // Update work timer when clocked in
  useEffect(() => {
    let workingTimer: NodeJS.Timeout;
    
    if (isCurrentlyWorking() && todayAttendance) {
      const lastRecord = getLastRecord();
      if (lastRecord?.clockIn) {
        workingTimer = setInterval(() => {
          const clockInTime = new Date(lastRecord.clockIn);
          const now = new Date();
          const diff = now.getTime() - clockInTime.getTime();
          
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          setWorkTimer(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);
      }
    } else {
      setWorkTimer('00:00:00');
    }

    return () => {
      if (workingTimer) {
        clearInterval(workingTimer);
      }
    };
  }, [todayAttendance, isCurrentlyWorking, getLastRecord]);
  const fetchTodayAttendance = useCallback(async () => {
    if (!token) {
      toast.error(t('messages.authenticationRequired'));
      return;
    }
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await axios.get(`${API_URL}/attendance/my-records`, {
        params: {
          startDate: today,
          endDate: today
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodayAttendance(data[0] || null);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      toast.error(t('messages.failedToFetchAttendance'));
    } finally {
      setIsRefreshing(false);
    }
  }, [token, t]);
  const fetchAttendanceStats = useCallback(async () => {
    if (!token) return;
    
    try {
      // Get last 30 days of attendance data for stats
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      
      const { data } = await axios.get(`${API_URL}/attendance/my-records`, {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Calculate stats
      const totalDays = data.length;
      const presentDays = data.filter((att: Attendance) => att.status === 'present').length;
      const lateDays = data.filter((att: Attendance) => att.status === 'late').length;
      const totalHours = data.reduce((sum: number, att: Attendance) => sum + (att.totalHours || 0), 0);
      
      setAttendanceStats({
        totalDays,
        presentDays,
        lateDays,
        workingHours: totalHours,
        avgHoursPerDay: totalDays > 0 ? totalHours / totalDays : 0
      });
    } catch (err) {
      console.error('Error fetching attendance stats:', err);
    }
  }, [token]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchTodayAttendance(), fetchAttendanceStats()]);
  };

  useEffect(() => {
    fetchTodayAttendance();
    fetchAttendanceStats();
  }, [fetchTodayAttendance, fetchAttendanceStats]);
  const handleClockIn = async () => {
    if (!token) {
      toast.error(t('messages.authenticationRequired'));
      return;
    }
    
    try {
      setIsLoading(true);
      await axios.post(`${API_URL}/attendance/clock-in`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('messages.clockedInSuccessfully'));
      await Promise.all([fetchTodayAttendance(), fetchAttendanceStats()]);
    } catch (err) {
      console.error('Error clocking in:', err);
      toast.error(t('messages.failedToClockIn'));
    } finally {
      setIsLoading(false);
    }
  };
  const handleClockOut = async () => {
    if (!token) {
      toast.error(t('messages.authenticationRequired'));
      return;
    }
    
    try {
      setIsLoading(true);
      await axios.post(`${API_URL}/attendance/clock-out`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('messages.clockedOutSuccessfully'));
      await Promise.all([fetchTodayAttendance(), fetchAttendanceStats()]);
    } catch (err) {
      console.error('Error clocking out:', err);
      toast.error(t('messages.failedToClockOut'));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'late':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <UserIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      case 'late':
        return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex justify-between items-center">        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('attendance.attendanceTracker')}
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-colors duration-200"
        >
          <ArrowPathIcon className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? t('common.refreshing') : t('common.refresh')}
        </button>
      </div>

      {/* Current Time & Clock In/Out Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30 rounded-xl p-8 border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 dark:bg-blue-500 rounded-full shadow-lg">
              <ClockSolidIcon className="w-8 h-8 text-white" />
            </div>
          </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('attendance.currentTime')}
          </h3>
          <p className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 mb-6">
            {currentTime.toLocaleTimeString()}
          </p>
          
          {isCurrentlyWorking() && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('attendance.workingTime')}</p>
              <p className="text-2xl font-mono font-bold text-green-600 dark:text-green-400">
                {workTimer}
              </p>
            </div>
          )}

          <div className="flex justify-center">
            {isCurrentlyWorking() ? (              <button
                onClick={handleClockOut}
                disabled={isLoading}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <StopIcon className="w-5 h-5 mr-2" />
                {isLoading ? t('attendance.clockingOut') : t('attendance.clockOut')}
              </button>
            ) : (
              <button
                onClick={handleClockIn}
                disabled={isLoading}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                {isLoading ? t('attendance.clockingIn') : t('attendance.clockIn')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Attendance Statistics */}
      {attendanceStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/30 rounded-xl p-6 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">{t('attendance.presentDays')}</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {attendanceStats.presentDays}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {t('attendance.ofDays', { total: attendanceStats.totalDays })}
                </p>
              </div>
              <div className="p-3 bg-green-600 dark:bg-green-500 rounded-full">
                <CheckCircleIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/30 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{t('attendance.lateDays')}</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {attendanceStats.lateDays}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  {t('attendance.thisMonth')}
                </p>
              </div>
              <div className="p-3 bg-yellow-600 dark:bg-yellow-500 rounded-full">
                <ExclamationTriangleIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('attendance.totalHours')}</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {attendanceStats.workingHours.toFixed(1)}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {t('attendance.thisMonth')}
                </p>
              </div>
              <div className="p-3 bg-blue-600 dark:bg-blue-500 rounded-full">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/30 rounded-xl p-6 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">{t('attendance.avgHoursPerDay')}</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {attendanceStats.avgHoursPerDay.toFixed(1)}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  {t('attendance.perWorkingDay')}
                </p>
              </div>
              <div className="p-3 bg-purple-600 dark:bg-purple-500 rounded-full">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Records */}
      {todayAttendance && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <CalendarDaysIcon className="w-5 h-5 mr-2" />
                {t('attendance.todaysRecords')}
              </h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(todayAttendance.status)}`}>
                {getStatusIcon(todayAttendance.status)}
                <span className="ml-2 capitalize">{t(`attendance.${todayAttendance.status}`)}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {todayAttendance.records.map((record, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">                    <div className="flex items-center">
                      <PlayIcon className="w-4 h-4 text-green-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{t('attendance.clockIn')}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(record.clockIn).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    {record.clockOut ? (
                      <div className="flex items-center">
                        <StopIcon className="w-4 h-4 text-red-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{t('attendance.clockOut')}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(record.clockOut).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
                        <div>
                          <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{t('common.active')}</p>
                          <p className="text-sm text-yellow-600 dark:text-yellow-400">{t('common.currentlyWorking')}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 text-blue-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{t('leave.duration')}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {record.duration ? `${(record.duration / 60).toFixed(2)} ${t('common.hours')}` : t('common.inProgress')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {t('attendance.totalHoursToday')}:
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {todayAttendance.totalHours ? `${todayAttendance.totalHours.toFixed(2)} ${t('common.hours')}` : `0 ${t('common.hours')}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}