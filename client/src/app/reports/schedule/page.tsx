'use client';

import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { useTranslation } from '@/contexts/I18nContext';
import AuthGuard from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/auth';
import api from '@/lib/api';

interface ReportSchedule {
  _id: string;
  reportType: string;
  reportName: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  sendTime: string;
  recipients: string[];
  filters?: Record<string, unknown>;
  active: boolean;
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
  updatedAt: string;
}

type ScheduleFrequency = ReportSchedule['frequency'];

interface ScheduleFormState {
  reportType: string;
  reportName: string;
  frequency: ScheduleFrequency;
  sendTime: string;
  recipients: string[];
  active: boolean;
}

const initialFormState: ScheduleFormState = {
  reportType: 'demographics',
  reportName: '',
  frequency: 'monthly',
  sendTime: '09:00',
  recipients: [''],
  active: true
};

export default function SchedulePage() {
  const { t } = useTranslation();
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ReportSchedule | null>(null);
  
  const [formData, setFormData] = useState<ScheduleFormState>(initialFormState);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/schedules');
      setSchedules(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to fetch schedules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSchedule) {
        await api.put(`/schedules/${editingSchedule._id}`, formData);
      } else {
        await api.post('/schedules', formData);
      }
      
      setShowModal(false);
      setEditingSchedule(null);
      resetForm();
      fetchSchedules();
    } catch (err) {
      console.error('Error saving schedule:', err);
      alert('Failed to save schedule');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('reports.confirmDeleteSchedule') || 'Are you sure you want to delete this schedule?')) {
      return;
    }
    
    try {
      await api.delete(`/schedules/${id}`);
      fetchSchedules();
    } catch (err) {
      console.error('Error deleting schedule:', err);
      alert('Failed to delete schedule');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/schedules/${id}/toggle`);
      fetchSchedules();
    } catch (err) {
      console.error('Error toggling schedule status:', err);
      alert('Failed to toggle schedule status');
    }
  };

  const handleEdit = (schedule: ReportSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      reportType: schedule.reportType,
      reportName: schedule.reportName,
      frequency: schedule.frequency,
      sendTime: schedule.sendTime,
      recipients: schedule.recipients,
      active: schedule.active
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ ...initialFormState });
  };

  const handleAddRecipient = () => {
    setFormData({
      ...formData,
      recipients: [...formData.recipients, '']
    });
  };

  const handleRemoveRecipient = (index: number) => {
    const newRecipients = formData.recipients.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      recipients: newRecipients.length > 0 ? newRecipients : ['']
    });
  };

  const handleRecipientChange = (index: number, value: string) => {
    const newRecipients = [...formData.recipients];
    newRecipients[index] = value;
    setFormData({
      ...formData,
      recipients: newRecipients
    });
  };

  const handleTestEmail = async () => {
    const email = prompt('Enter email address to test:', 'mohamad.karbejha@gmail.com');

    if (!email) return;

    try {
      await api.post('/schedules/test-email', { email });
      alert(`✅ Test email sent successfully to ${email}!\n\nCheck your inbox (and spam folder).`);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string; details?: string }>;
      const errorMsg = axiosError.response?.data?.message ?? axiosError.message ?? 'Failed to send test email';
      const details = axiosError.response?.data?.details;
      const detailsSection = details ? `\n\n${details}` : '';
      alert(`❌ Error: ${errorMsg}${detailsSection}\n\nPlease check the EMAIL_SETUP_GUIDE.md file in the project root for configuration instructions.`);
    }
  };

  const reportTypes = [
    { value: 'demographics', label: t('reports.demographicsTitle') },
    { value: 'attendance', label: t('reports.timeAttendanceTitle') },
    { value: 'leave-usage', label: t('reports.leaveUsageTitle') },
    { value: 'resource-allocation', label: t('reports.resourceAllocationTitle') },
    { value: 'payroll', label: t('reports.payrollReportTitle') },
    { value: 'financial-comprehensive', label: t('reports.financialComprehensiveTitle') },
    { value: 'tax-deductions', label: t('reports.taxDeductionsTitle') },
    { value: 'expense-comparison', label: t('reports.expenseComparisonTitle') }
  ];

  return (
    <AuthGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t('reports.scheduleReportTitle')}</h1>
          <div className="flex gap-3">
            <button
              onClick={handleTestEmail}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Test Email
            </button>
            <button
              onClick={() => {
                setEditingSchedule(null);
                resetForm();
                setShowModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              {t('reports.createSchedule')}
            </button>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {t('reports.scheduleReportDescription')}
        </p>

        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('reports.reportName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('reports.reportType')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('reports.frequency')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('reports.sendTime')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('reports.nextRun')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('reports.status')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      {t('reports.noSchedulesFound') || 'No schedules found. Create one to get started.'}
                    </td>
                  </tr>
                ) : (
                  schedules.map((schedule) => (
                    <tr key={schedule._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {schedule.reportName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {reportTypes.find(rt => rt.value === schedule.reportType)?.label || schedule.reportType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {t(`reports.${schedule.frequency}`)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {schedule.sendTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {schedule.nextRun ? new Date(schedule.nextRun).toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(schedule._id)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            schedule.active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {schedule.active ? t('common.active') : t('common.inactive')}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(schedule._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          {t('common.delete')}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {editingSchedule ? t('reports.editSchedule') : t('reports.createSchedule')}
                </h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    {/* Report Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('reports.reportName')}
                      </label>
                      <input
                        type="text"
                        title={t('reports.reportName')}
                        value={formData.reportName}
                        onChange={(e) => setFormData({ ...formData, reportName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                        required
                      />
                    </div>

                    {/* Report Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('reports.reportType')}
                      </label>
                      <select
                        value={formData.reportType}
                        title={t('reports.reportType')}
                        onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                      >
                        {reportTypes.map(rt => (
                          <option key={rt.value} value={rt.value}>{rt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Frequency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('reports.frequency')}
                      </label>
                      <select
                        value={formData.frequency}
                        title={t('reports.frequency')}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value as ScheduleFrequency })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                      >
                        <option value="daily">{t('reports.daily')}</option>
                        <option value="weekly">{t('reports.weekly')}</option>
                        <option value="monthly">{t('reports.monthly')}</option>
                      </select>
                    </div>

                    {/* Send Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('reports.sendTime')}
                      </label>
                      <input
                        type="time"
                        title={t('reports.sendTime')}
                        value={formData.sendTime}
                        onChange={(e) => setFormData({ ...formData, sendTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                        required
                      />
                    </div>

                    {/* Recipients */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('reports.recipients')}
                      </label>
                      {formData.recipients.map((recipient, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="email"
                            value={recipient}
                            onChange={(e) => handleRecipientChange(index, e.target.value)}
                            placeholder="email@example.com"
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                            required
                          />
                          {formData.recipients.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRecipient(index)}
                              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                            >
                              {t('common.remove')}
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddRecipient}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                      >
                        + {t('reports.addRecipient')}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(false);
                          setEditingSchedule(null);
                          resetForm();
                        }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                      >
                        {t('common.save')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

