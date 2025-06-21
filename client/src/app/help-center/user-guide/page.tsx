'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function UserGuide() {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
    { id: 'profile', title: 'Managing Your Profile', icon: '👤' },
    { id: 'attendance', title: 'Attendance Tracking', icon: '🕐' },
    { id: 'leave', title: 'Leave Requests', icon: '🏖️' },
    { id: 'notifications', title: 'Notifications', icon: '🔔' },
    { id: 'settings', title: 'Settings', icon: '⚙️' }
  ];

  const content: Record<string, { title: string; content: React.JSX.Element }> = {
    'getting-started': {
      title: 'Getting Started with the HR System',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Welcome to Your HR System
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This comprehensive guide will help you navigate and make the most of your HR system. 
              As an employee, you have access to various features that help you manage your work life efficiently.
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              First Time Login
            </h4>            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>You&apos;ll receive an email with your login credentials</li>
              <li>Visit the HR system login page</li>
              <li>Enter your email address and temporary password</li>
              <li>You&apos;ll be prompted to change your password on first login</li>
              <li>Set up a strong password with at least 8 characters</li>
            </ol>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Understanding Your Dashboard
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Your dashboard provides quick access to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Your profile information and settings</li>
              <li>Leave request submission and tracking</li>
              <li>Attendance clock-in/out functionality</li>
              <li>Upcoming birthdays and company announcements</li>
              <li>Recent notifications and updates</li>
            </ul>
          </div>
        </div>
      )
    },
    'profile': {
      title: 'Managing Your Profile',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Profile Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Keep your profile information up-to-date to ensure smooth HR operations and communications.
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Personal Information
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Update your contact details (phone, address)</li>
              <li>Change your profile picture</li>
              <li>Modify emergency contact information</li>
              <li>Update personal details as needed</li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Security Settings
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Change your password regularly</li>
              <li>Use strong, unique passwords</li>
              <li>Review login activity</li>
              <li>Set up security preferences</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
              💡 Pro Tip
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Keep your profile information current to ensure you receive important HR communications 
              and that your manager can reach you when needed.
            </p>
          </div>
        </div>
      )
    },
    'attendance': {
      title: 'Attendance Tracking',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Tracking Your Attendance
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The attendance system helps you track your work hours and maintain accurate records.
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Clock In/Out Process
            </h4>            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Navigate to the Attendance page from your dashboard</li>
              <li>Click &quot;Clock In&quot; when you arrive at work</li>
              <li>The system records your arrival time automatically</li>
              <li>Click &quot;Clock Out&quot; when leaving work</li>
              <li>Your total hours are calculated automatically</li>
            </ol>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Viewing Your Records
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>View your recent attendance history</li>
              <li>Check total hours worked per day/week</li>
              <li>See if you have any late arrivals or early departures</li>
              <li>Filter records by date range</li>
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ Important
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Always remember to clock out when leaving work. Forgot to clock out? Contact your manager 
              or HR to correct your attendance record.
            </p>
          </div>
        </div>
      )
    },
    'leave': {
      title: 'Leave Requests',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Managing Leave Requests
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Plan and request time off through the leave management system.
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Submitting a Leave Request
            </h4>            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Go to Leave Management from your dashboard</li>
              <li>Click &quot;Submit Leave Request&quot;</li>
              <li>Select the type of leave (Annual, Sick, Casual, etc.)</li>
              <li>Choose your start and end dates</li>
              <li>Provide a reason for your leave</li>
              <li>Submit for manager approval</li>
            </ol>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Leave Types Available
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li><strong>Annual Leave:</strong> Vacation and personal time off</li>
              <li><strong>Sick Leave:</strong> Medical appointments and illness</li>
              <li><strong>Casual Leave:</strong> Short-term personal matters</li>
              <li><strong>Maternity/Paternity:</strong> For new parents</li>
              <li><strong>Unpaid Leave:</strong> Extended time off without pay</li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Tracking Your Requests
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>View all your submitted requests and their status</li>
              <li>Check your remaining leave balance</li>
              <li>Receive notifications when requests are approved/rejected</li>
              <li>Cancel pending requests if plans change</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
              ✅ Best Practice
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Submit leave requests as early as possible to ensure proper coverage and approval. 
              Check your leave balance before submitting to avoid issues.
            </p>
          </div>
        </div>
      )
    },
    'notifications': {
      title: 'Notifications',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Staying Updated with Notifications
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The notification system keeps you informed about important updates and actions.
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Types of Notifications
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Leave request status updates</li>
              <li>Birthday reminders for colleagues</li>
              <li>System maintenance announcements</li>
              <li>Policy updates and changes</li>
              <li>Attendance reminders</li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Managing Notification Preferences
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Go to Settings from your profile menu</li>
              <li>Navigate to Notification Preferences</li>
              <li>Toggle email and system notifications on/off</li>
              <li>Choose which types of events notify you</li>
              <li>Save your preferences</li>
            </ol>
          </div>
        </div>
      )
    },
    'settings': {
      title: 'Settings',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Customizing Your Experience
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Personalize your HR system experience through various settings.
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Appearance Settings
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Switch between light and dark themes</li>
              <li>Choose system theme to match your device</li>
              <li>Adjust text size and display preferences</li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Language Preferences
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Select from available languages (English, Arabic, Turkish)</li>
              <li>Interface updates immediately upon selection</li>
              <li>Date and time formats adjust to your preference</li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Privacy and Security
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Update password regularly</li>
              <li>Review login activity</li>
              <li>Manage data sharing preferences</li>
              <li>Control profile visibility settings</li>
            </ul>
          </div>
        </div>
      )
    }
  };

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
                <span className="text-gray-900 dark:text-gray-100">User Guide</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <span className="mr-3 text-4xl">📖</span>
                User Guide
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Complete guide to using the HR system effectively
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Guide Sections
              </h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center ${
                      activeSection === section.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-3">{section.icon}</span>
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                {content[activeSection].title}
              </h2>
              <div className="prose prose-gray max-w-none dark:prose-invert">
                {content[activeSection].content}
              </div>
            </div>

            {/* Navigation between sections */}
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === activeSection);
                  if (currentIndex > 0) {
                    setActiveSection(sections[currentIndex - 1].id);
                  }
                }}
                disabled={sections.findIndex(s => s.id === activeSection) === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <button
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === activeSection);
                  if (currentIndex < sections.length - 1) {
                    setActiveSection(sections[currentIndex + 1].id);
                  }
                }}
                disabled={sections.findIndex(s => s.id === activeSection) === sections.length - 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
