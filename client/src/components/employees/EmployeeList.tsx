'use client';
import { useState, useEffect, useCallback, Fragment } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios, { AxiosError } from 'axios';
import { User, UserRole } from '@/types/auth';
import toast from 'react-hot-toast';
import AddUserForm from './AddUserForm';
import EditUserForm from './EditUserForm';
import { Menu, Transition } from '@headlessui/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EmployeeList() {
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

  const { user, token } = useAuth();

  const fetchEmployees = useCallback(async () => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }
    
    try {
      setIsLoading(true);
      const { data } = await axios.get<User[]>(`${API_URL}/users/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(data);
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      toast.error(err.response?.data?.error || 'Error fetching employees');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchEmployees();
    }
  }, [token, fetchEmployees]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(new Set(employees.map(emp => emp._id)));
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
      toast.error('Please select employees to delete');
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
      toast.error('Authentication required');
      return;
    }
    
    try {
      await axios.patch(
        `${API_URL}/users/${employeeId}/status`,
        { isActive },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast.success('Employee status updated successfully');
      fetchEmployees();
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      toast.error(err.response?.data?.error || 'Error updating employee status');
    }
  }, [token, fetchEmployees]);
  const confirmDeleteEmployee = useCallback(async () => {
    const { employeeId, isBulkDelete } = deleteConfirmation;
    
    if (!token) {
      toast.error('Authentication required');
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
        toast.success(`${selectedEmployees.size} employee(s) deleted successfully`);
        setSelectedEmployees(new Set());
      } else {
        // Handle single delete
        await axios.delete(`${API_URL}/users/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Employee deleted successfully');
      }
      
      fetchEmployees();
      setDeleteConfirmation({ isOpen: false, employeeId: '', employeeName: '', isBulkDelete: false, selectedCount: 0 });
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      toast.error(err.response?.data?.error || 'Error deleting employee(s)');
    }
  }, [token, fetchEmployees, deleteConfirmation, selectedEmployees]);

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

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && !showAddForm && !showEditForm && (
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            {selectedEmployees.size > 0 && user?.role === UserRole.ADMIN && (
              <>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-md flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete Selected ({selectedEmployees.size})</span>
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400 self-center">
                  {selectedEmployees.size} employee(s) selected
                </span>
              </>
            )}
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add New Employee</span>
          </button>
        </div>
      )}

      {showAddForm && (
        <AddUserForm
          onSuccess={() => {
            setShowAddForm(false);
            fetchEmployees();
            toast.success('User created successfully');
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {showEditForm && editingEmployee && (
        <EditUserForm
          employee={editingEmployee}
          onSuccess={() => {
            setShowEditForm(false);
            setEditingEmployee(null);
            fetchEmployees();
            toast.success('Employee updated successfully');
          }}
          onCancel={() => {
            setShowEditForm(false);
            setEditingEmployee(null);
          }}
        />
      )}

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {user?.role === UserRole.ADMIN && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.size === employees.length && employees.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label="Select all employees"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              {user?.role === UserRole.ADMIN && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {employees.map((employee) => (
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
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                  {employee.firstName} {employee.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{employee.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{employee.department}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${employee.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      employee.role === UserRole.MANAGER ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                    {employee.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${employee.isActive ? 
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                {user?.role === UserRole.ADMIN && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Menu as="div" className="relative inline-block text-left" key={`menu-${employee._id}`}>
                      <Menu.Button className="inline-flex items-center px-3 py-1 rounded-md text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800/30">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
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
                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50">
                          <Menu.Item>
                            {() => (
                              <button
                                onClick={onEditEmployee(employee)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 transition-colors duration-200"
                              >
                                <svg className="w-4 h-4 mr-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Employee
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {() => (
                              <button
                                onClick={onUpdateEmployeeStatus(employee._id, !employee.isActive)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 transition-colors duration-200"
                              >
                                <svg className={`w-4 h-4 mr-3 ${employee.isActive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  {employee.isActive ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                  ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  )}
                                </svg>
                                {employee.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                          </Menu.Item>
                          
                          <div className="border-t border-gray-100 dark:border-gray-600 my-1"></div>
                          <Menu.Item>
                            {() => (
                              <button
                                onClick={onDeleteEmployee(employee)}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 transition-colors duration-200"
                              >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Employee
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </td>
                )}
              </tr>
            ))}
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
                  <>Are you sure you want to delete {deleteConfirmation.selectedCount} employee(s)?</>
                ) : (
                  <>Are you sure you want to delete <span className="font-semibold">{deleteConfirmation.employeeName}</span>?</>
                )}
              </p>
              
              <div className="flex justify-center items-center space-x-4">
                <button 
                  type="button" 
                  className="py-2 px-3 text-sm font-medium text-gray-500 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                  onClick={cancelDeleteEmployee}
                >
                  No, cancel
                </button>
                <button 
                  type="button" 
                  className="py-2 px-3 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-900"
                  onClick={confirmDeleteEmployee}
                >
                  Yes, I&apos;m sure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}