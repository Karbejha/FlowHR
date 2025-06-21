'use client';
import { useState } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function HelpCenter() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: t('helpCenter.categories.all'), icon: '📚' },
    { id: 'getting-started', name: t('helpCenter.categories.gettingStarted'), icon: '🚀' },
    { id: 'attendance', name: t('helpCenter.categories.attendance'), icon: '🕐' },
    { id: 'leave', name: t('helpCenter.categories.leave'), icon: '🏖️' },
    { id: 'employees', name: t('helpCenter.categories.employees'), icon: '👥' },
    { id: 'reports', name: t('helpCenter.categories.reports'), icon: '📊' },
    { id: 'profile', name: t('helpCenter.categories.profile'), icon: '👤' },
    { id: 'settings', name: t('helpCenter.categories.settings'), icon: '⚙️' },
    { id: 'troubleshooting', name: t('helpCenter.categories.troubleshooting'), icon: '🔧' }
  ];

  const faqData = [
    // Getting Started
    {
      category: 'getting-started',
      question: t('helpCenter.faq.gettingStarted.login.question'),
      answer: t('helpCenter.faq.gettingStarted.login.answer'),
      roles: ['admin', 'manager', 'employee']
    },
    {
      category: 'getting-started',
      question: t('helpCenter.faq.gettingStarted.dashboard.question'),
      answer: t('helpCenter.faq.gettingStarted.dashboard.answer'),
      roles: ['admin', 'manager', 'employee']
    },
    {
      category: 'getting-started',
      question: t('helpCenter.faq.gettingStarted.roles.question'),
      answer: t('helpCenter.faq.gettingStarted.roles.answer'),
      roles: ['admin', 'manager', 'employee']
    },
    
    // Attendance
    {
      category: 'attendance',
      question: t('helpCenter.faq.attendance.clockIn.question'),
      answer: t('helpCenter.faq.attendance.clockIn.answer'),
      roles: ['employee']
    },
    {
      category: 'attendance',
      question: t('helpCenter.faq.attendance.viewRecords.question'),
      answer: t('helpCenter.faq.attendance.viewRecords.answer'),
      roles: ['admin', 'manager', 'employee']
    },
    {
      category: 'attendance',
      question: t('helpCenter.faq.attendance.corrections.question'),
      answer: t('helpCenter.faq.attendance.corrections.answer'),
      roles: ['admin', 'manager']
    },
    
    // Leave Management
    {
      category: 'leave',
      question: t('helpCenter.faq.leave.submit.question'),
      answer: t('helpCenter.faq.leave.submit.answer'),
      roles: ['employee']
    },
    {
      category: 'leave',
      question: t('helpCenter.faq.leave.approve.question'),
      answer: t('helpCenter.faq.leave.approve.answer'),
      roles: ['admin', 'manager']
    },
    {
      category: 'leave',
      question: t('helpCenter.faq.leave.balance.question'),
      answer: t('helpCenter.faq.leave.balance.answer'),
      roles: ['admin', 'manager', 'employee']
    },
    {
      category: 'leave',
      question: t('helpCenter.faq.leave.types.question'),
      answer: t('helpCenter.faq.leave.types.answer'),
      roles: ['admin', 'manager', 'employee']
    },
    
    // Employee Management
    {
      category: 'employees',
      question: t('helpCenter.faq.employees.add.question'),
      answer: t('helpCenter.faq.employees.add.answer'),
      roles: ['admin']
    },
    {
      category: 'employees',
      question: t('helpCenter.faq.employees.edit.question'),
      answer: t('helpCenter.faq.employees.edit.answer'),
      roles: ['admin', 'manager']
    },
    {
      category: 'employees',
      question: t('helpCenter.faq.employees.deactivate.question'),
      answer: t('helpCenter.faq.employees.deactivate.answer'),
      roles: ['admin']
    },
    
    // Reports
    {
      category: 'reports',
      question: t('helpCenter.faq.reports.attendance.question'),
      answer: t('helpCenter.faq.reports.attendance.answer'),
      roles: ['admin', 'manager']
    },
    {
      category: 'reports',
      question: t('helpCenter.faq.reports.leave.question'),
      answer: t('helpCenter.faq.reports.leave.answer'),
      roles: ['admin', 'manager']
    },
    {
      category: 'reports',
      question: t('helpCenter.faq.reports.demographics.question'),
      answer: t('helpCenter.faq.reports.demographics.answer'),
      roles: ['admin']
    },
    
    // Profile
    {
      category: 'profile',
      question: t('helpCenter.faq.profile.update.question'),
      answer: t('helpCenter.faq.profile.update.answer'),
      roles: ['admin', 'manager', 'employee']
    },
    {
      category: 'profile',
      question: t('helpCenter.faq.profile.avatar.question'),
      answer: t('helpCenter.faq.profile.avatar.answer'),
      roles: ['admin', 'manager', 'employee']
    },
    {
      category: 'profile',
      question: t('helpCenter.faq.profile.password.question'),
      answer: t('helpCenter.faq.profile.password.answer'),
      roles: ['admin', 'manager', 'employee']
    },
    
    // Settings
    {
      category: 'settings',
      question: t('helpCenter.faq.settings.language.question'),
      answer: t('helpCenter.faq.settings.language.answer'),
      roles: ['admin', 'manager', 'employee']
    },
    {
      category: 'settings',
      question: t('helpCenter.faq.settings.notifications.question'),
      answer: t('helpCenter.faq.settings.notifications.answer'),
      roles: ['admin', 'manager', 'employee']
    },
    {
      category: 'settings',
      question: t('helpCenter.faq.settings.theme.question'),
      answer: t('helpCenter.faq.settings.theme.answer'),
      roles: ['admin', 'manager', 'employee']
    },
    
    // Troubleshooting
    {
      category: 'troubleshooting',
      question: t('helpCenter.faq.troubleshooting.login.question'),
      answer: t('helpCenter.faq.troubleshooting.login.answer'),
      roles: ['admin', 'manager', 'employee']
    },
    {
      category: 'troubleshooting',
      question: t('helpCenter.faq.troubleshooting.performance.question'),
      answer: t('helpCenter.faq.troubleshooting.performance.answer'),
      roles: ['admin', 'manager', 'employee']
    },
    {
      category: 'troubleshooting',
      question: t('helpCenter.faq.troubleshooting.browser.question'),
      answer: t('helpCenter.faq.troubleshooting.browser.answer'),
      roles: ['admin', 'manager', 'employee']
    }
  ];

  const quickLinks = [
    {
      title: t('helpCenter.quickLinks.userGuide.title'),
      description: t('helpCenter.quickLinks.userGuide.description'),
      icon: '📖',
      href: '/help-center/user-guide',
      roles: ['admin', 'manager', 'employee']
    },
    {
      title: t('helpCenter.quickLinks.adminGuide.title'),
      description: t('helpCenter.quickLinks.adminGuide.description'),
      icon: '🛡️',
      href: '/help-center/admin-guide',
      roles: ['admin']
    },
    {
      title: t('helpCenter.quickLinks.managerGuide.title'),
      description: t('helpCenter.quickLinks.managerGuide.description'),
      icon: '👨‍💼',
      href: '/help-center/manager-guide',
      roles: ['admin', 'manager']
    },
    {
      title: t('helpCenter.quickLinks.videoTutorials.title'),
      description: t('helpCenter.quickLinks.videoTutorials.description'),
      icon: '🎥',
      href: '/help-center/tutorials',
      roles: ['admin', 'manager', 'employee']
    },
    {
      title: t('helpCenter.quickLinks.keyboardShortcuts.title'),
      description: t('helpCenter.quickLinks.keyboardShortcuts.description'),
      icon: '⌨️',
      href: '/help-center/shortcuts',
      roles: ['admin', 'manager', 'employee']
    },
    {
      title: t('helpCenter.quickLinks.apiDocs.title'),
      description: t('helpCenter.quickLinks.apiDocs.description'),
      icon: '📡',
      href: '/help-center/api-docs',
      roles: ['admin']
    }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesRole = faq.roles.includes(user?.role?.toLowerCase() || 'employee');
    
    return matchesCategory && matchesRole;
  });

  const filteredQuickLinks = quickLinks.filter(link => 
    link.roles.includes(user?.role?.toLowerCase() || 'employee')
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <span className="mr-3 text-4xl">🎯</span>
                {t('helpCenter.title')}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {t('helpCenter.subtitle')}
              </p>
            </div>
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t('helpCenter.backToDashboard')}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter Section */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-center">
              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            {t('helpCenter.quickLinksTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuickLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="group block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">{link.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                      {link.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {link.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            {t('helpCenter.faqTitle')}
          </h2>
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <FAQItem key={index} question={faq.question} answer={faq.answer} />
              ))
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-4xl mb-4">🤔</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {t('helpCenter.noResults')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('helpCenter.noResultsDescription')}
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                  }}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  {t('helpCenter.clearFilters')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-8 border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('helpCenter.stillNeedHelp')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t('helpCenter.contactDescription')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <a
                href="mailto:support@hrvsystem.com"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t('helpCenter.emailSupport')}
              </a>
              <button className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {t('helpCenter.liveChat')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
      >
        <span className="text-lg font-medium text-gray-900 dark:text-gray-100 pr-4">
          {question}
        </span>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-400 leading-relaxed">
            {answer.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
