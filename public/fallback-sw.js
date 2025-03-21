// This is a simple fallback service worker that will be used if the main one fails
self.addEventListener('install', (event) => {
  self.skipWaiting();
  
  event.waitUntil(
    caches.open('offline-cache').then((cache) => {
      return cache.addAll([
        '/offline',
        '/icon.png',
        '/favicon.ico',
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== 'offline-cache') {
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // If both cache and network fail, serve the offline page
        return caches.match('/offline');
      });
    })
  );
}); 