// Service Worker for MYFC PWA
const CACHE_NAME = 'myfc-app-v1';

// Files to cache
const appAssets = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/apple-touch-icon.png',
  '/icons/512.png',
  '/icons/192.png',
  '/icons/180.png',
  '/icons/152.png',
  '/icons/144.png',
  '/icons/120.png',
  '/icons/96.png',
  '/icons/72.png',
  '/icons/48.png',
  '/icons/32.png',
  '/icons/16.png',
  '/standalone.js'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...', event);
  
  // Cache all the app assets
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app assets');
        return cache.addAll(appAssets);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting on install');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...', event);
  
  // Clean up old caches
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // For navigation requests (HTML pages), always go to network first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If network fetch fails, try to serve from cache
          console.log('[Service Worker] Serving cached page on network failure');
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If found in cache, return the cached version
        if (response) {
          console.log('[Service Worker] Serving from cache:', event.request.url);
          return response;
        }
        
        // Otherwise, fetch from network
        console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // Don't cache responses for API calls
            if (
              !event.request.url.includes('/api/') && 
              event.request.method === 'GET'
            ) {
              // Clone the response to store in cache and return the original
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            
            return networkResponse;
          });
      })
      .catch(error => {
        console.error('[Service Worker] Fetch failed:', error);
        // Return a fallback response for failed image requests
        if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
          return caches.match('/icons/512.png');
        }
        
        // For all other failures, just rethrow
        throw error;
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 