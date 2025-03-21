// Root service worker for subdomain support
// This is a lightweight service worker that acts as an entry point

// Set proper scope
self.scope = self.registration ? self.registration.scope : self.location.origin;
console.log('[Root SW] Starting with scope:', self.scope);

// Load the main service worker implementation
try {
  console.log('[Root SW] Importing main service worker implementation');
  self.importScripts('./sw.js');
} catch (error) {
  console.error('[Root SW] Failed to import main service worker:', error);
  
  // Basic fallback functionality if main SW import fails
  self.addEventListener('install', (event) => {
    console.log('[Root SW] Fallback install handler activated');
    self.skipWaiting();
  });
  
  self.addEventListener('activate', (event) => {
    console.log('[Root SW] Fallback activate handler activated');
    event.waitUntil(self.clients.claim());
  });
  
  self.addEventListener('fetch', (event) => {
    // Very basic fetch handler that just passes through to network
    // with a fallback to offline page if available
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request).catch(() => {
          return caches.match('/offline.html')
            .catch(() => new Response('Offline - Service Worker Error', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            }));
        })
      );
    }
  });
} 