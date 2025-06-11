'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import { UpdateProfileData, ChangePasswordData } from '@/types/auth';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AvatarUpload from '@/components/common/AvatarUpload';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
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
  const { updateProfile, changePassword } = useAuth();  const onProfileSubmit = async (data: UpdateProfileData) => {
    try {
      const response = await updateProfile(data);
      if (response.user) {
        toast.success(t('profile.profileUpdatedSuccess'));
        setIsEditMode(false);
      }
    } catch (error: unknown) {
      let errorMessage = t('profile.failedToUpdateProfile');
      
      if (error instanceof Error) {
        // Check for specific server error messages and translate them
        switch (error.message) {
          case 'Email already in use':
            errorMessage = t('profile.emailAlreadyInUse');
            break;
          case 'User not found':
            errorMessage = t('profile.userNotFound');
            break;
          case 'Error updating profile':
            errorMessage = t('profile.errorUpdatingProfile');
            break;
          default:
            errorMessage = error.message;
            break;
        }
      }
      
      toast.error(errorMessage);
    }
  };const onPasswordSubmit = async (data: ChangePasswordData) => {
    try {
      const response = await changePassword(data);
      if (response.message) {
        toast.success(t('profile.passwordUpdatedSuccess'));
        setIsChangingPassword(false);
      }
    } catch (error: unknown) {
      let errorMessage = t('profile.failedToChangePassword');
      
      if (error instanceof Error) {
        // Check for specific server error messages and translate them
        switch (error.message) {
          case 'Current password is incorrect':
            errorMessage = t('profile.currentPasswordIncorrect');
            break;
          case 'User not found':
            errorMessage = t('profile.userNotFound');
            break;
          case 'Error changing password':
            errorMessage = t('profile.errorChangingPassword');
            break;
          default:
            errorMessage = error.message;
            break;
        }
      }
      
      toast.error(errorMessage);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8 px-4 sm:px-6 lg:px-8 pb-safe-left pr-safe-right">
      <div className="max-w-4xl mx-auto">        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t('profile.profileSettings')}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {t('profile.managePersonalInfo')}
          </p>
        </div><div className="space-y-6 sm:space-y-8">
          {/* Profile Information Card */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {t('profile.personalInformation')}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('profile.updatePersonalDetails')}
                </p>
              </div>
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 w-full sm:w-auto"
              >
                {isEditMode ? t('profile.cancel') : t('profile.editProfile')}
              </button>
            </div><div className="p-4 sm:p-6">
              {isEditMode ? (
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                  {/* Avatar Upload Section */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6 space-y-4 sm:space-y-0">                    <div className="flex-shrink-0">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        {t('profile.profilePicture')}
                      </label>
                      <AvatarUpload 
                        currentAvatar={user?.avatar}
                        size="lg"
                        editable={true}
                      />
                    </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('profile.firstName')}
                      </label>
                      <input
                        {...registerProfile('firstName', { required: t('profile.firstNameRequired') })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder={t('profile.enterFirstName')}
                      />
                      {profileErrors.firstName && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {profileErrors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('profile.lastName')}
                      </label>
                      <input
                        {...registerProfile('lastName', { required: t('profile.lastNameRequired') })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder={t('profile.enterLastName')}
                      />
                      {profileErrors.lastName && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {profileErrors.lastName.message}
                        </p>
                      )}
                    </div>                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('profile.email')}
                      </label>
                      <input
                        type="email"
                        {...registerProfile('email', { 
                          required: t('profile.emailRequired'),
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: t('profile.invalidEmail')
                          }
                        })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder={t('profile.enterEmail')}
                      />
                      {profileErrors.email && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                          {profileErrors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('profile.department')}
                      </label>
                      <input
                        {...registerProfile('department')}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                        placeholder={t('profile.enterDepartment')}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('profile.jobTitle')}
                      </label>
                      <input
                        {...registerProfile('jobTitle')}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"                        placeholder={t('profile.enterJobTitle')}
                      />
                    </div>
                  </div>
                </div>                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      {t('profile.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      {t('profile.saveChanges')}
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
                  
                  <div className="flex-1">                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('profile.name')}</dt>
                        <dd className="text-lg text-gray-900 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </dd>
                      </div>

                      <div className="space-y-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('profile.email')}</dt>
                        <dd className="text-lg text-gray-900 dark:text-white">{user?.email}</dd>
                      </div>

                      <div className="space-y-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('profile.department')}</dt>
                        <dd className="text-lg text-gray-900 dark:text-white">
                          {user?.department || t('profile.notSpecified')}
                        </dd>
                      </div>

                      <div className="space-y-1">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('profile.jobTitle')}</dt>
                        <dd className="text-lg text-gray-900 dark:text-white">
                          {user?.jobTitle || t('profile.notSpecified')}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}
            </div>
          </div>          {/* Change Password Card */}
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  {t('profile.changePassword')}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('profile.updatePasswordSecurity')}
                </p>
              </div>
              <button
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 w-full sm:w-auto"
              >
                {isChangingPassword ? t('profile.cancel') : t('profile.changePassword')}
              </button>
            </div>

            {isChangingPassword && (
              <div className="p-4 sm:p-6">
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.currentPassword')}
                    </label>
                    <input
                      type="password"
                      {...registerPassword('currentPassword', { required: t('profile.currentPasswordRequired') })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder={t('profile.enterCurrentPassword')}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.newPassword')}
                    </label>
                    <input
                      type="password"
                      {...registerPassword('newPassword', { 
                        required: t('profile.newPasswordRequired'),
                        minLength: {
                          value: 8,
                          message: t('profile.passwordMinLength')
                        }
                      })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder={t('profile.enterNewPassword')}
                    />
                    {passwordErrors.newPassword && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('profile.confirmNewPassword')}
                    </label>
                    <input
                      type="password"
                      {...registerPassword('confirmPassword', {
                        required: t('profile.confirmPasswordRequired'),
                        validate: (value) =>
                          value === newPassword || t('profile.passwordsDoNotMatch'),
                      })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder={t('profile.confirmYourNewPassword')}
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
                      {t('profile.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      {t('profile.updatePassword')}
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