'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UpdateProfileData, ChangePasswordData } from '@/types/auth';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<UpdateProfileData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      jobTitle: user?.jobTitle || '',
      department: user?.department || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    watch,
  } = useForm<ChangePasswordData>();

  const newPassword = watch('newPassword');
  const { updateProfile, changePassword } = useAuth();  const onProfileSubmit = async (data: UpdateProfileData) => {
    try {
      const response = await updateProfile(data);
      if (response.user) {
        toast.success('Profile updated successfully');
        setIsEditMode(false);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update profile';
      toast.error(errorMessage);
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordData) => {
    try {
      const response = await changePassword(data);
      if (response.message) {
        toast.success(response.message);
        setIsChangingPassword(false);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to change password';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        
        {/* Profile Information */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
            >
              {isEditMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {isEditMode ? (
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    {...registerProfile('firstName', { required: 'First name is required' })}
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                  />
                  {profileErrors.firstName && (
                    <span className="text-red-500 text-sm">{profileErrors.firstName.message}</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    {...registerProfile('lastName', { required: 'Last name is required' })}
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                  />
                  {profileErrors.lastName && (
                    <span className="text-red-500 text-sm">{profileErrors.lastName.message}</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    {...registerProfile('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                  />
                  {profileErrors.email && (
                    <span className="text-red-500 text-sm">{profileErrors.email.message}</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input
                    {...registerProfile('department')}
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Job Title</label>
                  <input
                    {...registerProfile('jobTitle')}
                    className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                    disabled
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                <p className="mt-1">{user?.firstName} {user?.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                <p className="mt-1">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Department</label>
                <p className="mt-1">{user?.department}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Job Title</label>
                <p className="mt-1">{user?.jobTitle}</p>
              </div>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Change Password</h2>
            <button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
            >
              {isChangingPassword ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {isChangingPassword && (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <input
                  type="password"
                  {...registerPassword('currentPassword', { required: 'Current password is required' })}
                  className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                />
                {passwordErrors.currentPassword && (
                  <span className="text-red-500 text-sm">{passwordErrors.currentPassword.message}</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input
                  type="password"
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                />
                {passwordErrors.newPassword && (
                  <span className="text-red-500 text-sm">{passwordErrors.newPassword.message}</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <input
                  type="password"
                  {...registerPassword('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value =>
                      value === newPassword || 'The passwords do not match',
                  })}
                  className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                />
                {passwordErrors.confirmPassword && (
                  <span className="text-red-500 text-sm">{passwordErrors.confirmPassword.message}</span>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
                >
                  Update Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
