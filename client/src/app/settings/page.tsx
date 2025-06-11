'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import AuthGuard from '@/components/auth/AuthGuard';
import toast from 'react-hot-toast';
import { 
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  EyeIcon,
  ClockIcon,
  PaintBrushIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface GeneralSettings {
  autoSaveSettings: boolean;
  showHelpfulTips: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  leaveRequestUpdates: boolean;
  attendanceReminders: boolean;
  systemAnnouncements: boolean;
  weeklyReports: boolean;
  instantMessages: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'team' | 'private';
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  shareAttendanceStats: boolean;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  showAnimations: boolean;
  fontSize: 'small' | 'medium' | 'large';
  language: 'en' | 'ar' | 'tr';
}

interface AttendanceSettings {
  clockInReminders: boolean;
  clockOutReminders: boolean;
  breakReminders: boolean;
  overtimeAlerts: boolean;
  weeklyReports: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: 15 | 30 | 60 | 120; // minutes
  loginNotifications: boolean;
  deviceManagement: boolean;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { t, locale, setLocale, isRTL } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Settings state
  const [general, setGeneral] = useState<GeneralSettings>({
    autoSaveSettings: true,
    showHelpfulTips: true,
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    leaveRequestUpdates: true,
    attendanceReminders: true,
    systemAnnouncements: true,
    weeklyReports: false,
    instantMessages: true,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'team',
    showOnlineStatus: true,
    allowDirectMessages: true,
    shareAttendanceStats: false,
  });

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: 'system',
    compactMode: false,
    showAnimations: true,
    fontSize: 'medium',
    language: 'en',
  });

  const [attendance, setAttendance] = useState<AttendanceSettings>({
    clockInReminders: true,
    clockOutReminders: true,
    breakReminders: false,
    overtimeAlerts: true,
    weeklyReports: true,
  });  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 60,
    loginNotifications: true,
    deviceManagement: true,
  });

  // RTL helper functions
  const getToggleClasses = (isEnabled: boolean) => {
    const baseClasses = `relative inline-flex h-6 w-11 items-center justify-start rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 p-1 ${isRTL ? 'flex-row-reverse' : ''}`;
    const backgroundClasses = isEnabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700";
    return `${baseClasses} ${backgroundClasses}`;
  };

  const getToggleCircleClasses = (isEnabled: boolean) => {
    const baseClasses = "absolute h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out";
    
    // RTL-aware positioning for toggle circle
    // In RTL mode, the logic is reversed
    let positionClasses;
    
    if (isRTL) {
      // In RTL: OFF means circle on right, ON means circle on left
      positionClasses = isEnabled ? "translate-x-1" : "translate-x-6";
    } else {
      // In LTR: OFF means circle on left, ON means circle on right  
      positionClasses = isEnabled ? "translate-x-6" : "translate-x-1";
    }
    
    return `${baseClasses} ${positionClasses}`;
  };

  // Load settings from localStorage on component mount
  useEffect(() => {    const loadSettings = () => {
      try {
        const savedGeneral = localStorage.getItem('hr-general-settings');
        const savedNotifications = localStorage.getItem('hr-notifications-settings');
        const savedPrivacy = localStorage.getItem('hr-privacy-settings');
        const savedAppearance = localStorage.getItem('hr-appearance-settings');
        const savedAttendance = localStorage.getItem('hr-attendance-settings');
        const savedSecurity = localStorage.getItem('hr-security-settings');

        if (savedGeneral) setGeneral(JSON.parse(savedGeneral));
        if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
        if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy));
        if (savedAppearance) setAppearance(JSON.parse(savedAppearance));
        if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
        if (savedSecurity) setSecurity(JSON.parse(savedSecurity));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async () => {
    setIsLoading(true);    try {
      // Save to localStorage
      localStorage.setItem('hr-general-settings', JSON.stringify(general));
      localStorage.setItem('hr-notifications-settings', JSON.stringify(notifications));
      localStorage.setItem('hr-privacy-settings', JSON.stringify(privacy));
      localStorage.setItem('hr-appearance-settings', JSON.stringify(appearance));
      localStorage.setItem('hr-attendance-settings', JSON.stringify(attendance));
      localStorage.setItem('hr-security-settings', JSON.stringify(security));

      // In a real app, you would also save to the backend
      // await api.saveUserSettings({ notifications, privacy, appearance, attendance, security });

      toast.success(t('settings.settingsSavedSuccess'));
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };
  const resetToDefaults = () => {
    setGeneral({
      autoSaveSettings: true,
      showHelpfulTips: true,
    });
    setNotifications({
      emailNotifications: true,
      leaveRequestUpdates: true,
      attendanceReminders: true,
      systemAnnouncements: true,
      weeklyReports: false,
      instantMessages: true,
    });
    setPrivacy({
      profileVisibility: 'team',
      showOnlineStatus: true,
      allowDirectMessages: true,
      shareAttendanceStats: false,
    });
    setAppearance({
      theme: 'system',
      compactMode: false,
      showAnimations: true,
      fontSize: 'medium',
      language: 'en',
    });
    setAttendance({
      clockInReminders: true,
      clockOutReminders: true,
      breakReminders: false,
      overtimeAlerts: true,
      weeklyReports: true,
    });
    setSecurity({
      twoFactorEnabled: false,
      sessionTimeout: 60,
      loginNotifications: true,
      deviceManagement: true,    });
    toast.success(t('settings.resetToDefaults'));
  };

  const tabs = [
    { id: 'general', name: locale === 'ar' ? 'عام' : locale === 'tr' ? 'Genel' : 'General', icon: CogIcon },
    { id: 'notifications', name: t('settings.notificationSettings') || 'Notifications', icon: BellIcon },
    { id: 'privacy', name: t('settings.privacySettings') || 'Privacy', icon: EyeIcon },
    { id: 'appearance', name: t('settings.appearanceSettings') || 'Appearance', icon: PaintBrushIcon },
    { id: 'attendance', name: t('settings.attendanceSettings') || 'Attendance', icon: ClockIcon },
    { id: 'security', name: t('settings.securitySettings') || 'Security', icon: ShieldCheckIcon },
  ];
  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center mb-4">
          <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settings.accountInformation')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('settings.userRole')}
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize bg-white dark:bg-gray-800 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600">
              {user?.role.toLowerCase()}
            </p>
          </div>          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('settings.memberSince')}
            </label>            <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600">
              {(() => {
                // Use hireDate if available, otherwise use createdAt, fallback to current date
                const memberDate = user?.hireDate 
                  ? new Date(user.hireDate)
                  : user?.createdAt 
                    ? new Date(user.createdAt)
                    : new Date();
                return memberDate.toLocaleDateString();
              })()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('settings.systemPreferences')}</h3>
        <div className="space-y-4">          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.autoSaveSettings')}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('settings.autoSaveDescription')}
              </p>
            </div>
            <button 
              onClick={() => setGeneral(prev => ({ ...prev, autoSaveSettings: !prev.autoSaveSettings }))}
              aria-label={`Toggle ${t('settings.autoSaveSettings')}`}
              className={getToggleClasses(general.autoSaveSettings)}>
              <span className={getToggleCircleClasses(general.autoSaveSettings)} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.showHelpfulTips')}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('settings.helpfulTipsDescription')}
              </p>
            </div>
            <button 
              onClick={() => setGeneral(prev => ({ ...prev, showHelpfulTips: !prev.showHelpfulTips }))}
              aria-label={`Toggle ${t('settings.showHelpfulTips')}`}
              className={getToggleClasses(general.showHelpfulTips)}>              <span className={getToggleCircleClasses(general.showHelpfulTips)} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('settings.emailNotifications')}</h3>
        <div className="space-y-4">
          {Object.entries({
            emailNotifications: t('settings.generalEmailNotifications'),
            leaveRequestUpdates: t('settings.leaveRequestUpdates'),
            attendanceReminders: t('settings.attendanceReminders'),
            systemAnnouncements: t('settings.systemAnnouncements'),
            weeklyReports: t('settings.weeklyReports'),
            instantMessages: t('settings.instantMessages'),
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
              </label>              <button
                onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof NotificationSettings] }))}
                aria-label={`Toggle ${label}`}
                className={getToggleClasses(notifications[key as keyof NotificationSettings])}
              >
                <span className={getToggleCircleClasses(notifications[key as keyof NotificationSettings])} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('settings.profileVisibility')}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.whoCanSeeProfile')}
            </label>            <select
              value={privacy.profileVisibility}
              onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value as 'public' | 'team' | 'private' }))}
              aria-label="Profile visibility settings"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="public">{t('settings.everyoneInOrganization')}</option>
              <option value="team">{t('settings.teamMembersOnly')}</option>
              <option value="private">{t('settings.onlyMe')}</option>
            </select>
          </div>          {Object.entries({
            showOnlineStatus: t('settings.showOnlineStatus'),
            allowDirectMessages: t('settings.allowDirectMessages'),
            shareAttendanceStats: t('settings.shareAttendanceStats'),
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
              </label>              <button
                onClick={() => setPrivacy(prev => ({ ...prev, [key]: !prev[key as keyof PrivacySettings] }))}
                aria-label={`Toggle ${label}`}
                className={getToggleClasses(Boolean(privacy[key as keyof PrivacySettings]))}
              >
                <span className={getToggleCircleClasses(Boolean(privacy[key as keyof PrivacySettings]))} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('settings.themeDisplay')}</h3>
        <div className="space-y-4">
          <div>            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.theme')}
            </label><select
              value={appearance.theme}
              onChange={(e) => setAppearance(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' | 'system' }))}
              aria-label="Theme selection"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >              <option value="light">{t('settings.light')}</option>
              <option value="dark">{t('settings.dark')}</option>
              <option value="system">{t('settings.systemDefault')}</option>
            </select>
          </div>

          <div>            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.fontSize')}
            </label><select
              value={appearance.fontSize}
              onChange={(e) => setAppearance(prev => ({ ...prev, fontSize: e.target.value as 'small' | 'medium' | 'large' }))}
              aria-label="Font size selection"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >              <option value="small">{t('settings.small')}</option>
              <option value="medium">{t('settings.medium')}</option>
              <option value="large">{t('settings.large')}</option>
            </select>
          </div>          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('language')}
            </label>            <select
              value={locale}
              onChange={(e) => {
                const newLocale = e.target.value as 'en' | 'ar' | 'tr';
                setLocale(newLocale);
                setAppearance(prev => ({ ...prev, language: newLocale }));
              }}
              aria-label="Language selection"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="tr">Türkçe</option>
            </select>
          </div>          {Object.entries({
            compactMode: t('settings.compactMode'),
            showAnimations: t('settings.showAnimations'),
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
              </label>              <button
                onClick={() => setAppearance(prev => ({ ...prev, [key]: !prev[key as keyof AppearanceSettings] }))}
                aria-label={`Toggle ${label}`}
                className={getToggleClasses(Boolean(appearance[key as keyof AppearanceSettings]))}
              >
                <span className={getToggleCircleClasses(Boolean(appearance[key as keyof AppearanceSettings]))} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAttendanceSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('settings.attendancePreferences')}</h3>
        <div className="space-y-4">          {Object.entries({
            clockInReminders: t('settings.clockInReminders'),
            clockOutReminders: t('settings.clockOutReminders'),
            breakReminders: t('settings.breakReminders'),
            overtimeAlerts: t('settings.overtimeAlerts'),
            weeklyReports: t('settings.weeklyAttendanceReports'),
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
              </label>              <button
                onClick={() => setAttendance(prev => ({ ...prev, [key]: !prev[key as keyof AttendanceSettings] }))}
                aria-label={`Toggle ${label}`}
                className={getToggleClasses(attendance[key as keyof AttendanceSettings])}
              >
                <span className={getToggleCircleClasses(attendance[key as keyof AttendanceSettings])} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('settings.securityPrivacy')}</h3>
        <div className="space-y-4">
          <div>            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('settings.sessionTimeout')}
            </label><select
              value={security.sessionTimeout}
              onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) as 15 | 30 | 60 | 120 }))}
              aria-label="Session timeout duration"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >              <option value={15}>15 {t('settings.minutes')}</option>
              <option value={30}>30 {t('settings.minutes')}</option>
              <option value={60}>1 {t('common.hours')}</option>
              <option value={120}>2 {t('common.hours')}</option>
            </select>
          </div>          {Object.entries({
            twoFactorEnabled: `${t('settings.twoFactorAuth')} (${t('settings.comingSoon')})`,
            loginNotifications: t('settings.loginNotifications'),
            deviceManagement: t('settings.deviceManagement'),
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
              </label>              <button
                onClick={() => setSecurity(prev => ({ ...prev, [key]: !prev[key as keyof SecuritySettings] }))}
                disabled={key === 'twoFactorEnabled'}
                aria-label={`Toggle ${label}`}
                className={`${getToggleClasses(Boolean(security[key as keyof SecuritySettings]))} ${
                  key === 'twoFactorEnabled' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span className={getToggleCircleClasses(Boolean(security[key as keyof SecuritySettings]))} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/30 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center mb-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />          <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">{t('settings.securityTip')}</h4>
        </div>
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          {t('settings.securityTipMessage')}
        </p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'attendance':
        return renderAttendanceSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return renderGeneralSettings();
    }
  };
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('settings.settings')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('settings.customizeExperience')}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Tab Selector */}
            <div className="lg:hidden">
              <div className="relative">
                <button
                  onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-center">
                    {(() => {
                      const currentTab = tabs.find(tab => tab.id === activeTab);
                      if (currentTab) {
                        const Icon = currentTab.icon;
                        return <Icon className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400" />;
                      }
                      return null;
                    })()}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {tabs.find(tab => tab.id === activeTab)?.name}
                    </span>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isMobileSidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isMobileSidebarOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-10 overflow-hidden">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsMobileSidebarOpen(false);
                          }}
                          className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                            activeTab === tab.id
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          {tab.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:w-64 flex-shrink-0">
              <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <ul className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <li key={tab.id}>
                        <button
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                            activeTab === tab.id
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          {tab.name}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {renderTabContent()}

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={saveSettings}
                  disabled={isLoading}
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                >                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('settings.saving')}
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      {t('settings.saveSettings')}
                    </>
                  )}
                </button>
                  <button
                  onClick={resetToDefaults}
                  className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-200 font-medium"
                >
                  {t('settings.resetToDefaults')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
