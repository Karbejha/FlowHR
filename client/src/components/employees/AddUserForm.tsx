'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { UserRole } from '@/types/auth';
import FileUpload from '@/components/common/FileUpload';

interface Manager {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AddUserFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ onSuccess, onCancel }) => {
  const { user, token } = useAuth();
  const { t } = useTranslation();  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: UserRole.EMPLOYEE,
    department: '',
    jobTitle: '',
    managerId: '',
    dateOfBirth: '',
    hireDate: '',
    salaryInfo: {
      basicSalary: 0,
      allowances: {
        transportation: 0,
        housing: 0,
        food: 0,
        mobile: 0,
        other: 0,
      },
      taxRate: 0,
      socialInsuranceRate: 0,
      healthInsuranceRate: 0,
      overtimeRate: 1.5,
    }
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available managers when component mounts or when user role changes
  useEffect(() => {
    const fetchManagers = async () => {
      if (!token || user?.role !== UserRole.ADMIN) return;
      
      try {
        const response = await fetch('/api/users/managers', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const managersData = await response.json();
          setManagers(managersData);
        }
      } catch (error) {
        console.error('Error fetching managers:', error);
      }
    };

    fetchManagers();
  }, [token, user?.role]);  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
      if (!token) {
      setError(t('messages.authenticationRequired'));
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
        if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('messages.failedToCreateUser'));
      }

      const createdUser = await response.json();
      
      // Upload avatar if provided
      if (avatarFile && createdUser.user?._id) {
        try {
          const avatarFormData = new FormData();
          avatarFormData.append('avatar', avatarFile);
          
          await fetch(`/api/users/${createdUser.user._id}/avatar`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: avatarFormData,
          });
        } catch (avatarError) {
          console.error('Avatar upload failed:', avatarError);
          // Don't fail the entire operation if avatar upload fails
        }
      }
      
      onSuccess();    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.failedToCreateUser'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested salaryInfo fields
    if (name.startsWith('salaryInfo.')) {
      const field = name.split('.')[1];
      if (field === 'allowances' || name.includes('allowances.')) {
        const allowanceField = name.split('.')[2];
        setFormData(prev => ({
          ...prev,
          salaryInfo: {
            ...prev.salaryInfo,
            allowances: {
              ...prev.salaryInfo.allowances,
              [allowanceField]: parseFloat(value) || 0
            }
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          salaryInfo: {
            ...prev.salaryInfo,
            [field]: parseFloat(value) || 0
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Only admins can create managers or admins
  const availableRoles = user?.role === UserRole.ADMIN
    ? Object.values(UserRole)
    : [UserRole.EMPLOYEE];
  const getRoleDisplayName = (role: string) => {
    return t(`employee.roles.${role.toLowerCase()}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="text-xl font-bold px-2 text-white">{t('employee.addNewUser')}</h2>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('employee.personalInformation')}</h3>
            </div>            {/* Avatar Upload Section */}
            <div className="mb-6">              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                {t('employee.profilePicture')}
              </label>
              <FileUpload
                onFileSelect={setAvatarFile}
                size="lg"
                label={t('employee.uploadAvatar')}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {t('employee.profilePictureNoteAdd')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('employee.firstName')} *
                </label>
                <div className="relative">
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="block w-full px-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder={t('employee.enterFirstName')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('employee.lastName')} *
                </label>
                <div className="relative">
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="block w-full px-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder={t('employee.enterLastName')}
                  />
                </div>
              </div>

              <div className="space-y-2">                <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('employees.dateOfBirth')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="dateOfBirth"
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                    max={new Date().toISOString().split('T')[0]} // Prevents selecting future dates
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('employees.dateOfBirthNote')}
                </p>
              </div>
            </div>
          </div>

          {/* Authentication Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('employee.authentication')}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('auth.emailAddress')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder={t('auth.enterEmail')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('auth.password')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder={t('employee.enterSecurePassword')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('employee.professionalInformation')}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">              <div className="space-y-2">
                <label htmlFor="department" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('employee.department')} *
                </label>
                <input
                  id="department"
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder={t('employee.enterDepartment')}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="jobTitle" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('employee.jobTitle')} *
                </label>
                <input
                  id="jobTitle"
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder={t('employee.enterJobTitle')}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('employee.role')} *
                </label>
                <div className="relative">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="block w-full px-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                    aria-label="User role"
                  >
                    {availableRoles.map(role => (
                      <option key={role} value={role}>{getRoleDisplayName(role)}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>              {formData.role === UserRole.EMPLOYEE && user?.role === UserRole.ADMIN && (                <div className="space-y-2">
                  <label htmlFor="managerId" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('employee.managerId')}
                  </label>
                  <select
                    id="managerId"
                    name="managerId"
                    value={formData.managerId}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                    aria-label="Manager"
                  >
                    <option value="">{t('employee.selectManagerOptional')}</option>
                    {managers.map((manager) => (
                      <option key={manager._id} value={manager._id}>
                        {manager.firstName} {manager.lastName} ({manager.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="hireDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('employee.hireDate')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="hireDate"
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('employee.hireDateNote')}
                </p>
              </div>
            </div>
          </div>

          {/* Salary Information Section - Only for Admins */}
          {user?.role === UserRole.ADMIN && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('payroll.title')}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Salary */}
                <div className="space-y-2">
                  <label htmlFor="salaryInfo.basicSalary" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('payroll.basicSalary')} *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">$</span>
                    </div>
                    <input
                      id="salaryInfo.basicSalary"
                      type="number"
                      name="salaryInfo.basicSalary"
                      value={formData.salaryInfo.basicSalary}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="block w-full pl-8 pr-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Transportation Allowance */}
                <div className="space-y-2">
                  <label htmlFor="salaryInfo.allowances.transportation" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('payroll.transportation')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">$</span>
                    </div>
                    <input
                      id="salaryInfo.allowances.transportation"
                      type="number"
                      name="salaryInfo.allowances.transportation"
                      value={formData.salaryInfo.allowances.transportation}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="block w-full pl-8 pr-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Housing Allowance */}
                <div className="space-y-2">
                  <label htmlFor="salaryInfo.allowances.housing" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('payroll.housing')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">$</span>
                    </div>
                    <input
                      id="salaryInfo.allowances.housing"
                      type="number"
                      name="salaryInfo.allowances.housing"
                      value={formData.salaryInfo.allowances.housing}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="block w-full pl-8 pr-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Food Allowance */}
                <div className="space-y-2">
                  <label htmlFor="salaryInfo.allowances.food" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('payroll.food')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">$</span>
                    </div>
                    <input
                      id="salaryInfo.allowances.food"
                      type="number"
                      name="salaryInfo.allowances.food"
                      value={formData.salaryInfo.allowances.food}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="block w-full pl-8 pr-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Mobile Allowance */}
                <div className="space-y-2">
                  <label htmlFor="salaryInfo.allowances.mobile" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('payroll.mobile')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">$</span>
                    </div>
                    <input
                      id="salaryInfo.allowances.mobile"
                      type="number"
                      name="salaryInfo.allowances.mobile"
                      value={formData.salaryInfo.allowances.mobile}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="block w-full pl-8 pr-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Other Allowances */}
                <div className="space-y-2">
                  <label htmlFor="salaryInfo.allowances.other" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('payroll.other')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">$</span>
                    </div>
                    <input
                      id="salaryInfo.allowances.other"
                      type="number"
                      name="salaryInfo.allowances.other"
                      value={formData.salaryInfo.allowances.other}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="block w-full pl-8 pr-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Tax Rate */}
                <div className="space-y-2">
                  <label htmlFor="salaryInfo.taxRate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('payroll.tax')} (%)
                  </label>
                  <div className="relative">
                    <input
                      id="salaryInfo.taxRate"
                      type="number"
                      name="salaryInfo.taxRate"
                      value={formData.salaryInfo.taxRate}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.1"
                      className="block w-full px-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-200"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">%</span>
                    </div>
                  </div>
                </div>

                {/* Social Insurance Rate */}
                <div className="space-y-2">
                  <label htmlFor="salaryInfo.socialInsuranceRate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('payroll.socialInsurance')} (%)
                  </label>
                  <div className="relative">
                    <input
                      id="salaryInfo.socialInsuranceRate"
                      type="number"
                      name="salaryInfo.socialInsuranceRate"
                      value={formData.salaryInfo.socialInsuranceRate}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.1"
                      className="block w-full px-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-200"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">%</span>
                    </div>
                  </div>
                </div>

                {/* Health Insurance Rate */}
                <div className="space-y-2">
                  <label htmlFor="salaryInfo.healthInsuranceRate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('payroll.healthInsurance')} (%)
                  </label>
                  <div className="relative">
                    <input
                      id="salaryInfo.healthInsuranceRate"
                      type="number"
                      name="salaryInfo.healthInsuranceRate"
                      value={formData.salaryInfo.healthInsuranceRate}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.1"
                      className="block w-full px-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-200"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">%</span>
                    </div>
                  </div>
                </div>

                {/* Overtime Rate */}
                <div className="space-y-2">
                  <label htmlFor="salaryInfo.overtimeRate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('payroll.overtime')} (x)
                  </label>
                  <div className="relative">
                    <input
                      id="salaryInfo.overtimeRate"
                      type="number"
                      name="salaryInfo.overtimeRate"
                      value={formData.salaryInfo.overtimeRate}
                      onChange={handleChange}
                      min="1"
                      step="0.1"
                      className="block w-full px-4 py-3 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-200"
                      placeholder="1.5"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Multiplier for overtime pay (e.g., 1.5 = 150% of hourly rate)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t('employee.creating')}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>{t('employee.createUser')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm;