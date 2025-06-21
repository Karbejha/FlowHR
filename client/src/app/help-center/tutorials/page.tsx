'use client';
import Link from 'next/link';

export default function VideoTutorials() {
  const tutorials = [
    {
      title: 'Getting Started with HR System',
      description: 'A comprehensive introduction to the HR system interface and basic navigation.',
      duration: '5:30',
      category: 'Getting Started',
      thumbnail: '🎬',
      comingSoon: true
    },
    {
      title: 'Submitting Leave Requests',
      description: 'Step-by-step guide on how to submit and track leave requests.',
      duration: '3:45',
      category: 'Leave Management',
      thumbnail: '🏖️',
      comingSoon: true
    },
    {
      title: 'Attendance Tracking',
      description: 'Learn how to clock in/out and manage your attendance records.',
      duration: '4:20',
      category: 'Attendance',
      thumbnail: '🕐',
      comingSoon: true
    },
    {
      title: 'Profile Management',
      description: 'How to update your profile information and manage settings.',
      duration: '3:15',
      category: 'Profile',
      thumbnail: '👤',
      comingSoon: true
    },
    {
      title: 'Manager: Approving Leave Requests',
      description: 'Guide for managers on reviewing and approving team leave requests.',
      duration: '6:10',
      category: 'Management',
      thumbnail: '✅',
      comingSoon: true
    },
    {
      title: 'Admin: User Management',
      description: 'Complete guide to adding, editing, and managing user accounts.',
      duration: '8:25',
      category: 'Administration',
      thumbnail: '🛡️',
      comingSoon: true
    }
  ];

  const categories = ['All', 'Getting Started', 'Leave Management', 'Attendance', 'Profile', 'Management', 'Administration'];

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
                <span className="text-gray-900 dark:text-gray-100">Video Tutorials</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <span className="mr-3 text-4xl">🎥</span>
                Video Tutorials
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Step-by-step video guides for common tasks
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Coming Soon Notice */}
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🎬</div>
            <div>
              <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                Video Tutorials Coming Soon!
              </h2>
              <p className="text-blue-700 dark:text-blue-300">
                We&apos;re currently producing high-quality video tutorials to help you make the most of the HR system. 
                Check back soon for interactive guides and walkthroughs.
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 text-sm font-medium rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Tutorials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutorials.map((tutorial, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Thumbnail */}
              <div className="relative bg-gray-100 dark:bg-gray-700 h-48 flex items-center justify-center">
                <div className="text-6xl">{tutorial.thumbnail}</div>
                {tutorial.comingSoon && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold bg-blue-600 px-3 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {tutorial.category}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {tutorial.duration}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {tutorial.title}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {tutorial.description}
                </p>
                
                <button
                  disabled={tutorial.comingSoon}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {tutorial.comingSoon ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Coming Soon
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Watch Tutorial
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-8 border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Get Notified When Tutorials Are Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Be the first to know when new video tutorials are released.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">
                Notify Me
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
