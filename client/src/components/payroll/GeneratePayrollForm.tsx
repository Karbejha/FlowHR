'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface GeneratePayrollFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  department: string;
  email: string;
}

const getMonthName = (monthIndex: number, t: (key: string) => string) => {
  const months = [
    'payroll.january', 'payroll.february', 'payroll.march', 'payroll.april',
    'payroll.may', 'payroll.june', 'payroll.july', 'payroll.august',
    'payroll.september', 'payroll.october', 'payroll.november', 'payroll.december'
  ];
  return t(months[monthIndex]);
};

export default function GeneratePayrollForm({ onSuccess, onCancel }: GeneratePayrollFormProps) {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState('');

  const currentDate = new Date();
  const [formData, setFormData] = useState({
    employeeId: '',
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    bonuses: {
      performance: 0,
      project: 0,
      other: 0
    },
    notes: ''
  });

  useEffect(() => {
    if (token) {
      fetchEmployees();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchEmployees = async () => {
    if (!token) {
      toast.error(t('messages.authenticationRequired'));
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/users/employees`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 1000 } // Get all employees for dropdown
      });
      setEmployees(response.data.employees || response.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      toast.error(t('messages.failedToFetchEmployees'));
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
      'MISSING_REQUIRED_FIELDS': t('payroll.errors.missingRequiredFields'),
      'INVALID_MONTH': t('payroll.errors.invalidMonth'),
      'PAYROLL_ALREADY_EXISTS': t('payroll.errors.payrollAlreadyExists'),
      'EMPLOYEE_NOT_FOUND': t('payroll.errors.employeeNotFound'),
      'SALARY_INFO_NOT_CONFIGURED': t('payroll.errors.salaryInfoNotConfigured'),
      'PAYROLL_NOT_FOUND': t('payroll.errors.payrollNotFound'),
      'CANNOT_UPDATE_APPROVED_PAYROLL': t('payroll.errors.cannotUpdateApprovedPayroll'),
      'PAYROLL_ALREADY_APPROVED': t('payroll.errors.payrollAlreadyApproved'),
      'PAYROLL_NOT_APPROVED': t('payroll.errors.payrollNotApproved'),
      'CAN_ONLY_DELETE_DRAFT': t('payroll.errors.canOnlyDeleteDraft')
    };
    return errorMessages[errorCode] || errorCode;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error(t('messages.authenticationRequired'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/payroll/generate`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(t('payroll.payrollGeneratedSuccessfully'));
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const errorCode = (err as {response?: {data?: {error?: string}}}).response?.data?.error || 'Failed to generate payroll';
      const errorMessage = getErrorMessage(errorCode);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBonusChange = (type: 'performance' | 'project' | 'other', value: string) => {
    setFormData(prev => ({
      ...prev,
      bonuses: {
        ...prev.bonuses,
        [type]: parseFloat(value) || 0
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Employee Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('payroll.selectEmployee')}
        </label>
        <select
          value={formData.employeeId}
          title='id'
          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
        >
          <option value="">{t('payroll.selectAnEmployee')}</option>
          {employees.map(emp => (
            <option key={emp._id} value={emp._id}>
              {emp.firstName} {emp.lastName} - {emp.department}
            </option>
          ))}
        </select>
      </div>

      {/* Month & Year */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('payroll.month')}
          </label>
          <select
            value={formData.month}
            title='month'
            onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i + 1}>
                {getMonthName(i, t)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('payroll.year')}
          </label>
          <input
            type="number"
            value={formData.year}
            title='year'
            onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
            required
            min="2020"
            max="2100"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Bonuses */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t('payroll.bonuses')} ({t('payroll.optional')})
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('payroll.performanceBonus')}
            </label>
            <input
              type="number"
              title='performance'
              value={formData.bonuses.performance}
              onChange={(e) => handleBonusChange('performance', e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('payroll.projectBonus')}
            </label>
            <input
              type="number"
              title='project'
              value={formData.bonuses.project}
              onChange={(e) => handleBonusChange('project', e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('payroll.otherBonus')}
            </label>
            <input
              type="number"
              title='other'
              value={formData.bonuses.other}
              onChange={(e) => handleBonusChange('other', e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('payroll.notes')} ({t('payroll.optional')})
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          placeholder={t('payroll.addAnyNotesHere')}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t('payroll.cancel')}
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('payroll.generating') : t('payroll.generatePayroll')}
        </button>
      </div>
    </form>
  );
}

