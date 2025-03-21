// Minimal fallback service worker that will be used if the main one fails
// This provides basic offline functionality when the main service worker encounters issues

const FALLBACK_CACHE = 'myfc-fallback-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  console.log('[Fallback SW] Installing minimal fallback service worker');
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(FALLBACK_CACHE).then((cache) => {
      return cache.addAll([
        OFFLINE_URL,
        '/logo.png',
        '/icons/192.png',
        '/favicon.ico',
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Fallback SW] Activating minimal fallback service worker');
  
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== FALLBACK_CACHE && key.includes('fallback')) {
          return caches.delete(key);
        }
      }));
    }).then(() => self.clients.claim())
  );
});

// Simple fetch strategy - try network first, then cache, then offline page
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  
  // Implement a simple network-first strategy for all requests
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache a copy of the response
        const responseToCache = response.clone();
        caches.open(FALLBACK_CACHE)
          .then(cache => {
            if (event.request.method === 'GET') {
              cache.put(event.request, responseToCache);
            }
          });
        return response;
      })
      .catch(async () => {
        // Try cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If the request is for a page navigation, show offline page
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        
        // For images, return a simple fallback
        if (url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
          return caches.match('/icons/192.png');
        }
        
        // Otherwise, just fail
        return new Response('Network error happened', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' },
        });
      })
  );
});

// Listen for messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 