'use client';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Leave, LeaveStatus, LeaveType, LeaveFilters } from '@/types/leave';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { UserRole, User } from '@/types/auth';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type FilterType = 'all' | 'pending' | 'older';

// Loading spinner component
const LoadingSpinner = ({ size = 'sm' }: { size?: 'sm' | 'md' }) => {
  const sizeClasses = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';
  return (
    <svg 
      className={`animate-spin ${sizeClasses} text-current`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      ></circle>
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

export default function LeaveList() {
  const { t } = useTranslation();  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<Leave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingLeaveIds, setLoadingLeaveIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<LeaveFilters>({
    employee: '',
    leaveType: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  const { user, token } = useAuth();

  // Update default filter when user changes
  useEffect(() => {
    if (user) {
      const defaultFilter = user.role === UserRole.EMPLOYEE ? 'all' : 'pending';
      setActiveFilter(defaultFilter);
    }
  }, [user]);
  
  // Fetch employees for filter dropdown (only for managers/admins)
  const fetchEmployees = useCallback(async () => {
    if (!token || user?.role === UserRole.EMPLOYEE) return;
    
    try {
      const { data } = await axios.get(`${API_URL}/users/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]); // Ensure employees is always an array
    }
  }, [token, user?.role]);

  useEffect(() => {
    if (user?.role !== UserRole.EMPLOYEE) {
      fetchEmployees();
    }
  }, [fetchEmployees, user?.role]);
  const fetchLeaves = useCallback(async () => {
    if (!token) {
      toast.error(t('messages.authenticationRequired'));
      return;
    }
    
    try {
      setIsLoading(true);
      let endpoint = '';
      
      if (user?.role === UserRole.EMPLOYEE) {
        // Employees always see their own requests
        endpoint = 'my-requests';
      } else {
        // Managers/Admins see all their accessible requests, filtering happens client-side
        endpoint = 'all';
      }
      
      const { data } = await axios.get(`${API_URL}/leave/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaves(data);
    } catch (err) {
      console.error('Error fetching leaves:', err);
      toast.error(t('messages.failedToFetchLeaveRequests'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.role, token, t]);

  // Filter leaves based on active filter and advanced filters
  const filterLeaves = useCallback((leavesToFilter: Leave[]) => {
    let filtered = leavesToFilter;

    // Apply status-based filter (All/Pending/Older)
    switch (activeFilter) {
      case 'pending':
        filtered = filtered.filter(leave => leave.status === LeaveStatus.PENDING);
        break;
      case 'older':
        filtered = filtered.filter(leave => 
          leave.status === LeaveStatus.APPROVED || 
          leave.status === LeaveStatus.REJECTED || 
          leave.status === LeaveStatus.CANCELLED
        );
        break;
      case 'all':
      default:
        // Show all leaves
        break;
    }

    // Apply advanced filters
    if (advancedFilters.employee) {
      filtered = filtered.filter(leave => leave.employee._id === advancedFilters.employee);
    }
    if (advancedFilters.leaveType) {
      filtered = filtered.filter(leave => leave.leaveType === advancedFilters.leaveType);
    }
    if (advancedFilters.status) {
      filtered = filtered.filter(leave => leave.status === advancedFilters.status);
    }
    if (advancedFilters.startDate) {
      filtered = filtered.filter(leave => 
        new Date(leave.startDate) >= new Date(advancedFilters.startDate)
      );
    }
    if (advancedFilters.endDate) {
      filtered = filtered.filter(leave => 
        new Date(leave.endDate) <= new Date(advancedFilters.endDate)
      );
    }

    return filtered;
  }, [activeFilter, advancedFilters]);

  // Get counts for each filter type
  const getCounts = useCallback(() => {
    return {
      all: leaves.length,
      pending: leaves.filter(leave => leave.status === LeaveStatus.PENDING).length,
      older: leaves.filter(leave => 
        leave.status === LeaveStatus.APPROVED || 
        leave.status === LeaveStatus.REJECTED || 
        leave.status === LeaveStatus.CANCELLED
      ).length
    };
  }, [leaves]);

  useEffect(() => {
    const filtered = filterLeaves(leaves);
    setFilteredLeaves(filtered);
  }, [leaves, filterLeaves]);

  // Handle advanced filter changes
  const handleAdvancedFilterChange = useCallback((filterKey: keyof LeaveFilters, value: string) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  }, []);

  // Clear all advanced filters
  const clearAdvancedFilters = useCallback(() => {
    setAdvancedFilters({
      employee: '',
      leaveType: '',
      status: '',
      startDate: '',
      endDate: ''
    });
  }, []);

  // Check if any advanced filters are active
  const hasAdvancedFilters = useCallback(() => {
    return Object.values(advancedFilters).some(value => value !== '');
  }, [advancedFilters]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);  const handleStatusUpdate = async (leaveId: string, update: { status: string; approvalNotes?: string }) => {
    if (!token) {
      toast.error(t('messages.authenticationRequired'));
      return;
    }
    
    if (!API_URL) {
      console.error('API_URL is not defined');
      toast.error('Configuration error');
      return;
    }
    
    // Set loading state for this specific leave
    setLoadingLeaveIds(prev => new Set(prev).add(leaveId));
    
    try {      
      const response = await axios.post(`${API_URL}/leave/${leaveId}/status`, {
        status: update.status,
        approvalNotes: update.approvalNotes || ''
      }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Leave status updated successfully:', response.data);
      toast.success('Leave request updated successfully');
      fetchLeaves(); // Refresh the list
    } catch (err) {
      
      if (axios.isAxiosError(err) && err.response) {
        console.error('Server response:', err.response.data);
        const errorMessage = err.response.data.error || 'Failed to update leave request';
        toast.error(errorMessage);
      } else {
        toast.error('Failed to update leave request');
      }
    } finally {
      // Remove loading state for this specific leave
      setLoadingLeaveIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(leaveId);
        return newSet;
      });
    }
  };
  const handleCancel = async (leaveId: string) => {
    if (!token) {
      toast.error(t('messages.authenticationRequired'));
      return;
    }
    
    // Set loading state for this specific leave
    setLoadingLeaveIds(prev => new Set(prev).add(leaveId));
    
    try {
      await axios.post(`${API_URL}/leave/${leaveId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('messages.leaveRequestCancelled'));
      fetchLeaves();
    } catch (err) {
      console.error('Error cancelling leave:', err);
      toast.error(t('messages.failedToCancelLeaveRequest'));
    } finally {
      // Remove loading state for this specific leave
      setLoadingLeaveIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(leaveId);
        return newSet;
      });
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
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md dark:shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex flex-col gap-4 mb-6">
          {/* Header with Filter Tabs and Advanced Filter Toggle */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
              {t('leave.leaveRequests')}
            </h3>
            
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
              {/* Filter Tabs */}
              <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 w-full sm:w-auto">
                {(() => {
                  const counts = getCounts();
                  return (
                    <>
                      <button
                        onClick={() => setActiveFilter('all')}
                        className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 flex items-center justify-center space-x-1 ${
                          activeFilter === 'all'
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                      >
                        <span className="truncate">{t('common.all')}</span>
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded flex-shrink-0">
                          {counts.all}
                        </span>
                      </button>
                      <button
                        onClick={() => setActiveFilter('pending')}
                        className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 flex items-center justify-center space-x-1 ${
                          activeFilter === 'pending'
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                      >
                        <span className="truncate">{t('leave.pending')}</span>
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded flex-shrink-0">
                          {counts.pending}
                        </span>
                      </button>
                      <button
                        onClick={() => setActiveFilter('older')}
                        className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 flex items-center justify-center space-x-1 ${
                          activeFilter === 'older'
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                      >
                        <span className="truncate">{t('leave.history')}</span>
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded flex-shrink-0">
                          {counts.older}
                        </span>
                      </button>
                    </>
                  );
                })()}
              </div>
              
              {/* Advanced Filter Toggle */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`w-full sm:w-auto px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 flex items-center justify-center space-x-1 ${
                  showAdvancedFilters || hasAdvancedFilters()
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                <span className="truncate">{t('common.filter')}</span>
                {hasAdvancedFilters() && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full flex-shrink-0">
                    •
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Employee Filter - Only for managers/admins */}
                {user?.role !== UserRole.EMPLOYEE && (
                  <div>                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('leave.employee')}
                    </label>
                    <select
                      value={advancedFilters.employee}
                      onChange={(e) => handleAdvancedFilterChange('employee', e.target.value)}
                      aria-label="Filter by employee"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                    >
                      <option value="">{t('employee.allEmployees')}</option>
                      {employees && Array.isArray(employees) && employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.firstName} {emp.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Leave Type Filter */}
                <div>                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('leave.type')}
                  </label>
                  <select
                    value={advancedFilters.leaveType}
                    onChange={(e) => handleAdvancedFilterChange('leaveType', e.target.value)}
                    aria-label="Filter by leave type"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                  >
                    <option value="">{t('leave.allTypes')}</option>
                    {Object.values(LeaveType).map((type) => (
                      <option key={type} value={type}>
                        {t(`leave.${type}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('leave.status')}
                  </label>
                  <select
                    value={advancedFilters.status}
                    onChange={(e) => handleAdvancedFilterChange('status', e.target.value)}
                    aria-label="Filter by status"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                  >
                    <option value="">{t('leave.allStatuses')}</option>
                    {Object.values(LeaveStatus).map((status) => (
                      <option key={status} value={status}>
                        {t(`leave.${status}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date Filter */}
                <div>                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('leave.dateFrom')}
                  </label>
                  <input
                    type="date"
                    value={advancedFilters.startDate}
                    onChange={(e) => handleAdvancedFilterChange('startDate', e.target.value)}
                    aria-label="Filter from date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                  />
                </div>

                {/* End Date Filter */}
                <div>                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('leave.toDate')}
                  </label>
                  <input
                    type="date"
                    value={advancedFilters.endDate}
                    onChange={(e) => handleAdvancedFilterChange('endDate', e.target.value)}
                    aria-label="Filter to date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                  />
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t('leave.showingResults', { showing: filteredLeaves.length, total: leaves.length })}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={clearAdvancedFilters}
                    disabled={!hasAdvancedFilters()}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    {t('leave.clearFilters')}
                  </button>
                  <button
                    onClick={() => setShowAdvancedFilters(false)}
                    className="px-3 py-1.5 text-sm font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-150"
                  >
                    {t('common.done')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
          {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {filteredLeaves.map((leave) => (
            <div key={leave._id} className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  {user?.role !== UserRole.EMPLOYEE && (
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {leave.employee.firstName} {leave.employee.lastName}
                    </div>
                  )}                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
                    {t(`leave.${leave.leaveType}`)}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(leave.status)}`}>
                  {t(`leave.${leave.status}`)}
                </span>
              </div>
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{t('leave.mobileLabels.duration')}</span>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{leave.totalDays} {t('leave.days')}</div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{t('leave.mobileLabels.dates')}</span>
                  <div className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {leave.reason && (
                <div className="mb-4">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t('leave.mobileLabels.reason')}</span>
                  <div className="text-sm text-gray-900 dark:text-gray-100 mt-1 line-clamp-2">
                    {leave.reason}
                  </div>
                </div>
              )}              {/* Mobile Actions */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200 dark:border-gray-600">
                {(user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN) && 
                 leave.status === LeaveStatus.PENDING && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(leave._id, { status: LeaveStatus.APPROVED })}
                      disabled={loadingLeaveIds.has(leave._id)}
                      className="flex-1 min-w-0 px-3 py-2 text-sm font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-md hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loadingLeaveIds.has(leave._id) && <LoadingSpinner />}
                      {t('leave.approve')}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(leave._id, { status: LeaveStatus.REJECTED })}
                      disabled={loadingLeaveIds.has(leave._id)}
                      className="flex-1 min-w-0 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loadingLeaveIds.has(leave._id) && <LoadingSpinner />}
                      {t('leave.reject')}
                    </button>
                  </>
                )}
                {user?.role === UserRole.EMPLOYEE && 
                 leave.status === LeaveStatus.PENDING && (
                  <button
                    onClick={() => handleCancel(leave._id)}
                    disabled={loadingLeaveIds.has(leave._id)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loadingLeaveIds.has(leave._id) && <LoadingSpinner />}
                    {t('leave.cancel')}
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {filteredLeaves.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {activeFilter === 'pending' && 'No pending leave requests found'}
                {activeFilter === 'older' && 'No historical leave requests found'}
                {activeFilter === 'all' && 'No leave requests found'}
              </p>              {activeFilter !== 'all' && leaves.length > 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Try switching to &quot;All&quot; to see other requests
                </p>
              )}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600"><thead className="bg-gray-50 dark:bg-gray-700">
              <tr>{user?.role !== UserRole.EMPLOYEE && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('leave.tableHeaders.employee')}</th>)}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('leave.tableHeaders.type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('leave.tableHeaders.dates')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('leave.tableHeaders.days')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('leave.tableHeaders.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('leave.tableHeaders.actions')}
              </th>
            </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {filteredLeaves.map((leave) => (
                <tr key={leave._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                  {user?.role !== UserRole.EMPLOYEE && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {leave.employee.firstName} {leave.employee.lastName}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 capitalize">
                    {t(`leave.${leave.leaveType}`)}
                  </td>                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
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
                      {t(`leave.${leave.status}`)}
                    </span>
                  </td>                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col sm:flex-row gap-2">                      {(user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN) && 
                       leave.status === LeaveStatus.PENDING && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(leave._id, { status: 'approved' })}
                            disabled={loadingLeaveIds.has(leave._id)}
                            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors duration-150 px-2 py-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {loadingLeaveIds.has(leave._id) && <LoadingSpinner />}
                            {t('leave.approve')}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(leave._id, { status: 'rejected' })}
                            disabled={loadingLeaveIds.has(leave._id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-150 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {loadingLeaveIds.has(leave._id) && <LoadingSpinner />}
                            {t('leave.reject')}
                          </button>
                        </>
                      )}
                      {user?.role === UserRole.EMPLOYEE && 
                       leave.status === LeaveStatus.PENDING && (
                        <button
                          onClick={() => handleCancel(leave._id)}
                          disabled={loadingLeaveIds.has(leave._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-150 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {loadingLeaveIds.has(leave._id) && <LoadingSpinner />}
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeaves.length === 0 && (
                <tr>
                  <td 
                    colSpan={user?.role === UserRole.EMPLOYEE ? 5 : 6} 
                    className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>                    <p>
                        {activeFilter === 'pending' && t('leave.emptyStates.noPendingRequests')}
                        {activeFilter === 'older' && t('leave.emptyStates.noHistoricalRequests')}
                        {activeFilter === 'all' && t('leave.emptyStates.noRequests')}
                      </p>
                      {activeFilter !== 'all' && leaves.length > 0 && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {t('leave.emptyStates.tryAllFilter')}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>  );
}