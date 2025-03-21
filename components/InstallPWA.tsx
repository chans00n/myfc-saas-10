'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Add type definition for standalone property on navigator
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    // Check if it's an iOS device
    const isIOS = 
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOSDevice(isIOS);

    // Always show for iOS devices
    if (isIOS) {
      setShowInstallButton(true);
      
      // Check if we're running in standalone mode
      if (window.navigator.standalone === true) {
        setShowInstallButton(false);
      }
    }

    // Listen for beforeinstallprompt event (fired on Chrome/Edge/Android before install prompt)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome from automatically showing the prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
      // Show the install button
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We no longer need the prompt, clear it
    setDeferredPrompt(null);
    
    // Hide the install button
    setShowInstallButton(false);
  };

  // Don't render anything if there's no install prompt to show
  if (!showInstallButton) return null;

  return (
    <div className="fixed bottom-20 inset-x-0 z-50 px-4">
      <div className="max-w-md mx-auto bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="ml-3 w-0 flex-1">
              {isIOSDevice ? (
                <>
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Install this app on your iPhone/iPad
                  </h3>
                  <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <ol className="space-y-2 list-decimal pl-5">
                      <li>Tap the share button <span className="inline-block">
                        <svg className="h-5 w-5 inline" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M15 8a3 3 0 10-2.977-2.63c-0.68.003-1.444.573-1.879 1.482l-4.741 1.582a3 3 0 100 4.132l4.741 1.582c.436.91 1.2 1.479 1.879 1.482A3 3 0 1015 13a2.997 2.997 0 00-1.977-.716L8.281 10.7c.005-.067.019-.134.019-.203a3.12 3.12 0 00-.019-.203l5.742-1.582A2.997 2.997 0 0015 8z" />
                        </svg>
                      </span> at the bottom of screen</li>
                      <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
                      <li>Tap <strong>Add</strong> in the top right</li>
                      <li>The app will now appear on your home screen</li>
                    </ol>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-col items-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        For a full app experience, launch directly from your home screen icon, not from your browser.
                      </p>
                      <Link 
                        href="/ios-redirect.html" 
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Use Installation Page
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Install this app for easier access
                  </h3>
                  <div className="mt-2">
                    <button
                      onClick={handleInstallClick}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Install App
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => setShowInstallButton(false)}
                className="bg-white dark:bg-neutral-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 