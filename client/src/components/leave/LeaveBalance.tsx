'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface LeaveBalanceData {
  annual: number;
  sick: number;
  casual: number;
}

export default function LeaveBalance() {
  const [balance, setBalance] = useState<LeaveBalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaveBalance();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/leave/balance`);
      setBalance(data);
    } catch (err) {
      console.error('Error fetching leave balance:', err);
      toast.error('Failed to fetch leave balance');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading balance...</div>;
  }

  if (!balance) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Available Leave Balance</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-sm text-gray-500">Annual Leave</div>
          <div className="text-2xl font-semibold text-green-600">{balance.annual}</div>
          <div className="text-xs text-gray-500">days</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-500">Sick Leave</div>
          <div className="text-2xl font-semibold text-blue-600">{balance.sick}</div>
          <div className="text-xs text-gray-500">days</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-sm text-gray-500">Casual Leave</div>
          <div className="text-2xl font-semibold text-purple-600">{balance.casual}</div>
          <div className="text-xs text-gray-500">days</div>
        </div>
      </div>
    </div>
  );
}