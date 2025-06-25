'use client';

import { ReactNode, useEffect } from 'react';
import Navigation from './Navigation';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from '@/contexts/I18nContext';
import ChatBot from './ChatBot';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { isRTL } = useTranslation();
  
  // Apply RTL direction and prevent theme flash
  useEffect(() => {
    document.documentElement.classList.add('no-transitions');
    
    // Apply RTL direction
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    
    // Mobile-specific optimizations for Capacitor
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
    }
      // Prevent default touch behaviors that might interfere with Capacitor
    document.addEventListener('touchstart', () => {
      // Allow normal touch behavior
    }, { passive: true });
    
    // Add safe area CSS variables for iOS notch support
    const root = document.documentElement;
    root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top, 0px)');
    root.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom, 0px)');
    root.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left, 0px)');
    root.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right, 0px)');
      window.requestAnimationFrame(() => {
      document.documentElement.classList.remove('no-transitions');
    });
  }, [isRTL]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
      <Navigation />
      <main className="text-gray-900 dark:text-gray-100 pb-safe">
        {children}
      </main>      <Toaster 
        position="top-center"
        containerClassName=""
        containerStyle={{
          zIndex: 99999,
        }}
        toastOptions={{
          className: '!bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-white !shadow-lg',
          style: { 
            transition: 'all 0.2s ease-in-out',
            fontSize: '14px',
            padding: '12px 16px',
            borderRadius: '8px',
            maxWidth: '90vw',
            zIndex: 99999,
          },
          duration: 3000,
          success: {
            style: {
              background: 'rgb(34, 197, 94)',
              color: 'white',
              zIndex: 99999,
            },
          },
          error: {
            style: {
              background: 'rgb(239, 68, 68)',
              color: 'white',
              zIndex: 99999,
            },
          },
        }}
      />
      
      {/* ChatBot component - available on all pages */}
      <ChatBot />
      
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              function getTheme() {
                if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
                  return localStorage.getItem('theme');
                }
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  return 'dark';
                }
                return 'light';
              }
              document.documentElement.classList.add(getTheme());
            })()
          `,
        }}
      />
    </div>
  );
}
