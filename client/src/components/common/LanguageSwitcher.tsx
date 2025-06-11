'use client';

import React, { useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { GlobeAltIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '@/contexts/I18nContext';
import { locales, localeNames, Locale } from '@/lib/i18n-config';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export default function LanguageSwitcher({ className = '', variant = 'default' }: LanguageSwitcherProps) {
  const { locale, setLocale, t, isRTL } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = async (newLocale: Locale) => {
    if (newLocale === locale) return;
    
    setIsChanging(true);
    try {
      setLocale(newLocale);
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const getFlagEmoji = (locale: Locale): string => {
    const flags = {
      en: '🇺🇸',
      tr: '🇹🇷',
      ar: '🇸🇦'
    };
    return flags[locale] || '🌐';
  };

  if (variant === 'compact') {
    return (
      <Menu as="div" className={`relative inline-block text-left ${className}`}>
        <Menu.Button className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
          {isChanging ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
          ) : (
            <GlobeAltIcon className="h-5 w-5" />
          )}
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-48 ${isRTL ? 'origin-top-left' : 'origin-top-right'} rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-gray-700 focus:outline-none z-50`}>
            <div className="p-1">
              {locales.map((localeOption) => (
                <Menu.Item key={localeOption}>
                  {({ active }) => (                    <button
                      onClick={() => handleLanguageChange(localeOption)}
                      className={`${
                        active
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : ''
                      } ${
                        locale === localeOption
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-900 dark:text-gray-100'
                      } group flex items-center justify-center w-full px-4 py-2 text-sm rounded-md transition-colors duration-200`}
                    >
                      <span className="text-lg mr-3">{getFlagEmoji(localeOption)}</span>
                      <span className="flex-1 text-center font-medium">{localeNames[localeOption]}</span>
                      {locale === localeOption && (
                        <svg className="ml-3 h-4 w-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    );
  }

  return (
    <Menu as="div" className={`relative inline-block text-left ${className}`}>
      <Menu.Button className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
        {isChanging ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400 mr-2"></div>        ) : (
          <>
            <span className="text-lg mr-3">{getFlagEmoji(locale)}</span>
            <span className="hidden sm:inline font-medium">{localeNames[locale]}</span>
            <span className="sm:hidden font-medium">{locale.toUpperCase()}</span>
          </>
        )}
        <ChevronDownIcon className="ml-3 h-4 w-4" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56 ${isRTL ? 'origin-top-left' : 'origin-top-right'} rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-gray-700 focus:outline-none z-50`}>
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700 mb-2">
              {t('common.language')}
            </div>
            {locales.map((localeOption) => (
              <Menu.Item key={localeOption}>
                {({ active }) => (                  <button
                    onClick={() => handleLanguageChange(localeOption)}
                    disabled={isChanging}
                    className={`${
                      active && !isChanging
                        ? 'bg-gray-100 dark:bg-gray-700'
                        : ''
                    } ${
                      locale === localeOption
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-900 dark:text-gray-100'
                    } ${
                      isChanging ? 'opacity-50 cursor-not-allowed' : ''
                    } group flex items-center w-full px-4 py-3 text-sm rounded-md transition-colors duration-200`}
                  >
                    <span className="text-lg mr-4">{getFlagEmoji(localeOption)}</span>
                    <div className="flex-1 text-center">
                      <div className="font-medium">{localeNames[localeOption]}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">
                        {localeOption}
                      </div>
                    </div>
                    {locale === localeOption && (
                      <svg className="ml-4 h-4 w-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
