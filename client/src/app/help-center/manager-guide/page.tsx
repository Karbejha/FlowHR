'use client';
import Link from 'next/link';

export default function ManagerGuide() {
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
                <span className="text-gray-900 dark:text-gray-100">Manager Guide</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <span className="mr-3 text-4xl">👨‍💼</span>
                Manager Guide
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Guide for managers on team and leave management
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
              Manager Guide Coming Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We&apos;re working on a comprehensive guide for managers. This will include detailed 
              instructions on team management, leave approvals, performance tracking, and reporting.
            </p>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                What will be covered:
              </h3>
              <ul className="text-left text-gray-600 dark:text-gray-400 space-y-2">
                <li>• Managing team members and assignments</li>
                <li>• Approving and managing leave requests</li>
                <li>• Viewing team attendance and performance</li>
                <li>• Generating team reports</li>
                <li>• Performance management best practices</li>
                <li>• Communication and notification management</li>
              </ul>
            </div>
            <div className="mt-8">
              <Link
                href="/help-center"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Browse Other Help Topics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
