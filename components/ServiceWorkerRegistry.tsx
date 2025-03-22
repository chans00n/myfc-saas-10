"use client";

import { useEffect } from 'react';

export function ServiceWorkerRegistry() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          // Check if we're on the members.myfc.app subdomain
          const hostname = window.location.hostname;
          const isMembersSubdomain = hostname === 'members.myfc.app';
          
          console.log(`[PWA] Running on ${hostname}, subdomain: ${isMembersSubdomain ? 'members.myfc.app' : 'no'}`);
          
          // Choose appropriate service worker path and scope
          const swPath = isMembersSubdomain ? './sw.js' : '/sw.js';
          const swScope = isMembersSubdomain ? './' : '/';
          
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
          
          // Try fallback service worker as a last resort
          try {
            const hostname = window.location.hostname;
            const isMembersSubdomain = hostname === 'members.myfc.app';
            const fallbackPath = isMembersSubdomain ? './fallback-sw.js' : '/fallback-sw.js';
            const fallbackScope = isMembersSubdomain ? './' : '/';
            
            console.log(`[PWA] Trying fallback service worker from ${fallbackPath}`);
            const fallbackReg = await navigator.serviceWorker.register(fallbackPath, {
              scope: fallbackScope
            });
            console.log('[PWA] Fallback service worker registered with scope:', fallbackReg.scope);
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