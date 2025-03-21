"use client";

import { useEffect } from 'react';

export function ServiceWorkerRegistry() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          // Check if we're on a subdomain
          const hostname = window.location.hostname;
          const isSubdomain = hostname.split('.').length > 2;
          
          console.log(`[PWA] Running on ${hostname}, subdomain: ${isSubdomain}`);
          
          // Choose the appropriate service worker based on environment
          const swPath = isSubdomain ? '/root-sw.js' : '/sw.js';
          const initialScope = '/';
          
          console.log(`[PWA] Attempting to register service worker from ${swPath} with scope ${initialScope}`);
          
          try {
            // Try to register with the primary service worker and root scope
            const registration = await navigator.serviceWorker.register(swPath, {
              scope: initialScope,
              updateViaCache: 'none' // Prevent the browser from using cached versions
            });
            
            console.log(`[PWA] Service worker registered successfully with scope: ${registration.scope}`);
            
            // Listen for new service workers and notify the user
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              
              if (!newWorker) return;
              
              console.log('[PWA] New service worker is being installed');
              
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New service worker available, refresh to update');
                  
                  // Show notification to the user about the update
                  if (window.confirm('A new version of the app is available. Refresh to update?')) {
                    window.location.reload();
                  }
                }
              });
            });
          } catch (primaryError) {
            console.error(`[PWA] Primary service worker registration failed: ${primaryError}`);
            
            // If the primary registration failed, try with different scopes
            const fallbackScopes = ['/', '/app/', window.location.pathname];
            
            for (const scope of fallbackScopes) {
              try {
                console.log(`[PWA] Trying to register with scope: ${scope}`);
                const registration = await navigator.serviceWorker.register(swPath, {
                  scope: scope,
                  updateViaCache: 'none'
                });
                
                console.log(`[PWA] Service worker registered with fallback scope: ${registration.scope}`);
                return; // Exit if successful
              } catch (scopeError) {
                console.error(`[PWA] Registration with scope ${scope} failed: ${scopeError}`);
              }
            }
            
            // If all attempts with primary service worker failed, try the fallback service worker
            try {
              console.log('[PWA] Trying fallback service worker');
              const fallbackRegistration = await navigator.serviceWorker.register('/fallback-sw.js', {
                scope: '/',
                updateViaCache: 'none'
              });
              
              console.log(`[PWA] Fallback service worker registered with scope: ${fallbackRegistration.scope}`);
            } catch (fallbackError) {
              console.error(`[PWA] Fallback service worker registration also failed: ${fallbackError}`);
              console.log('[PWA] Service worker registration failed completely');
            }
          }
        } catch (error) {
          console.error('[PWA] Service worker registration error:', error);
        }
      };

      // Register the service worker when the app loads
      registerServiceWorker();
      
      // Set up online/offline status handling
      const handleOnlineStatus = () => {
        const isOnline = navigator.onLine;
        console.log(`[PWA] Network status changed. Online: ${isOnline}`);
        
        // Notify the service worker about the connection status change
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'ONLINE_STATUS_CHANGE',
            isOnline
          });
        }
        
        // Optionally show a toast notification to the user
        if (!isOnline) {
          // You can implement a toast component here
          console.log('[PWA] You are offline. The app will continue to work with limited functionality.');
        } else {
          console.log('[PWA] You are back online.');
        }
      };
      
      // Listen for online/offline events
      window.addEventListener('online', handleOnlineStatus);
      window.addEventListener('offline', handleOnlineStatus);
      
      // Initial check
      handleOnlineStatus();
      
      // Cleanup listeners on component unmount
      return () => {
        window.removeEventListener('online', handleOnlineStatus);
        window.removeEventListener('offline', handleOnlineStatus);
      };
    }
  }, []);

  return null; // This component doesn't render anything
} 