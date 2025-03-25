"use client";

import { useEffect } from 'react';

// Enable service worker for push notifications
const DISABLE_SERVICE_WORKER = false;

export function ServiceWorkerRegistry() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // If service worker is disabled, unregister any existing ones
      if (DISABLE_SERVICE_WORKER) {
        console.log('[PWA] Service worker disabled for debugging. Unregistering existing workers.');
        
        navigator.serviceWorker.getRegistrations().then(registrations => {
          for (let registration of registrations) {
            registration.unregister().then(() => {
              console.log('[PWA] Service worker unregistered successfully');
            }).catch(error => {
              console.error('[PWA] Error unregistering service worker:', error);
            });
          }
        });
        
        return; // Don't proceed with registration
      }
      
      // Disable the Workbox development logs
      if (typeof window !== 'undefined') {
        // @ts-ignore - Workbox specific property
        self.__WB_DISABLE_DEV_LOGS = true;
      }
      
      const registerServiceWorker = async () => {
        try {
          // Get the current hostname to determine if we're on the members subdomain
          const hostname = window.location.hostname;
          const isMembersSubdomain = hostname.includes('members.myfc.app');
          
          console.log(`[PWA] Running on ${hostname}, subdomain: ${isMembersSubdomain ? 'members.myfc.app' : 'no'}`);
          
          // Service worker path and scope
          const swPath = '/sw.js';
          const swScope = '/';
          
          console.log(`[PWA] Registering service worker from ${swPath} with scope ${swScope}`);
          
          const registration = await navigator.serviceWorker.register(swPath, {
            scope: swScope,
            updateViaCache: 'none'
          });
          
          console.log('[PWA] Service worker registered with scope:', registration.scope);
          
          // Check for updates when the page loads
          registration.update().catch(err => console.error('[PWA] Update check failed:', err));
          
        } catch (error) {
          console.error('[PWA] Service worker registration failed:', error);
          
          // If the main registration fails, try a fallback
          try {
            const fallbackPath = '/sw-fallback.js';
            console.log(`[PWA] Trying fallback service worker from ${fallbackPath}`);
            
            const fallbackReg = await navigator.serviceWorker.register(fallbackPath);
            console.log('[PWA] Fallback service worker registered with scope:', fallbackReg.scope);
          } catch (fallbackError) {
            console.error('[PWA] Fallback service worker registration also failed:', fallbackError);
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