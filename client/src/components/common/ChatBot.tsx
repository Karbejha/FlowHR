'use client';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/I18nContext';
import SimpleChatBot from './SimpleChatBot';

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
  const [hasError, setHasError] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    // Set a timeout to show fallback if scripts don't load within 10 seconds
    const timeout = setTimeout(() => {
      if (!isScriptLoaded) {
        console.warn('Botpress scripts taking too long to load, enabling fallback');
        setLoadingTimeout(true);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isScriptLoaded]);

  useEffect(() => {
    // Load Botpress scripts
    const loadBotpressScript = () => {
      // Load main Botpress webchat script first
      const script1 = document.createElement('script');
      script1.src = 'https://cdn.botpress.cloud/webchat/v3.0/inject.js';
      script1.async = true;
      
      script1.onload = () => {
        // Load custom configuration script after the first one loads
        const script2 = document.createElement('script');
        script2.src = 'https://files.bpcontent.cloud/2025/06/17/20/20250617205019-NMPGM146.js';
        script2.async = true;
        
        script2.onload = () => {
          // Check for window.botpress with retries
          let attempts = 0;
          const maxAttempts = 20; // Increased attempts
          
          const checkBotpress = () => {
            attempts++;
            if (window.botpress) {
              setIsScriptLoaded(true);
              // Listen for botpress events
              try {
                // Check if botpress has event listeners
                if (window.botpress.isOpened) {
                  setIsWebchatOpen(window.botpress.isOpened());
                }
              } catch (error) {
                console.warn('Error checking botpress state:', error);
              }
            } else if (attempts < maxAttempts) {
              setTimeout(checkBotpress, 250); // Reduced timeout for faster checking
            } else {
              console.error('❌ Botpress failed to initialize after maximum attempts');
            }
          };
          
          // Start checking immediately, then with delay
          setTimeout(checkBotpress, 100);
        };
        
        script2.onerror = (error) => {
          console.error('Failed to load Botpress config script:', error);
          setHasError(true);
        };
        
        document.head.appendChild(script2);
      };
      
      script1.onerror = (error) => {
        console.error('Failed to load Botpress inject script:', error);
        setHasError(true);
      };
      
      document.head.appendChild(script1);
    };

    // Only load scripts once
    if (!document.querySelector('script[src*="botpress"]')) {
      loadBotpressScript();
    } else if (window.botpress) {
      setIsScriptLoaded(true);
      if (window.botpress.isOpened) {
        setIsWebchatOpen(window.botpress.isOpened());
      }
    } else {
      // Scripts exist but botpress not ready, wait for it
      let attempts = 0;
      const maxAttempts = 20;
      
      const checkExistingBotpress = () => {
        attempts++;
        if (window.botpress) {
          setIsScriptLoaded(true);
          if (window.botpress.isOpened) {
            setIsWebchatOpen(window.botpress.isOpened());
          }
        } else if (attempts < maxAttempts) {
          setTimeout(checkExistingBotpress, 250);
        } else {
          console.error('❌ Existing botpress never became available');
        }
      };
      
      setTimeout(checkExistingBotpress, 100);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Add effect to listen for chatbot state changes
  useEffect(() => {
    if (!isScriptLoaded || !window.botpress || !window.botpress.isOpened) {
      return;
    }
    
    // Initial state check
    try {
      // Try API check first
      const currentState = window.botpress.isOpened();
      setIsWebchatOpen(currentState);
      
      // Also check DOM for visibility as a backup
      const chatbotElement = document.querySelector('.bpWidget .bpWebchat');
      if (chatbotElement) {
        const style = window.getComputedStyle(chatbotElement);
        const isVisible = style.display !== 'none' && style.visibility !== 'hidden';
        if (isVisible !== currentState) {
          // DOM state differs from API state, prefer DOM state
          setIsWebchatOpen(isVisible);
        }
      }
    } catch {
      // Silent catch
    }
    
    // Set up event listener for chatbot state changes
    const stateCheckInterval = setInterval(() => {
      try {
        // Try API check
        let currentState = false;
        if (window.botpress && window.botpress.isOpened) {
          currentState = window.botpress.isOpened();
        }
        
        // Also check DOM for visibility as a backup
        const chatbotElement = document.querySelector('.bpWidget .bpWebchat');
        if (chatbotElement) {
          const style = window.getComputedStyle(chatbotElement);
          const isVisible = style.display !== 'none' && style.visibility !== 'hidden';
          // Prefer DOM state over API state
          currentState = isVisible;
        }
        
        setIsWebchatOpen(prevState => {
          if (prevState !== currentState) {
            return currentState;
          }
          return prevState;
        });
      } catch {
        // Silent catch - don't log to avoid console spam
      }
    }, 300);
    
    return () => clearInterval(stateCheckInterval);
  }, [isScriptLoaded]); // Only depend on isScriptLoaded, not isWebchatOpen

  const toggleWebchat = () => {
    if (isScriptLoaded && window.botpress) {
      // Force a direct state change regardless of current state
      if (isWebchatOpen) {
        // If we think it's open, force close it
        try {
          window.botpress.close();
        } catch {
          console.error('Error closing chatbot');
          
          // Try direct DOM manipulation as fallback
          try {
            const chatbotElement = document.querySelector('.bpWidget .bpWebchat');
            if (chatbotElement && chatbotElement instanceof HTMLElement) {
              chatbotElement.style.display = 'none';
            }
          } catch (domError) {
            console.error('DOM fallback also failed:', domError);
          }
        }
        // Force state update regardless of API success
        setIsWebchatOpen(false);
      } else {
        // If we think it's closed, force open it
        try {
          window.botpress.open();
        } catch {
          console.error('Error opening chatbot');
          
          // Try direct DOM manipulation as fallback
          try {
            const chatbotElement = document.querySelector('.bpWidget .bpWebchat');
            if (chatbotElement && chatbotElement instanceof HTMLElement) {
              chatbotElement.style.display = 'block';
            }
          } catch (domError) {
            console.error('DOM fallback also failed:', domError);
          }
        }
        // Force state update regardless of API success
        setIsWebchatOpen(true);
      }
    } else {
      console.warn('Chatbot not ready:', { isScriptLoaded, botpress: !!window.botpress });
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleWebchat();
    }
  };

  // Show fallback chatbot if scripts fail to load or take too long
  if (hasError || loadingTimeout) {
    return <SimpleChatBot />;
  }

  return (
    <>
      {/* Custom FAB Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWebchat();
          }}
          onKeyDown={handleKeyDown}
          disabled={!isScriptLoaded}
          className={`group relative p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30 ${
            !isScriptLoaded ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title={t('chatbot.openChat') || 'Open Chat Assistant'}
          aria-label={t('chatbot.openChat') || 'Open Chat Assistant'}
          type="button"
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
              isWebchatOpen ? 'rotate-180 scale-0 opacity-0 absolute' : 'scale-100 opacity-100'
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
              isWebchatOpen ? 'scale-100 opacity-100' : 'rotate-180 scale-0 opacity-0 absolute'
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
