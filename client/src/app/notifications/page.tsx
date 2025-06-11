'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/I18nContext';
import AuthGuard from '@/components/auth/AuthGuard';
import { Notification, NotificationType } from '@/types/notification';
import api from '@/lib/api';
import Link from 'next/link';
import { Bell, Check, Trash2, Eye } from 'lucide-react';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | NotificationType>('all');

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev =>
        prev.filter(notification => notification._id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.LEAVE_REQUEST:
        return (
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case NotificationType.LEAVE_APPROVED:
        return (
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case NotificationType.LEAVE_REJECTED:
        return (
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case NotificationType.ATTENDANCE_REMINDER:
        return (
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case NotificationType.SYSTEM_UPDATE:
        return (
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-gray-500" />
          </div>
        );
    }
  };
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return t('notifications.justNow');
    if (diffInSeconds < 3600) return t('notifications.minutesAgo', { count: Math.floor(diffInSeconds / 60) });
    if (diffInSeconds < 86400) return t('notifications.hoursAgo', { count: Math.floor(diffInSeconds / 3600) });
    if (diffInSeconds < 604800) return t('notifications.daysAgo', { count: Math.floor(diffInSeconds / 86400) });
    
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-white" />
                </div>                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {t('notifications.notifications')}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {unreadCount > 0 ? `${unreadCount} ${t('notifications.unread').toLowerCase()}` : t('notifications.noNotifications')}
                  </p>
                </div>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('notifications.markAllAsRead')}</span>
                </button>
              )}
            </div>            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all' as const, label: t('notifications.filters.all') },
                { value: 'unread' as const, label: t('notifications.filters.unread') },
                { value: NotificationType.LEAVE_REQUEST, label: t('leave.leaveRequests') },
                { value: NotificationType.LEAVE_APPROVED, label: t('notifications.filters.leaveApproved') },
                { value: NotificationType.LEAVE_REJECTED, label: t('notifications.filters.leaveRejected') },
                { value: NotificationType.ATTENDANCE_REMINDER, label: t('notifications.filters.attendanceReminder') },
                { value: NotificationType.SYSTEM_UPDATE, label: t('notifications.filters.systemUpdate') },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                    filter === value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">{t('notifications.loading')}</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center p-12">
                <Bell className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {filter === 'all' ? t('notifications.noNotifications') : t('notifications.noFilteredNotifications', { filter: t(`notifications.filters.${filter}`) })}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${
                      !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {getNotificationIcon(notification.type)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                              {notification.title}
                            </h3>                            <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
                              <span>{formatTimeAgo(notification.createdAt)}</span>
                              {!notification.isRead && (
                                <span className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  <span>{t('notifications.unread')}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                                title={t('notifications.markAsRead')}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification._id)}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                              title={t('notifications.deleteNotification')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {notification.actionUrl && (
                          <div className="mt-4">
                            <Link
                              href={notification.actionUrl}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                            >
                              {t('common.view')} {t('common.details')}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
