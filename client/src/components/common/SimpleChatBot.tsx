'use client';
import { useState } from 'react';
import { useTranslation } from '@/contexts/I18nContext';

export default function SimpleChatBot() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Simple Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 h-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t('chatbot.title') || 'HR Assistant'}
            </h3>
            <button
              onClick={toggleChat}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Close chat"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-4 h-64 overflow-y-auto">
            <div className="space-y-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {t('chatbot.welcome') || 'Hello! I\'m your HR assistant. I can help you with questions about policies, procedures, leave requests, and more.'}
                </p>
              </div>
              
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                <p>This is a fallback chat interface.</p>
                <p>The main Botpress chatbot is temporarily unavailable.</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder={t('chatbot.placeholder') || 'Type your message here...'}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled
              />
              <button
                disabled
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm cursor-not-allowed"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Please contact HR directly for immediate assistance.
            </p>
          </div>
        </div>
      )}

      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className="group relative p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
          title={t('chatbot.openChat') || 'Open Chat Assistant'}
          aria-label={t('chatbot.openChat') || 'Open Chat Assistant'}
        >
          {/* Chat Icon - always show for fallback */}
          <svg 
            className="w-6 h-6"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            {t('chatbot.openChat') || 'Open HR Assistant'}
          </div>
        </button>
      </div>
    </>
  );
}
