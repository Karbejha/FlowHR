'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminGuide() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

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
            This page is only accessible to administrators.
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

  const sections = [
    { id: 'overview', title: 'System Overview', icon: '🏛️' },
    { id: 'users', title: 'User Management', icon: '👥' },
    { id: 'permissions', title: 'Permissions & Roles', icon: '🔐' },
    { id: 'reports', title: 'Reports & Analytics', icon: '📊' },
    { id: 'settings', title: 'System Settings', icon: '⚙️' },
    { id: 'maintenance', title: 'Maintenance', icon: '🔧' }
  ];

  const content: Record<string, { title: string; content: React.JSX.Element }> = {
    'overview': {
      title: 'System Overview',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Administrator Dashboard
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              As an administrator, you have full access to all system features and can manage users, 
              configure settings, and generate comprehensive reports.
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Key Administrative Functions
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Complete employee lifecycle management</li>
              <li>System configuration and customization</li>
              <li>Advanced reporting and analytics</li>
              <li>User role and permission management</li>
              <li>Leave policy configuration</li>
              <li>Attendance tracking oversight</li>
              <li>System backup and maintenance</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
              🎯 Best Practices
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Regular system health checks and monitoring</li>
              <li>• Maintain up-to-date user permissions</li>
              <li>• Schedule regular data backups</li>
              <li>• Monitor system usage and performance</li>
            </ul>
          </div>
        </div>
      )
    },
    'users': {
      title: 'User Management',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Managing Users
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              User management is one of your primary responsibilities as an administrator.
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Adding New Employees
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Navigate to Employee Management</li>
              <li>Click &quot;Add New Employee&quot;</li>
              <li>Fill in personal information (name, email, phone)</li>
              <li>Set employment details (department, job title, hire date)</li>
              <li>Assign appropriate role (Employee, Manager, Admin)</li>
              <li>Set initial leave balances</li>
              <li>Assign manager if applicable</li>
              <li>Send welcome email with login credentials</li>
            </ol>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Employee Lifecycle Management
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li><strong>Onboarding:</strong> Set up new employee accounts and initial configurations</li>
              <li><strong>Updates:</strong> Modify employee information, roles, and assignments</li>
              <li><strong>Transfers:</strong> Move employees between departments or managers</li>
              <li><strong>Promotions:</strong> Update roles and responsibilities</li>
              <li><strong>Offboarding:</strong> Deactivate accounts while preserving historical data</li>
            </ul>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ Important Notes
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Always verify employee information before creating accounts</li>
              <li>• Deactivate rather than delete accounts to preserve data integrity</li>
              <li>• Regularly review and update employee roles and permissions</li>
            </ul>
          </div>
        </div>
      )
    },
    'permissions': {
      title: 'Permissions & Roles',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Role-Based Access Control
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The system uses role-based permissions to control access to features and data.
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Role Hierarchy
            </h4>
            <div className="space-y-3">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <h5 className="font-semibold text-red-800 dark:text-red-200">Administrator</h5>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Full system access, user management, system configuration, all reports
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <h5 className="font-semibold text-blue-800 dark:text-blue-200">Manager</h5>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Team management, leave approvals, team reports, limited employee data access
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <h5 className="font-semibold text-green-800 dark:text-green-200">Employee</h5>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Personal profile, leave requests, attendance tracking, own data only
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Permission Management
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Assign roles based on job responsibilities</li>
              <li>Regularly audit user permissions</li>
              <li>Follow principle of least privilege</li>
              <li>Document permission changes</li>
              <li>Review permissions during role changes</li>
            </ul>
          </div>
        </div>
      )
    },
    'reports': {
      title: 'Reports & Analytics',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Advanced Reporting
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Generate comprehensive reports for decision-making and compliance.
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Available Reports
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100">Attendance Reports</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Employee attendance patterns, late arrivals, overtime analysis
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100">Leave Usage</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Leave balances, usage trends, approval rates
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100">Demographics</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Workforce composition, diversity metrics, age distribution
                </p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100">Resource Allocation</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Department staffing, project assignments, capacity planning
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Report Best Practices
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Schedule regular report reviews</li>
              <li>Export reports for external analysis</li>
              <li>Use filters to focus on specific data</li>
              <li>Share insights with relevant stakeholders</li>
              <li>Maintain report archives for trend analysis</li>
            </ul>
          </div>
        </div>
      )
    },
    'settings': {
      title: 'System Settings',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              System Configuration
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Configure system-wide settings and policies.
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Key Configuration Areas
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li><strong>Leave Policies:</strong> Configure leave types, accrual rates, and approval workflows</li>
              <li><strong>Attendance Rules:</strong> Set working hours, overtime policies, and break requirements</li>
              <li><strong>Notification Settings:</strong> Configure email templates and notification triggers</li>
              <li><strong>System Preferences:</strong> Default language, date formats, and display options</li>
              <li><strong>Security Settings:</strong> Password policies, session timeouts, and access controls</li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Company Customization
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Upload company logo and branding</li>
              <li>Configure departments and job titles</li>
              <li>Set up organizational hierarchy</li>
              <li>Customize leave types and policies</li>
              <li>Configure public holidays and calendars</li>
            </ul>
          </div>
        </div>
      )
    },
    'maintenance': {
      title: 'Maintenance',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              System Maintenance
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Regular maintenance ensures optimal system performance and data integrity.
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Regular Maintenance Tasks
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Monitor system performance and usage</li>
              <li>Review and clean up inactive user accounts</li>
              <li>Update employee information and roles</li>
              <li>Verify data backup integrity</li>
              <li>Check system logs for errors or issues</li>
              <li>Update leave balances and accruals</li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Data Management
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Schedule regular data backups</li>
              <li>Archive old records according to retention policies</li>
              <li>Maintain data quality and consistency</li>
              <li>Monitor database performance</li>
              <li>Implement data security measures</li>
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
              🚨 Critical Tasks
            </h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              <li>• Ensure daily data backups are completed successfully</li>
              <li>• Monitor system security and access logs</li>
              <li>• Address any system alerts or warnings promptly</li>
              <li>• Maintain disaster recovery procedures</li>
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
                <span className="text-gray-900 dark:text-gray-100">Administrator Guide</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <span className="mr-3 text-4xl">🛡️</span>
                Administrator Guide
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Comprehensive guide for system administrators
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
                Admin Guide Sections
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
          </div>
        </div>
      </div>
    </div>
  );
}
