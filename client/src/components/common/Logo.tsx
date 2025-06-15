'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return (
      <div className="relative h-9 px-3 opacity-0">
        {/* Placeholder during SSR */}
      </div>
    );
  }  
  return (
    <Link href="/" className={`flex items-center hover:opacity-90 transition-opacity ${className}`}>
      <div className={`px-3 py-1.5 rounded-md ${isDark ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-900/10 to-gray-800'} border border-gray-700 shadow-lg`}>
        <div className="flex items-center">
          {/* Custom FlowHR wave logo */}
          <div className="relative mr-2">
            <div className="relative w-6 h-6">
              {/* First wave */}
              <div className={`absolute inset-x-0 top-1 h-1 ${isDark ? 'bg-blue-400' : 'bg-blue-500'} rounded-full opacity-70`}></div>
              
              {/* Second wave */}
              <div className={`absolute inset-x-0 top-3 h-1 ${isDark ? 'bg-blue-300' : 'bg-blue-400'} rounded-full opacity-80`}></div>
              
              {/* Third wave */}
              <div className={`absolute inset-x-0 top-5 h-1 ${isDark ? 'bg-blue-200' : 'bg-blue-300'} rounded-full`}></div>
              
              {/* Animated dot */}
              <div className={`absolute -right-0.5 -bottom-0.5 w-2 h-2 rounded-full ${isDark ? 'bg-blue-300' : 'bg-blue-400'} animate-pulse`}></div>
            </div>
          </div>
          
          <div className="text-white text-lg font-bold tracking-wide select-none flex items-center">
            <span className={isDark ? "text-blue-300 mr-0.5" : "text-blue-400 mr-0.5"}>Flow</span>
            <span className="text-white">HR</span>
            <span className={`ml-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-300'}`}></span>
          </div>
        </div>
      </div>
    </Link>
  );
}
