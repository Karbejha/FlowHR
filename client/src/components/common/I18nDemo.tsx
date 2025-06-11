'use client';

import { useTranslation } from '@/contexts/I18nContext';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

export default function I18nDemo() {
  const { t, locale, isRTL } = useTranslation();

  const demoKeys = [
    'navigation.hrSystem',
    'navigation.leaveManagement', 
    'navigation.attendance',
    'navigation.employees',
    'common.save',
    'common.cancel',
    'common.loading',
    'employee.addEmployee',
    'leave.leaveBalance',
    'settings.settings'
  ];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Internationalization Demo
            </h1>
            <LanguageSwitcher variant="default" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Current Settings
              </h2>
              <div className="space-y-2 text-sm">
                <p><strong>Locale:</strong> {locale}</p>
                <p><strong>Direction:</strong> {isRTL ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)'}</p>
                <p><strong>Language:</strong> {
                  locale === 'en' ? 'English' : 
                  locale === 'tr' ? 'Türkçe' : 
                  locale === 'ar' ? 'العربية' : locale
                }</p>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Translation Examples
              </h2>
              <div className="space-y-2 text-sm">
                {demoKeys.map(key => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">
                      {key}:
                    </span>
                    <span className="font-medium ml-2">
                      {t(key)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              📝 Instructions
            </h3>
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Use the language switcher above to change the interface language. 
              Notice how the text direction changes for Arabic (RTL) and the translations 
              update immediately throughout the interface.
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            RTL Layout Test
          </h2>
          <div className={`p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
            <h3 className="font-bold mb-2">{t('settings.settings')}</h3>
            <p className="mb-3">{t('settings.customizeExperience')}</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
                {t('common.save')}
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-md">
                {t('common.cancel')}
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            This box demonstrates how the layout automatically adjusts for RTL languages.
            Text alignment, button order, and spacing adapt based on the selected language direction.
          </p>
        </div>
      </div>
    </div>
  );
}
