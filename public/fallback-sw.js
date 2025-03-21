/**
 * MYFC Fallback Service Worker
 * 
 * This is a minimal service worker designed for subdomain environments
 * where stricter security rules may apply. It implements basic offline
 * functionality without dependencies.
 */

const VERSION = '1.0.0';
const CACHE_NAME = 'myfc-fallback-v1';
const OFFLINE_URL = '/offline.html';
const STATIC_ASSETS = [
  OFFLINE_URL,
  '/pwa-status.html',
  '/register-sw.html'
];

// Log helper function
function log(message) {
  console.log(`[Fallback SW ${VERSION}] ${message}`);
}

// Install event - cache essential resources
self.addEventListener('install', event => {
  log('Installing fallback service worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        log('Caching offline page and critical assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        log('Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        log(`Installation failed: ${error}`);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  log('Activating fallback service worker');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return cacheName.startsWith('myfc-fallback-') && cacheName !== CACHE_NAME;
          }).map(cacheName => {
            log(`Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        log('Activation complete');
        return self.clients.claim();
      })
      .catch(error => {
        log(`Activation error: ${error}`);
      })
  );
});

// Fetch event - provide offline fallback
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          log('Navigation request failed, returning offline page');
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }
  
  // For all other requests, try network first, then cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful GET responses
        if (event.request.method === 'GET' && response.status === 200) {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clonedResponse);
          });
        }
        return response;
      })
      .catch(() => {
        log(`Fetch failed for: ${event.request.url}, checking cache`);
        return caches.match(event.request);
      })
  );
});

// Message event - handle communication from the page
self.addEventListener('message', event => {
  log(`Received message: ${event.data.type}`);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Send service worker info to client
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: VERSION,
      type: 'fallback'
    });
  }
});

log('Fallback service worker initialized'); 