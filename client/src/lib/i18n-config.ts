// Locale configuration
export const locales = ['en', 'tr', 'ar'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';

// Locale names for display
export const localeNames: Record<Locale, string> = {
  en: 'English',
  tr: 'Türkçe', 
  ar: 'العربية'
};

// RTL languages
export const rtlLanguages: Locale[] = ['ar'];

export const isRTL = (locale: Locale): boolean => rtlLanguages.includes(locale);
