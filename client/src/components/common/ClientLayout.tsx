'use client';

import { ReactNode, useEffect } from 'react';
import Navigation from './Navigation';
import { Toaster } from 'react-hot-toast';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  // Prevent theme flash
  useEffect(() => {
    document.documentElement.classList.add('no-transitions');
    window.requestAnimationFrame(() => {
      document.documentElement.classList.remove('no-transitions');
    });
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation />
      <main className="text-gray-900 dark:text-gray-100 p-4">{children}</main>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: '!bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-white',
          style: { transition: 'all 0.2s ease-in-out' }
        }}
      />
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
