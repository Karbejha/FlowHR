'use client';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function APIDocs() {
  const { user } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Access Restricted
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            API documentation is only accessible to administrators.
          </p>
          <Link
            href="/help-center"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Help Center
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <Link href="/help-center" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Help Center
                </Link>
                <span>›</span>
                <span className="text-gray-900 dark:text-gray-100">API Documentation</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <span className="mr-3 text-4xl">📡</span>
                API Documentation
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Technical documentation for system integration
              </p>
            </div>
            <Link 
              href="/help-center"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Help Center
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              API Documentation In Development
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We&apos;re currently preparing comprehensive API documentation for system integration. 
              This will include REST API endpoints, authentication methods, and integration examples.
            </p>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Planned API Documentation:
              </h3>
              <div className="text-left space-y-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Authentication API</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    OAuth 2.0, JWT tokens, user authentication endpoints
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Employee Management API</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    CRUD operations for employee data, profile management
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Attendance API</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Clock in/out, attendance records, time tracking
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Leave Management API</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Leave requests, approvals, balance management
                  </p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Reporting API</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generate reports, export data, analytics endpoints
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 space-x-4">
              <Link
                href="/help-center"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Browse Other Help Topics
              </Link>
              <a
                href="mailto:mohamad.karbjeha@gmail.com?subject=API Documentation Request"
                className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Request Early Access
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
