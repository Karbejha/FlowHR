'use client';
import { useState, useEffect, useCallback, Fragment } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import axios, { AxiosError } from 'axios';
import { User, UserRole } from '@/types/auth';
import toast from 'react-hot-toast';
import AddUserForm from './AddUserForm';
import EditUserForm from './EditUserForm';
import AvatarUpload from '@/components/common/AvatarUpload';
import { Menu, Transition } from '@headlessui/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Common departments for filter dropdown
const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'Finance',
  'Human Resources',
  'Operations',
  'IT',
  'Product',
  'Legal',
  'Customer Support',
  'Other'
];

export default function EmployeeList() {
  const { t, isRTL } = useTranslation();
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    employeeId: string;
    employeeName: string;
    isBulkDelete: boolean;
    selectedCount: number;
  }>({
    isOpen: false,
    employeeId: '',
    employeeName: '',
    isBulkDelete: false,
    selectedCount: 0
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<User[]>([]);
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    role: '',
    isActive: ''
  });

  const { user, token } = useAuth();
  const fetchEmployees = useCallback(async () => {
    if (!token) {
      toast.error(t('messages.authenticationRequired'));
      return;
    }
    
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${API_URL}/users/employees`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          limit: pageSize
        }
      });
      
      setEmployees(data.employees);
      setFilteredEmployees(data.employees);
      setTotalPages(data.pagination.totalPages);
      setTotalEmployees(data.pagination.total);
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      toast.error(err.response?.data?.error || t('messages.failedToFetchAttendanceRecords'));
    } finally {
      setIsLoading(false);
    }
  }, [token, t, currentPage, pageSize]);

  useEffect(() => {
    if (token) {
      fetchEmployees();
    }
  }, [token, fetchEmployees]);
  // Handle filter changes
  const handleFilterChange = useCallback((filterKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      department: '',
      role: '',
      isActive: ''
    });
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useCallback(() => {
    return Object.values(filters).some(value => value !== '');
  }, [filters]);

  // Filter employees based on search term and advanced filters
  useEffect(() => {
    let filtered = employees;
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(employee => 
        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchLower) ||
        employee.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply department filter
    if (filters.department) {
      filtered = filtered.filter(employee => employee.department === filters.department);
    }
    
    // Apply role filter
    if (filters.role) {
      filtered = filtered.filter(employee => employee.role === filters.role);
    }
    
    // Apply active status filter
    if (filters.isActive !== '') {
      const isActive = filters.isActive === 'active';
      filtered = filtered.filter(employee => employee.isActive === isActive);
    }
    
    setFilteredEmployees(filtered);
  }, [searchTerm, employees, filters]);

  // Reset to first page when changing page size
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(new Set(filteredEmployees.map(emp => emp._id)));
    } else {
      setSelectedEmployees(new Set());
    }
  };

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmployees);
    if (checked) {
      newSelected.add(employeeId);
    } else {
      newSelected.delete(employeeId);
    }
    setSelectedEmployees(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedEmployees.size === 0) {
      toast.error(t('employee.selectEmployees'));
      return;
    }
    setDeleteConfirmation({
      isOpen: true,
      employeeId: '',
      employeeName: '',
      isBulkDelete: true,
      selectedCount: selectedEmployees.size
    });
  };

  const updateEmployeeStatus = useCallback(async (employeeId: string, isActive: boolean) => {
    if (!token) {
      toast.error(t('messages.authenticationRequired'));
      return;
    }
    
    try {
      await axios.patch(
        `${API_URL}/users/${employeeId}/status`,
        { isActive },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast.success(t('employee.employeeUpdated'));
      fetchEmployees();
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      toast.error(err.response?.data?.error || t('messages.failedToUpdateUser'));
    }
  }, [token, fetchEmployees, t]);

  const confirmDeleteEmployee = useCallback(async () => {
    const { employeeId, isBulkDelete } = deleteConfirmation;
    
    if (!token) {
      toast.error(t('messages.authenticationRequired'));
      return;
    }
    try {
      if (isBulkDelete) {
        // Handle bulk delete
        await Promise.all(
          Array.from(selectedEmployees).map(id =>
            axios.delete(`${API_URL}/users/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          )
        );
        toast.success(t('employee.confirmBulkDelete', { count: selectedEmployees.size }));
        setSelectedEmployees(new Set());
      } else {
        // Handle single delete
        await axios.delete(`${API_URL}/users/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(t('employee.employeeDeleted'));
      }
      
      fetchEmployees();
      setDeleteConfirmation({ isOpen: false, employeeId: '', employeeName: '', isBulkDelete: false, selectedCount: 0 });
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      toast.error(err.response?.data?.error || t('messages.failedToUpdateUser'));
    }
  }, [token, fetchEmployees, deleteConfirmation, selectedEmployees, t]);

  const cancelDeleteEmployee = useCallback(() => {
    setDeleteConfirmation({ isOpen: false, employeeId: '', employeeName: '', isBulkDelete: false, selectedCount: 0 });
  }, []);

  // Handle escape key to close modal and prevent background scrolling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && deleteConfirmation.isOpen) {
        cancelDeleteEmployee();
      }
    };
    if (deleteConfirmation.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent background scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [deleteConfirmation.isOpen, cancelDeleteEmployee]);

  // Memoized handler for edit
  const onEditEmployee = (employee: User) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingEmployee(employee);
    setShowEditForm(true);
    
    // Scroll to top on mobile for better UX
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Memoized handler for status update
  const onUpdateEmployeeStatus = (employeeId: string, isActive: boolean) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateEmployeeStatus(employeeId, isActive);
  };

  // Memoized handler for delete
  const onDeleteEmployee = (employee: User) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirmation({
      isOpen: true,
      employeeId: employee._id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      isBulkDelete: false,
      selectedCount: 0
    });
  };

  // Filter employees based on selected filters
  useEffect(() => {
    let filtered = employees;

    // Filter by department
    if (filters.department) {
      filtered = filtered.filter(employee => employee.department === filters.department);
    }

    // Filter by role
    if (filters.role) {
      filtered = filtered.filter(employee => employee.role === filters.role);
    }

    // Filter by active status
    if (filters.isActive !== '') {
      const isActive = filters.isActive === 'true';
      filtered = filtered.filter(employee => employee.isActive === isActive);
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [filters, employees]);

  if (isLoading) {
    return <div className="text-center">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">      {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && !showAddForm && !showEditForm && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div className="w-full md:w-1/2 relative">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('employee.searchEmployees')}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-200"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={t('common.clear')}
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 flex items-center space-x-1 ${
                showFilters || hasActiveFilters()
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              aria-label={t('common.filter')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
              <span>{t('common.filter')}</span>
              {hasActiveFilters() && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full">
                  •
                </span>
              )}
            </button>
            
            {selectedEmployees.size > 0 && user?.role === UserRole.ADMIN && (
              <>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-md flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>{t('employee.bulkDelete')} ({selectedEmployees.size})</span>
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400 self-center">
                  {selectedEmployees.size} {t('employee.selectEmployees')}
                </span>
              </>
            )}
            
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>{t('employee.addNewEmployee')}</span>
            </button>
          </div>
        </div>
      )}
        {/* Advanced Filters Panel */}
      {showFilters && !showAddForm && !showEditForm && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('common.filterByDepartment')}
              </label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                aria-label={t('common.filterByDepartment')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="">{t('employee.allDepartments')}</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('common.filterByRole')}
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                aria-label={t('common.filterByRole')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
              >                <option value="">{t('employee.allRoles')}</option>
                {Object.values(UserRole).map((role) => (
                  <option key={role} value={role}>
                    {t(`employee.roles.${role}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('common.filterByStatus')}
              </label>
              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
                aria-label={t('common.filterByStatus')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
              >
                <option value="">{t('employee.allStatus')}</option>
                <option value="active">{t('employee.active')}</option>
                <option value="inactive">{t('employee.inactive')}</option>
              </select>
            </div>
          </div>
          
          {/* Clear Filters Button */}
          {hasActiveFilters() && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{t('common.clearFilters')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {showAddForm && (
        <AddUserForm          onSuccess={() => {
            setShowAddForm(false);
            fetchEmployees();
            toast.success(t('messages.userCreatedSuccessfully'));
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {showEditForm && editingEmployee && (
        <EditUserForm
          employee={editingEmployee}          onSuccess={() => {
            setShowEditForm(false);
            setEditingEmployee(null);
            fetchEmployees();
            toast.success(t('messages.employeeUpdatedSuccessfully'));
          }}
          onCancel={() => {
            setShowEditForm(false);
            setEditingEmployee(null);
          }}
        />
      )}

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchTerm ? t('employee.noMatchingEmployees') : t('employee.noEmployeesFound')}
          </div>
        ) : (
          filteredEmployees.map((employee, index) => (
            <div key={employee._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {user?.role === UserRole.ADMIN && (
                    <input
                      type="checkbox"
                      checked={selectedEmployees.has(employee._id)}
                      onChange={(e) => handleSelectEmployee(employee._id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      aria-label={`Select ${employee.firstName} ${employee.lastName}`}
                    />
                  )}                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-bold rounded-full mr-2">
                        {(currentPage - 1) * pageSize + index + 1}
                      </span>
                      <AvatarUpload 
                        currentAvatar={employee.avatar}
                        size="sm"
                        editable={false}
                      />
                      <span>{employee.firstName} {employee.lastName}</span>
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{employee.email}</p>
                  </div>
                </div>
                {user?.role === UserRole.ADMIN && (
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </Menu.Button>
                    
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-48 ${isRTL ? 'origin-top-left' : 'origin-top-right'} rounded-md bg-white py-1 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50`}>                      <Menu.Item>
                          {({ close }) => (                          <button
                              onClick={(e) => {
                                onEditEmployee(employee)(e);
                                close();
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4 mr-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              {t('employee.editEmployee')}
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {() => (
                            <button
                              onClick={onUpdateEmployeeStatus(employee._id, !employee.isActive)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            >                            <svg className={`w-4 h-4 mr-3 ${employee.isActive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {employee.isActive ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )}
                              </svg>
                              {employee.isActive ? t('employee.deactivate') : t('employee.activate')}
                            </button>
                          )}
                        </Menu.Item>
                        <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>                      <Menu.Item>
                          {() => (
                            <button
                              onClick={onDeleteEmployee(employee)}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              {t('employee.deleteEmployee')}
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">              <div>
                  <p className="text-gray-500 dark:text-gray-400">{t('employee.department')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{employee.department}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{t('employee.role')}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                    ${employee.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      employee.role === UserRole.MANAGER ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                    {t(`employee.roles.${employee.role.toLowerCase()}`)}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 dark:text-gray-400">{t('employee.status')}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                    ${employee.isActive ? 
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {employee.isActive ? t('employee.active') : t('employee.inactive')}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>{user?.role === UserRole.ADMIN && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label="Select all employees"
                  /></th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.name')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('employee.email')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('employee.department')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('employee.role')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('employee.status')}</th>
              {user?.role === UserRole.ADMIN && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('common.actions')}</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={user?.role === UserRole.ADMIN ? 8 : 7} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm ? t('employee.noMatchingEmployees') : t('employee.noEmployeesFound')}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee, index) => (
                <tr key={employee._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  {user?.role === UserRole.ADMIN && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.has(employee._id)}
                        onChange={(e) => handleSelectEmployee(employee._id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        aria-label={`Select ${employee.firstName} ${employee.lastName}`}
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-bold rounded-full">
                      {(currentPage - 1) * pageSize + index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                    <div className="flex items-center space-x-3">
                      <AvatarUpload 
                        currentAvatar={employee.avatar}
                        size="sm"
                        editable={false}
                      />
                      <span>{employee.firstName} {employee.lastName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{employee.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{employee.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${employee.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        employee.role === UserRole.MANAGER ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                      {t(`employee.roles.${employee.role.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${employee.isActive ? 
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {employee.isActive ? t('employee.active') : t('employee.inactive')}
                    </span>
                  </td>
                  {user?.role === UserRole.ADMIN && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Menu as="div" className="relative inline-block text-left" key={`menu-${employee._id}`}>
                        <Menu.Button className="inline-flex items-center px-3 py-1 rounded-md text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800/30">                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          {t('common.edit')}
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </Menu.Button>
                        
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-48 ${isRTL ? 'origin-top-left' : 'origin-top-right'} rounded-md bg-white py-1 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50`}>                          <Menu.Item>
                              {({ close }) => (                              <button
                                  onClick={(e) => {
                                    onEditEmployee(employee)(e);
                                    close();
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 transition-colors duration-200"
                                >
                                  <svg className="w-4 h-4 mr-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  {t('employee.editEmployee')}
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {() => (
                                <button
                                  onClick={onUpdateEmployeeStatus(employee._id, !employee.isActive)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 transition-colors duration-200"
                                >                                <svg className={`w-4 h-4 mr-3 ${employee.isActive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {employee.isActive ? (
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                    ) : (
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    )}
                                  </svg>
                                  {employee.isActive ? t('employee.deactivate') : t('employee.activate')}
                                </button>
                              )}
                            </Menu.Item>
                            
                            <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>
                            <Menu.Item>
                              {() => (                              <button
                                  onClick={onDeleteEmployee(employee)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-200"
                                >
                                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  {t('employee.deleteEmployee')}
                                </button>
                              )}
                            </Menu.Item>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <div 
          className="fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50"
          onClick={cancelDeleteEmployee}
        >
          <div 
            className="relative p-4 w-full max-w-md h-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal content */}
            <div className="relative p-4 text-center bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
              <button 
                type="button" 
                className="text-gray-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={cancelDeleteEmployee}
              >
                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              
              <svg className="text-gray-400 dark:text-gray-500 w-11 h-11 mb-3.5 mx-auto" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
                <p className="mb-4 text-gray-500 dark:text-gray-300">
                {deleteConfirmation.isBulkDelete ? (
                  <>{t('employee.confirmBulkDelete', { count: deleteConfirmation.selectedCount })}</>
                ) : (
                  <>{t('employee.confirmDeleteEmployee')}</>
                )}
              </p>
              
              <div className="flex justify-center items-center space-x-4">
                <button 
                  type="button" 
                  className="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                  onClick={cancelDeleteEmployee}
                >
                  {t('common.no')}, {t('common.cancel')}
                </button>
                <button 
                  type="button" 
                  className="py-2 px-3 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900"
                  onClick={confirmDeleteEmployee}
                >
                  {t('common.yes')}, {t('common.confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination and Page Size Controls */}
      {!isLoading && filteredEmployees.length > 0 && (
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="pageSize" className="text-sm text-gray-600 dark:text-gray-400">
              {t('common.show')}:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="block w-full rounded-md border-2 border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200 text-sm p-2"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('common.perPage')}
            </span>
          </div>
          
          <div className="flex items-center justify-center">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-4">
              {t('employee.showing')} <span className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md font-medium text-gray-700 dark:text-gray-300">{(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, totalEmployees)}</span> {t('employee.of')} <span className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md font-medium text-gray-700 dark:text-gray-300">{totalEmployees}</span> {t('employee.employees')}
            </span>
            
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:z-20 focus:outline-offset-0 
                  ${currentPage === 1 
                    ? 'cursor-not-allowed dark:bg-gray-800 bg-gray-100' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <span className="sr-only">{t('common.previous')}</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Page Numbers */}
              {[...Array(totalPages)].map((_, idx) => {
                const pageNumber = idx + 1;
                const isVisible = (
                  pageNumber === 1 || // Always show first page
                  pageNumber === totalPages || // Always show last page
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1) // Show current page and neighbors
                );
                
                if (!isVisible) {
                  // Show ellipsis for skipped pages
                  if (pageNumber === 2 || pageNumber === totalPages - 1) {
                    return (
                      <span
                        key={`ellipsis-${pageNumber}`}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold 
                      ${currentPage === pageNumber 
                        ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' 
                        : 'text-gray-900 dark:text-gray-300 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-20 focus:outline-offset-0'}`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:z-20 focus:outline-offset-0 
                  ${currentPage === totalPages 
                    ? 'cursor-not-allowed dark:bg-gray-800 bg-gray-100' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                <span className="sr-only">{t('common.next')}</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}