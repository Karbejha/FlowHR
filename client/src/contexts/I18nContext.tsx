'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, defaultLocale, isRTL } from '@/lib/i18n-config';

// Translation loading functions
const loadTranslation = async (locale: Locale) => {
  try {
    const translation = await import(`@/locales/${locale}.json`);
    return translation.default;
  } catch (error) {
    console.error(`Failed to load translation for locale: ${locale}`, error);
    // Fallback to English
    const fallbackTranslation = await import(`@/locales/en.json`);
    return fallbackTranslation.default;
  }
};

// Types
type TranslationObject = Record<string, unknown>;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isLoading: boolean;
  isRTL: boolean;
}

// Context
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider component
interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [translations, setTranslations] = useState<TranslationObject>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load initial locale from localStorage
  useEffect(() => {
    const savedLocale = localStorage.getItem('preferred-locale') as Locale;
    if (savedLocale && ['en', 'tr', 'ar'].includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
  }, []);

  // Load translations when locale changes
  useEffect(() => {
    const loadCurrentTranslation = async () => {
      setIsLoading(true);
      try {
        const translation = await loadTranslation(locale);
        setTranslations(translation);
        
        // Apply RTL/LTR direction to document
        document.documentElement.dir = isRTL(locale) ? 'rtl' : 'ltr';
        document.documentElement.lang = locale;
        
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentTranslation();
  }, [locale]);

  // Function to change locale
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('preferred-locale', newLocale);
  };
  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: unknown = translations;

    // Navigate through nested object
    for (const k of keys) {
      if (value && typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Return key if translation not found
        console.warn(`Translation not found for key: ${key} in locale: ${locale}`);
        return key;
      }
    }

    // Handle string interpolation
    if (typeof value === 'string' && params) {
      return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
        return str.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
      }, value);
    }

    return typeof value === 'string' ? value : key;
  };

  const contextValue: I18nContextType = {
    locale,
    setLocale,
    t,
    isLoading,
    isRTL: isRTL(locale),
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook to use i18n
export function useTranslation() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}

// Hook specifically for getting translation function
export function useT() {
  const { t } = useTranslation();
  return t;
}
