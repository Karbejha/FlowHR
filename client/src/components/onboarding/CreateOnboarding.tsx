'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/auth';
import { TaskCategory } from '@/types/onboarding';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CreateOnboardingProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface TaskInput {
  title: string;
  description: string;
  category: TaskCategory;
  dueDate: string;
  assignedTo: string;
}

export default function CreateOnboarding({ onSuccess, onCancel }: CreateOnboardingProps) {
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    employee: '',
    startDate: new Date().toISOString().split('T')[0],
    expectedEndDate: ''
  });
  const [tasks, setTasks] = useState<TaskInput[]>([
    {
      title: 'Complete employee information form',
      description: 'Fill out personal and emergency contact details',
      category: TaskCategory.DOCUMENTATION,
      dueDate: '',
      assignedTo: ''
    }
  ]);

  const fetchEmployees = useCallback(async () => {
    if (!token) return;
    
    try {
      const { data } = await axios.get(`${API_URL}/users/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle both array response and object with employees property
      const employeesList = Array.isArray(data) ? data : (data?.employees || data?.users || []);
      setEmployees(employeesList);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
    }
  }, [token]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const addTask = () => {
    setTasks(prev => [
      ...prev,
      {
        title: '',
        description: '',
        category: TaskCategory.OTHER,
        dueDate: '',
        assignedTo: ''
      }
    ]);
  };

  const removeTask = (index: number) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, field: keyof TaskInput, value: string) => {
    setTasks(prev => prev.map((task, i) => 
      i === index ? { ...task, [field]: value } : task
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    // Validate tasks
    const validTasks = tasks.filter(t => t.title.trim() !== '');
    if (validTasks.length === 0) {
      toast.error('Please add at least one task');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/onboarding`, 
        {
          ...formData,
          tasks: validTasks
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      toast.success('Onboarding created successfully');
      onSuccess();
    } catch (err) {
      console.error('Error creating onboarding:', err);
      toast.error('Failed to create onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800 space-y-6">
      {/* Employee Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type *
          </label>
          <select
            aria-label="Onboarding type"
            required
            value={formData.employee}
            onChange={(e) => setFormData(prev => ({ ...prev, employee: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">Select employee...</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>
                {emp.firstName} {emp.lastName} - {emp.department}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Date *
          </label>
          <input
            aria-label="Onboarding start date"
            type="date"
            required
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expected End Date *
          </label>
          <input
            aria-label="Expected end date"
            type="date"
            required
            value={formData.expectedEndDate}
            onChange={(e) => setFormData(prev => ({ ...prev, expectedEndDate: e.target.value }))}
            min={formData.startDate}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Onboarding Tasks</h3>
          <button
            type="button"
            onClick={addTask}
            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Task
          </button>
        </div>

        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-700 dark:text-green-300 font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-3">
                  {/* Task Title */}
                  <input
                    type="text"
                    required
                    value={task.title}
                    onChange={(e) => updateTask(index, 'title', e.target.value)}
                    placeholder="Task title *"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />

                  {/* Task Description */}
                  <textarea
                    rows={2}
                    value={task.description}
                    onChange={(e) => updateTask(index, 'description', e.target.value)}
                    placeholder="Task description (optional)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />

                  {/* Task Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      aria-label="Task category"
                      value={task.category}
                      onChange={(e) => updateTask(index, 'category', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                    >
                      {Object.values(TaskCategory).map(cat => (
                        <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                      ))}
                    </select>

                    <input
                      type="date"
                      value={task.dueDate}
                      onChange={(e) => updateTask(index, 'dueDate', e.target.value)}
                      placeholder="Due date"
                      min={formData.startDate}
                      max={formData.expectedEndDate}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                    />

                    <select
                      aria-label="Assign task to employee"
                      value={task.assignedTo}
                      onChange={(e) => updateTask(index, 'assignedTo', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                    >
                      <option value="">Not assigned</option>
                      {employees.map(emp => (
                        <option key={emp._id} value={emp._id}>
                          {emp.firstName} {emp.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Remove Button */}
                {tasks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTask(index)}
                    aria-label="Remove task"
                    className="flex-shrink-0 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-green-200 dark:border-green-800">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Onboarding'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
