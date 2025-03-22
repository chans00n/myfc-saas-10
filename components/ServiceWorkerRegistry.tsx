"use client";

import { useEffect } from 'react';

export function ServiceWorkerRegistry() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          console.log('[PWA] Registering service worker');
          
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          });
          
          console.log('[PWA] Service worker registered with scope:', registration.scope);
          
          // Check for updates when the page loads
          registration.update().catch(err => console.error('[PWA] Update check failed:', err));
          
        } catch (error) {
          console.error('[PWA] Service worker registration failed:', error);
          
          // Try fallback service worker as a last resort
          try {
            console.log('[PWA] Trying fallback service worker');
            const fallbackReg = await navigator.serviceWorker.register('/fallback-sw.js');
            console.log('[PWA] Fallback service worker registered');
          } catch (fallbackError) {
            console.error('[PWA] Fallback service worker also failed:', fallbackError);
          }
        }
      };

      // Register service worker
      registerServiceWorker();
      
      // Handle online/offline events
      const updateOnlineStatus = () => {
        const isOnline = navigator.onLine;
        console.log(`[PWA] Network ${isOnline ? 'online' : 'offline'}`);
        
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'ONLINE_STATUS',
            online: isOnline
          });
        }
      };
      
      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      
      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      };
    }
  }, []);

  return null;
} 