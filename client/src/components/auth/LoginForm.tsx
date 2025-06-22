'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import toast from 'react-hot-toast';
import { LoginCredentials } from '@/types/auth';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import Link from 'next/link';

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function LoginForm() {
  const { t, isRTL } = useTranslation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials & { rememberMe: boolean }>();const onSubmit = async (data: LoginCredentials & { rememberMe: boolean }) => {
    try {
      setIsLoading(true);
      
      // Pass the complete data including rememberMe to the login function
      await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe
      });
        toast.success(t('auth.loginSuccess'));
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError?.response?.data?.error || t('auth.invalidCredentials');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex">      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-center">FlowHR</h1>          <p className="text-xl text-blue-100 text-center max-w-md leading-relaxed">
            {t('auth.systemDescription')}
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 max-w-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-blue-100">{t('navigation.employees')}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-blue-100">{t('navigation.attendance')}</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-blue-100">{t('navigation.leaveManagement')}</span>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
      </div>      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 relative">        {/* Language Switcher, Theme Toggle, and Help - Top Right */}
        <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} z-10 flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
          <ThemeToggle />
          <LanguageSwitcher variant="compact" />
        </div>
        
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 lg:p-10">
            <div className="text-center mb-8">
              <div className="lg:hidden mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">FlowHR</h1>
              </div>              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('auth.welcomeBack')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('auth.pleaseSignIn')}
              </p>
            </div>          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t('auth.emailAddress')}
              </label>
              <input
                {...register('email', {
                  required: t('auth.emailRequired'),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: t('auth.emailInvalid')
                  }
                })}
                type="email"
                id="email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         placeholder-gray-500 dark:placeholder-gray-400
                         focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 
                         transition-colors duration-200"
                placeholder={t('auth.enterEmail')}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t('auth.password')}
              </label>
              <div className="relative">
                <input                  {...register('password', { 
                    required: t('auth.passwordRequired'),
                    minLength: {
                      value: 6,
                      message: t('auth.passwordTooShort')
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           placeholder-gray-500 dark:placeholder-gray-400
                           focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 
                           transition-colors duration-200"
                  placeholder={t('auth.enterPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3
                           text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
                           focus:outline-none transition-colors duration-200"
                  aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.76 7.76m0 0L5.64 5.64m0 0L12 12m-6.36-6.36L12 12m0 0l2.878 2.878M12 12L9.878 9.878m0 0L12 12m0 0l4.243 4.243M12 12L7.758 7.758" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">                <input
                  {...register('rememberMe')}
                  id="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 
                           border-gray-300 dark:border-gray-600 rounded
                           bg-white dark:bg-gray-700
                           checked:bg-blue-600 checked:border-blue-600
                           focus:ring-2 focus:ring-offset-2
                           transition-colors duration-200"
                />
                <label 
                  htmlFor="rememberMe" 
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer
                           hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"                >
                  {t('auth.rememberMe')}
                </label>
              </div>
              <a 
                href="#" 
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 
                         transition-colors duration-200 font-medium"
              >
                {t('auth.forgotPassword')}
              </a>
            </div>            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center px-4 py-3 text-white font-medium
                       bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                       rounded-lg focus:outline-none
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('auth.loggingIn')}
                </>
              ) : (
                t('auth.signIn')
              )}
            </button>

            {/* Help Section */}
            <div className="mt-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    {t('auth.needHelp')}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <Link
                  href="/help-center"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 
                           hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 
                           focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('auth.getHelp')}
                </Link>
              </div>
              
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                {t('auth.helpDescription')}
              </div>
            </div>          </form>
        </div>
        
        {/* Floating Help Button */}
        <Link
          href="/help-center"
          className="fixed bottom-6 right-6 inline-flex items-center justify-center w-14 h-14 
                   bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                   transition-all duration-200 z-50 group"
          title={t('auth.getHelp')}
        >
          <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="sr-only">{t('auth.getHelp')}</span>
        </Link>
      </div>
    </div>
    </div>
  );
}