'use client';

import { useTranslation } from '@/contexts/I18nContext';

export function I18nTest() {
  const { locale, t, isRTL } = useTranslation();
  
  return (
    <div className={`p-4 border rounded-lg ${isRTL ? 'text-right' : 'text-left'}`}>
      <h3 className="font-bold mb-2">Internationalization Test</h3>
      <p><strong>Current Locale:</strong> {locale}</p>
      <p><strong>Is RTL:</strong> {isRTL ? 'Yes' : 'No'}</p>
      <p><strong>Navigation.hrSystem:</strong> {t('navigation.hrSystem')}</p>
      <p><strong>Common.save:</strong> {t('common.save')}</p>
      <p><strong>Settings.settings:</strong> {t('settings.settings')}</p>
    </div>
  );
}
