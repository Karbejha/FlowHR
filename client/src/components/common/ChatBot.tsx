'use client';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/I18nContext';

declare global {
  interface Window {
    botpress: {
      open: () => void;
      close: () => void;
      toggle: () => void;
      isOpened: () => boolean;
    };
  }
}

export default function ChatBot() {
  const { t } = useTranslation();
  const [isWebchatOpen, setIsWebchatOpen] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Botpress scripts
    const loadBotpressScript = () => {
      // Load main Botpress webchat script
      const script1 = document.createElement('script');
      script1.src = 'https://cdn.botpress.cloud/webchat/v3.0/inject.js';
      script1.async = true;
      document.head.appendChild(script1);

      // Load custom configuration script
      const script2 = document.createElement('script');
      script2.src = 'https://files.bpcontent.cloud/2025/06/17/20/20250617205019-NMPGM146.js';
      script2.async = true;
      document.head.appendChild(script2);

      // Initialize when ready
      script2.onload = () => {
        setTimeout(() => {
          if (window.botpress) {
            setIsScriptLoaded(true);
          }
        }, 1000);
      };
    };

    // Only load scripts once
    if (!document.querySelector('script[src*="botpress"]')) {
      loadBotpressScript();
    } else if (window.botpress) {
      setIsScriptLoaded(true);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  const toggleWebchat = () => {
    if (isScriptLoaded && window.botpress) {
      if (isWebchatOpen) {
        window.botpress.close();
      } else {
        window.botpress.open();
      }
      setIsWebchatOpen(!isWebchatOpen);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleWebchat();
    }
  };

  return (
    <>
      {/* Custom FAB Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleWebchat}
          onKeyDown={handleKeyDown}
          disabled={!isScriptLoaded}
          className={`group relative p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30 ${
            !isScriptLoaded ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title={t('chatbot.openChat') || 'Open Chat Assistant'}
          aria-label={t('chatbot.openChat') || 'Open Chat Assistant'}
        >
          {/* Loading indicator */}
          {!isScriptLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Chat Icon when closed */}
          <svg 
            className={`w-6 h-6 transition-all duration-300 ${
              !isScriptLoaded ? 'opacity-0' : 
              isWebchatOpen ? 'rotate-180 opacity-0 absolute' : 'opacity-100'
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          
          {/* Close Icon when open */}
          <svg 
            className={`w-6 h-6 transition-all duration-300 ${
              !isScriptLoaded ? 'opacity-0' :
              isWebchatOpen ? 'opacity-100' : 'rotate-180 opacity-0 absolute'
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>

          {/* Notification dot (appears when chat is available) */}
          {isScriptLoaded && !isWebchatOpen && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          )}
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            {!isScriptLoaded ? 'Loading...' :
             isWebchatOpen ? t('chatbot.closeChat') || 'Close Chat' : 
             t('chatbot.openChat') || 'Open HR Assistant'}
          </div>
        </button>
      </div>

      {/* Hide the default Botpress FAB */}
      <style jsx global>{`
        .bpFab {
          display: none !important;
        }
        
        .bpWidget {
          z-index: 9999 !important;
        }
        
        .bpWidget .bpWebchat {
          border-radius: 12px !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
          border: 1px solid rgba(229, 231, 235, 0.8) !important;
        }
        
        @media (max-width: 768px) {
          .bpWidget .bpWebchat {
            width: calc(100vw - 2rem) !important;
            height: calc(100vh - 8rem) !important;
            right: 1rem !important;
            bottom: 6rem !important;
          }
        }
      `}</style>
    </>
  );
}
