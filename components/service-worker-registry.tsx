'use client';

import { useEffect } from 'react';

// Extend Window interface to include workbox
declare global {
  interface Window {
    workbox?: {
      addEventListener: (event: string, callback: (event?: any) => void) => void;
      register: () => void;
    };
  }
}

export function ServiceWorkerRegistry() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox;
      
      // Add event listeners for installation and updates
      wb.addEventListener('installed', (event) => {
        console.log(`Service Worker installed: ${event.type}`);
      });

      wb.addEventListener('waiting', () => {
        console.log('Service Worker waiting to be activated');
      });

      wb.addEventListener('activated', (event) => {
        console.log(`Service Worker activated: ${event.type}`);
      });

      // Start the service worker
      wb.register();
    }
  }, []);

  return null;
} 