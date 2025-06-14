'use client';

import { useTranslation } from '@/contexts/I18nContext';

export default function Loading() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {t('common.loading')}
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          {t('reports.loadingDemographics')}
        </p>
      </div>
    </div>
  );
}
