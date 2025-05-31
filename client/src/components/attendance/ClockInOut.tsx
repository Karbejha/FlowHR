'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Attendance } from '@/types/attendance';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ClockInOut() {
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { token } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);  }, []);

  const fetchTodayAttendance = useCallback(async () => {
    if (!token) {
      toast.error('Authentication required');
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
      toast.error('Failed to fetch attendance');
    }
  }, [token]);

  useEffect(() => {
    fetchTodayAttendance();
  }, [fetchTodayAttendance]);
  const handleClockIn = async () => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }
    
    try {
      setIsLoading(true);
      await axios.post(`${API_URL}/attendance/clock-in`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Clocked in successfully');
      fetchTodayAttendance();
    } catch (err) {
      console.error('Error clocking in:', err);
      toast.error('Failed to clock in');
    } finally {
      setIsLoading(false);
    }
  };
  const handleClockOut = async () => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }
    
    try {
      setIsLoading(true);
      await axios.post(`${API_URL}/attendance/clock-out`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Clocked out successfully');
      fetchTodayAttendance();
    } catch (err) {
      console.error('Error clocking out:', err);
      toast.error('Failed to clock out');
    } finally {
      setIsLoading(false);
    }
  };

  const getLastRecord = () => {
    if (!todayAttendance?.records?.length) return null;
    return todayAttendance.records[todayAttendance.records.length - 1];
  };

  const isCurrentlyWorking = () => {
    const lastRecord = getLastRecord();
    return lastRecord && !lastRecord.clockOut;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Time Clock</h2>
        <p className="text-xl font-mono mt-2">
          {currentTime.toLocaleTimeString()}
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-center">
          {isCurrentlyWorking() ? (
            <button
              onClick={handleClockOut}
              disabled={isLoading}
              className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Clock Out'}
            </button>
          ) : (
            <button
              onClick={handleClockIn}
              disabled={isLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Clock In'}
            </button>
          )}
        </div>

        {todayAttendance && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Today&apos;s Records</h3>
            <div className="border rounded-md divide-y">
              {todayAttendance.records.map((record, index) => (
                <div key={index} className="p-4">
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">Clock In: </span>
                      {new Date(record.clockIn).toLocaleTimeString()}
                    </div>
                    {record.clockOut && (
                      <div>
                        <span className="font-medium">Clock Out: </span>
                        {new Date(record.clockOut).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                  {record.duration && (
                    <div className="mt-1 text-sm text-gray-500">
                      Duration: {Math.round(record.duration / 60 * 100) / 100} hours
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <div>Status: <span className="capitalize">{todayAttendance.status}</span></div>
              <div>Total Hours: {todayAttendance.totalHours}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}