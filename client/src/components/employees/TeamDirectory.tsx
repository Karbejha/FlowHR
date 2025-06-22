'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import axios from 'axios';
import { User } from '@/types/auth';
import toast from 'react-hot-toast';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TeamDirectory() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<User[]>([]);  const fetchEmployees = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/users/team-members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // For employees, show team members from the dedicated endpoint
      setEmployees(response.data.employees || []);    } catch (error) {
      console.error('Error fetching team members:', error);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        toast.error(t('employee.accessDenied'));
      } else {
        toast.error(t('employee.fetchError'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, t]);
  
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    // Filter employees based on search term
    const filtered = employees.filter(employee => 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [employees, searchTerm]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatPhoneNumber = () => {
    // This is a placeholder - in a real app, you'd have phone numbers in the user model
    return '+90 XXX XXX XX XX';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t('employee.teamDirectory')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredEmployees.length} {t('employee.teamMembers')}
          </p>
        </div>
        
        {/* Search Input */}
        <div className="relative max-w-md w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder={t('employee.searchTeam')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>      {/* Employee Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 sm:gap-6">
        {filteredEmployees.map((employee) => (
          <div
            key={employee._id}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 group hover:scale-[1.02] hover:border-blue-200 dark:hover:border-blue-700"
          >
            {/* Card Content */}
            <div className="p-6">
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  {employee.avatar ? (
                    <Image
                      src={employee.avatar}
                      alt={`${employee.firstName} ${employee.lastName}`}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 dark:border-gray-600"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-semibold border-4 border-gray-100 dark:border-gray-600">
                      {getInitials(employee.firstName, employee.lastName)}
                    </div>
                  )}
                  
                  {/* Online Status Indicator */}
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
              </div>

              {/* Employee Info */}
              <div className="text-center space-y-2">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">
                  {employee.firstName} {employee.lastName}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {employee.email}
                </p>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                    {employee.jobTitle}
                  </p>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                    {employee.department}
                  </p>
                </div>                {/* Phone Number Placeholder */}
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {formatPhoneNumber()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex justify-center space-x-2">
                <button
                  onClick={() => window.open(`mailto:${employee.email}`, '_blank')}
                  className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200"
                  title={t('employee.sendEmail')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
                
                <button
                  className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors duration-200"
                  title={t('employee.call')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredEmployees.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            {searchTerm ? t('employee.noSearchResults') : t('employee.noTeamMembers')}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? t('employee.tryDifferentSearch') : t('employee.noTeamMembersDescription')}
          </p>
        </div>
      )}
    </div>
  );
}
