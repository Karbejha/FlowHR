'use client';
import Link from 'next/link';

export default function KeyboardShortcuts() {
  const shortcuts = [
    {
      category: 'Navigation',
      icon: '🧭',
      shortcuts: [
        { keys: ['Alt', 'H'], description: 'Go to Homepage/Dashboard' },
        { keys: ['Alt', 'P'], description: 'Go to Profile' },
        { keys: ['Alt', 'A'], description: 'Go to Attendance' },
        { keys: ['Alt', 'L'], description: 'Go to Leave Management' },
        { keys: ['Alt', 'E'], description: 'Go to Employee Management (Admin/Manager)' },
        { keys: ['Alt', 'R'], description: 'Go to Reports (Admin/Manager)' },
        { keys: ['Alt', 'S'], description: 'Go to Settings' },
        { keys: ['Alt', 'N'], description: 'Go to Notifications' }
      ]
    },
    {
      category: 'General Actions',
      icon: '⚡',
      shortcuts: [
        { keys: ['Ctrl', 'S'], description: 'Save current form' },
        { keys: ['Escape'], description: 'Close modal or cancel action' },
        { keys: ['Enter'], description: 'Confirm action or submit form' },
        { keys: ['Ctrl', 'F'], description: 'Search/Filter' },
        { keys: ['Ctrl', 'R'], description: 'Refresh current page' },
        { keys: ['Ctrl', 'Z'], description: 'Undo last action (where applicable)' }
      ]
    },
    {
      category: 'Attendance',
      icon: '🕐',
      shortcuts: [
        { keys: ['Ctrl', 'I'], description: 'Clock In' },
        { keys: ['Ctrl', 'O'], description: 'Clock Out' },
        { keys: ['Ctrl', 'T'], description: 'View Time Records' }
      ]
    },
    {
      category: 'Leave Management',
      icon: '🏖️',
      shortcuts: [
        { keys: ['Ctrl', 'N'], description: 'Create New Leave Request' },
        { keys: ['Ctrl', 'V'], description: 'View Leave Balance' },
        { keys: ['Ctrl', 'D'], description: 'View Leave History' }
      ]
    },
    {
      category: 'Employee Management (Admin/Manager)',
      icon: '👥',
      shortcuts: [
        { keys: ['Ctrl', 'Alt', 'N'], description: 'Add New Employee' },
        { keys: ['Ctrl', 'Alt', 'E'], description: 'Edit Selected Employee' },
        { keys: ['Ctrl', 'Alt', 'D'], description: 'Deactivate Selected Employee' },
        { keys: ['Ctrl', 'Alt', 'F'], description: 'Filter Employee List' }
      ]
    },
    {
      category: 'Reports (Admin/Manager)',
      icon: '📊',
      shortcuts: [
        { keys: ['Ctrl', 'Shift', 'A'], description: 'Attendance Reports' },
        { keys: ['Ctrl', 'Shift', 'L'], description: 'Leave Usage Reports' },
        { keys: ['Ctrl', 'Shift', 'D'], description: 'Demographics Reports' },
        { keys: ['Ctrl', 'Shift', 'R'], description: 'Resource Allocation Reports' },
        { keys: ['Ctrl', 'Shift', 'E'], description: 'Export Current Report' }
      ]
    },
    {
      category: 'Interface',
      icon: '🎨',
      shortcuts: [
        { keys: ['Ctrl', 'Shift', 'T'], description: 'Toggle Dark/Light Theme' },
        { keys: ['Ctrl', 'Shift', 'L'], description: 'Toggle Language' },
        { keys: ['Ctrl', ','], description: 'Open Settings' },
        { keys: ['Ctrl', '/'], description: 'Show Help Center' },
        { keys: ['F11'], description: 'Toggle Fullscreen' }
      ]
    }
  ];

  const KeyBadge = ({ keys }: { keys: string[] }) => (
    <div className="flex items-center space-x-1">
      {keys.map((key, index) => (
        <div key={index} className="flex items-center">
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
            {key}
          </kbd>
          {index < keys.length - 1 && (
            <span className="mx-1 text-gray-500 dark:text-gray-400">+</span>
          )}
        </div>
      ))}
    </div>
  );

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
                <span className="text-gray-900 dark:text-gray-100">Keyboard Shortcuts</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <span className="mr-3 text-4xl">⌨️</span>
                Keyboard Shortcuts
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Boost your productivity with these keyboard shortcuts
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
        {/* Introduction */}
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
            💡 How to Use Shortcuts
          </h2>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
            <p>
              <strong>For Windows/Linux:</strong> Use Ctrl + key combinations as shown
            </p>
            <p>
              <strong>For Mac:</strong> Replace Ctrl with Cmd (⌘) and Alt with Option (⌥)
            </p>
            <p>
              Most shortcuts work globally within the HR system, while some are context-specific to certain pages.
            </p>
          </div>
        </div>

        {/* Shortcuts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {shortcuts.map((category) => (
            <div key={category.category} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <span className="mr-3 text-2xl">{category.icon}</span>
                  {category.category}
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {category.shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 pr-4">
                        {shortcut.description}
                      </span>
                      <KeyBadge keys={shortcut.keys} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
              <span className="mr-2">✅</span>
              Pro Tips
            </h3>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
              <li>• Learn 2-3 shortcuts per week to build muscle memory</li>
              <li>• Start with navigation shortcuts as they&apos;re used most frequently</li>
              <li>• Use Ctrl+/ to quickly access this shortcuts reference</li>
              <li>• Practice shortcuts during low-stress times to build familiarity</li>
            </ul>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-3 flex items-center">
              <span className="mr-2">🎯</span>
              Productivity Boost
            </h3>
            <div className="text-sm text-orange-700 dark:text-orange-300 space-y-2">
              <p>Users who master keyboard shortcuts report:</p>
              <ul className="space-y-1 mt-2">
                <li>• 25-40% faster task completion</li>
                <li>• Reduced mouse dependency</li>
                <li>• Improved workflow efficiency</li>
                <li>• Less repetitive strain from mouse usage</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Custom Shortcuts Note */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            🔧 Need More Shortcuts?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            If you have suggestions for additional keyboard shortcuts or would like to request custom shortcuts 
            for your workflow, please contact your system administrator or send feedback through the support channels.
          </p>
          <div className="flex space-x-4">
            <Link
              href="/help-center"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              View More Help Topics
            </Link>
            <a
              href="mailto:mohamad.karbjeha@gmail.com?subject=Keyboard Shortcuts Suggestion"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Send Feedback
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
