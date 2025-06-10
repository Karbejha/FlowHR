'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Notification, NotificationSummary, NotificationType } from '../../types/notification';
import api from '../../lib/api';
import Link from 'next/link';
import { Bell, BellRing } from 'lucide-react';

export default function NotificationDropdown() {  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await api.get<NotificationSummary>('/notifications');
        setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread || 0);    } catch {
      // Error handling for notification fetch
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);
  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!isAuthenticated) return;
    
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
        setUnreadCount(prev => Math.max(0, prev - 1));    } catch {
      // Error handling for marking notification as read
    }
  };
  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!isAuthenticated) return;
    
    try {
      await api.patch('/notifications/mark-all-read');
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))      );
      setUnreadCount(0);    } catch {
      // Error handling for marking all notifications as read
    }
  };  // Fetch notifications on component mount and when dropdown opens
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchNotifications();
    }
  }, [isOpen, isAuthenticated, fetchNotifications]);

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    if (notification.actionUrl) {
      setIsOpen(false);
    }
  };
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
        aria-label="Notifications"
      >
        <div className="relative">
          {unreadCount > 0 ? (
            <BellRing className="w-6 h-6 text-blue-400 dark:text-blue-300 animate-pulse" />
          ) : (
            <Bell className="w-6 h-6 text-gray-400 dark:text-gray-500" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -bottom-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>            ) : notifications.length === 0 ? (
              <div className="text-center p-8">
                <Bell className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`relative p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  {notification.actionUrl ? (
                    <Link href={notification.actionUrl} className="block">
                      <NotificationContent notification={notification} />
                    </Link>
                  ) : (
                    <NotificationContent notification={notification} />
                  )}
                  
                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Notification content component
function NotificationContent({ notification }: { notification: Notification }) {
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.LEAVE_REQUEST:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case NotificationType.LEAVE_APPROVED:
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case NotificationType.LEAVE_REJECTED:
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case NotificationType.ATTENDANCE_REMINDER:
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case NotificationType.SYSTEM_UPDATE:
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 mt-1">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          {notification.title}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
          {notification.message}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {formatTimeAgo(notification.createdAt)}
        </p>
      </div>
    </div>
  );
}
