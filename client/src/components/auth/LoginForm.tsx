'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { LoginCredentials } from '@/types/auth';

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function LoginForm() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials & { rememberMe: boolean }>();

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setIsLoading(true);
      await login(data);
      toast.success('Logged in successfully');
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError?.response?.data?.error || 'Invalid credentials';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Sign In
            </h2>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                id="email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         placeholder-gray-500 dark:placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                         focus:border-transparent transition-colors duration-200"
                placeholder="Enter your email"
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

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           placeholder-gray-500 dark:placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                           focus:border-transparent transition-colors duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3
                           text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
                           focus:outline-none focus:text-gray-600 dark:focus:text-gray-300
                           transition-colors duration-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  {...register('rememberMe')}
                  id="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 
                           border-gray-300 dark:border-gray-600 rounded
                           bg-white dark:bg-gray-700"
                />
                <label 
                  htmlFor="rememberMe" 
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Remember me
                </label>
              </div>
              <a 
                href="#" 
                className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 
                         transition-colors duration-200 font-medium"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center px-4 py-3 text-white font-medium
                       bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                       rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                       focus:ring-offset-2 dark:focus:ring-offset-gray-800
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}