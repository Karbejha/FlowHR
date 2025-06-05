'use client';
import { useAuth } from '@/contexts/AuthContext';
import { UpdateProfileData, ChangePasswordData } from '@/types/auth';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AvatarUpload from '@/components/common/AvatarUpload';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
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
  const { updateProfile, changePassword } = useAuth();

  const onProfileSubmit = async (data: UpdateProfileData) => {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8 px-4 sm:px-6 lg:px-8 pb-safe-left pr-safe-right">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your personal information and account settings
          </p>
        </div>        <div className="space-y-6 sm:space-y-8">
          {/* Profile Information Card */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Personal Information
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Update your personal details and contact information
                </p>
              </div>
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 w-full sm:w-auto"
              >
                {isEditMode ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>            <div className="p-4 sm:p-6">
              {isEditMode ? (
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                  {/* Avatar Upload Section */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6 space-y-4 sm:space-y-0">
                    <div className="flex-shrink-0">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Profile Picture
                      </label>
                      <AvatarUpload 
                        currentAvatar={user?.avatar}
                        size="lg"
                        editable={true}
                      />
                    </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        {...registerProfile('firstName', { required: 'First name is required' })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Enter your first name"
                      />
                      {profileErrors.firstName && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {profileErrors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        {...registerProfile('lastName', { required: 'Last name is required' })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Enter your last name"
                      />
                      {profileErrors.lastName && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {profileErrors.lastName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        {...registerProfile('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Enter your email"
                      />
                      {profileErrors.email && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {profileErrors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Department
                      </label>
                      <input
                        {...registerProfile('department')}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder="Enter your department"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Job Title
                      </label>
                      <input
                        {...registerProfile('jobTitle')}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"                        placeholder="Enter your job title"
                      />
                    </div>
                  </div>
                </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>              ) : (
                <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6 space-y-4 sm:space-y-0">
                  <div className="flex-shrink-0">
                    <AvatarUpload 
                      currentAvatar={user?.avatar}
                      size="lg"
                      editable={false}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                        <dd className="text-lg text-gray-900 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </dd>
                      </div>

                      <div className="space-y-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                        <dd className="text-lg text-gray-900 dark:text-white">{user?.email}</dd>
                      </div>

                      <div className="space-y-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</dt>
                        <dd className="text-lg text-gray-900 dark:text-white">
                          {user?.department || 'Not specified'}
                        </dd>
                      </div>

                      <div className="space-y-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Job Title</dt>
                        <dd className="text-lg text-gray-900 dark:text-white">
                          {user?.jobTitle || 'Not specified'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}
            </div>
          </div>          {/* Change Password Card */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Change Password
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Update your password to keep your account secure
                </p>
              </div>
              <button
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 w-full sm:w-auto"
              >
                {isChangingPassword ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {isChangingPassword && (
              <div className="p-4 sm:p-6">
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      {...registerPassword('currentPassword', { required: 'Current password is required' })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Enter your current password"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      {...registerPassword('newPassword', { 
                        required: 'New password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters'
                        }
                      })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Enter your new password"
                    />
                    {passwordErrors.newPassword && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      {...registerPassword('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                          value === newPassword || 'The passwords do not match',
                      })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Confirm your new password"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {passwordErrors.confirmPassword.message}
                      </p>
                    )}
                  </div>                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsChangingPassword(false)}
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}