'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Holiday {
  date: string;
  name: string;
  nameEn: string;
  nameTr: string;
  type: 'national' | 'religious';
}

// Turkish holidays for 2025
const TURKISH_HOLIDAYS_2025: Holiday[] = [
  { date: '2025-01-01', name: 'New Year\'s Day', nameEn: 'New Year\'s Day', nameTr: 'Yılbaşı', type: 'national' },
  { date: '2025-04-23', name: 'National Sovereignty and Children\'s Day', nameEn: 'National Sovereignty and Children\'s Day', nameTr: 'Ulusal Egemenlik ve Çocuk Bayramı', type: 'national' },
  { date: '2025-05-01', name: 'Labour and Solidarity Day', nameEn: 'Labour and Solidarity Day', nameTr: 'Emek ve Dayanışma Günü', type: 'national' },
  { date: '2025-05-19', name: 'Commemoration of Atatürk, Youth and Sports Day', nameEn: 'Commemoration of Atatürk, Youth and Sports Day', nameTr: 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı', type: 'national' },
  { date: '2025-07-15', name: 'Democracy and National Unity Day', nameEn: 'Democracy and National Unity Day', nameTr: 'Demokrasi ve Milli Birlik Günü', type: 'national' },
  { date: '2025-08-30', name: 'Victory Day', nameEn: 'Victory Day', nameTr: 'Zafer Bayramı', type: 'national' },
  { date: '2025-10-29', name: 'Republic Day', nameEn: 'Republic Day', nameTr: 'Cumhuriyet Bayramı', type: 'national' },
  // Religious holidays (approximate dates, they vary by lunar calendar)
  { date: '2025-03-30', name: 'Ramadan Feast', nameEn: 'Ramadan Feast', nameTr: 'Ramazan Bayramı', type: 'religious' },
  { date: '2025-03-31', name: 'Ramadan Feast', nameEn: 'Ramadan Feast', nameTr: 'Ramazan Bayramı', type: 'religious' },
  { date: '2025-04-01', name: 'Ramadan Feast', nameEn: 'Ramadan Feast', nameTr: 'Ramazan Bayramı', type: 'religious' },
  { date: '2025-06-07', name: 'Feast of Sacrifice', nameEn: 'Feast of Sacrifice', nameTr: 'Kurban Bayramı', type: 'religious' },
  { date: '2025-06-08', name: 'Feast of Sacrifice', nameEn: 'Feast of Sacrifice', nameTr: 'Kurban Bayramı', type: 'religious' },
  { date: '2025-06-09', name: 'Feast of Sacrifice', nameEn: 'Feast of Sacrifice', nameTr: 'Kurban Bayramı', type: 'religious' },
  { date: '2025-06-10', name: 'Feast of Sacrifice', nameEn: 'Feast of Sacrifice', nameTr: 'Kurban Bayramı', type: 'religious' },
];

export default function Calendar() {
  const { t, locale } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthNames = useMemo(() => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(2025, i, 1);
      months.push(date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'ar' ? 'ar-SA' : 'en-US', { month: 'long' }));
    }
    return months;
  }, [locale]);

  const dayNames = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(2025, 0, i + 4); // Start from Sunday
      days.push(date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short' }));
    }
    return days;
  }, [locale]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isHoliday = (date: Date) => {
    const dateStr = formatDate(date);
    return TURKISH_HOLIDAYS_2025.find(holiday => holiday.date === dateStr);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }

    return days;
  };

  const getHolidaysByMonth = (date: Date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    return TURKISH_HOLIDAYS_2025.filter(holiday => {
      const holidayDate = new Date(holiday.date);
      return holidayDate.getMonth() === month && holidayDate.getFullYear() === year;
    });
  };

  const calendarDays = generateCalendarDays();
  const monthHolidays = getHolidaysByMonth(currentDate);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
          <div className="flex items-center justify-between">
            <div>              <h1 className="text-3xl font-bold text-white">
                {t('calendar.title')}
              </h1>
              <p className="text-blue-100 mt-2">
                {t('calendar.subtitle')}
              </p>
            </div>            <div className="hidden sm:flex items-center space-x-2 bg-white/10 rounded-lg p-2">
              <div className="flex items-center space-x-2 text-white">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span className="text-sm">{t('calendar.nationalHolidays')}</span>
              </div>
              <div className="flex items-center space-x-2 text-white ml-4">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm">{t('calendar.religiousHolidays')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-3">              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  aria-label={t('calendar.previousMonth')}
                  title={t('calendar.previousMonth')}
                >
                  <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  aria-label={t('calendar.nextMonth')}
                  title={t('calendar.nextMonth')}
                >
                  <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {dayNames.map((day, index) => (
                  <div
                    key={index}
                    className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="aspect-square"></div>;
                  }

                  const holiday = isHoliday(day);
                  const today = isToday(day);
                  const selected = isSelected(day);

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        aspect-square p-2 rounded-lg text-sm font-medium transition-all duration-200 relative
                        ${today ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800' : ''}
                        ${selected ? 'bg-blue-600 text-white' : ''}
                        ${holiday && !selected ? 
                          holiday.type === 'national' 
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700' 
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700'
                          : !selected ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100' 
                          : ''
                        }
                      `}
                    >
                      <span className="block">{day.getDate()}</span>
                      {holiday && (
                        <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full ${
                          holiday.type === 'national' ? 'bg-red-500' : 'bg-green-500'
                        }`}></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Legend */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {t('calendar.legend')}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('calendar.nationalHolidays')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('calendar.religiousHolidays')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('calendar.today')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Holidays this month */}
              {monthHolidays.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    {t('calendar.holidaysThisMonth')}
                  </h3>
                  <div className="space-y-3">
                    {monthHolidays.map((holiday, index) => {
                      const holidayDate = new Date(holiday.date);
                      return (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
                        >
                          <div className={`w-3 h-3 rounded-full mt-1 ${
                            holiday.type === 'national' ? 'bg-red-400' : 'bg-green-400'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {locale === 'tr' ? holiday.nameTr : holiday.nameEn}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {holidayDate.toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'ar' ? 'ar-SA' : 'en-US', {
                                day: 'numeric',
                                month: 'long'
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected Date Info */}
              {selectedDate && (
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    {t('calendar.selectedDate')}
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {selectedDate.toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'ar' ? 'ar-SA' : 'en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  {(() => {
                    const holiday = isHoliday(selectedDate);
                    return holiday ? (
                      <div className="mt-2 p-2 rounded bg-white dark:bg-gray-800">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          🎉 {locale === 'tr' ? holiday.nameTr : holiday.nameEn}
                        </p>                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {holiday.type} {t('calendar.holiday')}
                        </p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
