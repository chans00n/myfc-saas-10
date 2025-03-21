// MYFC Service Worker - Optimized for PWA Performance
const CACHE_VERSION = 'v1';
const STATIC_CACHE = 'myfc-static-' + CACHE_VERSION;
const DYNAMIC_CACHE = 'myfc-dynamic-' + CACHE_VERSION;
const API_CACHE = 'myfc-api-' + CACHE_VERSION;
const IMAGE_CACHE = 'myfc-images-' + CACHE_VERSION;
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately - critical files
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/offline.html',
  '/apple-touch-icon.png',
  '/icons/512.png',
  '/icons/192.png',
  '/icons/180.png',
  '/icons/152.png',
  '/icons/120.png',
  '/logo.png',
  '/logo_white.png',
  '/standalone.js'
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing optimized service worker');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[Service Worker] Caching critical assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Create other caches
      caches.open(DYNAMIC_CACHE),
      caches.open(API_CACHE),
      caches.open(IMAGE_CACHE)
    ])
    .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating optimized service worker');
  
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(keyList.map(key => {
          if (
            !key.endsWith(CACHE_VERSION) && 
            (key.startsWith('myfc-static-') || 
             key.startsWith('myfc-dynamic-') || 
             key.startsWith('myfc-api-') ||
             key.startsWith('myfc-images-'))
          ) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
      .then(() => self.clients.claim())
  );
});

// Helper function to determine caching strategy by URL
function getCacheStrategy(url) {
  const { pathname } = new URL(url);
  
  // API responses - stale-while-revalidate with short TTL
  if (pathname.includes('/api/')) {
    return {
      strategy: 'stale-while-revalidate',
      cache: API_CACHE,
      expiration: 5 * 60 * 1000 // 5 minutes
    };
  }
  
  // Images - cache-first with longer TTL
  if (
    pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)$/) ||
    pathname.includes('/icons/') ||
    pathname.startsWith('/apple-touch-icon')
  ) {
    return {
      strategy: 'cache-first',
      cache: IMAGE_CACHE,
      expiration: 7 * 24 * 60 * 60 * 1000 // 1 week
    };
  }
  
  // Static assets - cache-first
  if (
    pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/) ||
    pathname.includes('/_next/static/')
  ) {
    return {
      strategy: 'cache-first',
      cache: STATIC_CACHE
    };
  }
  
  // HTML pages - network-first
  return {
    strategy: 'network-first',
    cache: DYNAMIC_CACHE
  };
}

// Check if a cached response has expired
function hasExpired(response, expirationTime) {
  if (!expirationTime) return false;
  
  const cachedTime = response.headers.get('sw-cached-on');
  if (!cachedTime) return false;
  
  return (Date.now() - parseInt(cachedTime, 10)) > expirationTime;
}

// Cache a response with a timestamp
async function cacheWithTimestamp(cache, request, response, cloneResponse = true) {
  if (!response || !response.ok) return response;
  
  const resClone = cloneResponse ? response.clone() : response;
  const headers = new Headers(resClone.headers);
  headers.append('sw-cached-on', Date.now().toString());
  
  const init = {
    status: resClone.status,
    statusText: resClone.statusText,
    headers
  };
  
  try {
    const body = await resClone.blob();
    const timestampedResponse = new Response(body, init);
    await cache.put(request, timestampedResponse);
  } catch (err) {
    console.error('[Service Worker] Cache write error:', err);
  }
  
  return response;
}

// Fetch event with appropriate caching strategies
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return;
  
  // Skip Stripe-related URLs
  if (url.hostname.includes('stripe.com')) return;
  
  // Get appropriate caching strategy
  const { strategy, cache: cacheName, expiration } = getCacheStrategy(event.request.url);
  
  // Implement cache strategies
  if (strategy === 'cache-first') {
    // Cache First for static assets and images
    event.respondWith(
      caches.open(cacheName)
        .then(cache => {
          return cache.match(event.request)
            .then(cachedResponse => {
              // If in cache and not expired, use it
              if (cachedResponse && !hasExpired(cachedResponse, expiration)) {
                return cachedResponse;
              }
              
              // Otherwise fetch from network
              return fetch(event.request)
                .then(networkResponse => {
                  return cacheWithTimestamp(cache, event.request, networkResponse);
                })
                .catch(error => {
                  console.error('[Service Worker] Fetch error:', error);
                  
                  // If it's an image, try to return a fallback
                  if (url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)$/)) {
                    return caches.match('/icons/192.png');
                  }
                  
                  throw error;
                });
            });
        })
    );
  } else if (strategy === 'stale-while-revalidate') {
    // Stale-while-revalidate for API responses
    event.respondWith(
      caches.open(cacheName)
        .then(cache => {
          return cache.match(event.request)
            .then(cachedResponse => {
              const fetchPromise = fetch(event.request)
                .then(networkResponse => {
                  return cacheWithTimestamp(cache, event.request, networkResponse);
                })
                .catch(() => {
                  console.log('[Service Worker] Failed to update API cache');
                  // If fetch fails, we still have the cached version
                });
              
              // Return the cached response immediately, but update cache in background
              if (cachedResponse && !hasExpired(cachedResponse, expiration)) {
                fetchPromise.catch(() => console.log('Background fetch failed'));
                return cachedResponse;
              }
              
              // No valid cache, wait for the network response
              return fetchPromise;
            });
        })
        .catch(() => {
          // Last resort - if all caching mechanisms fail
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          return null;
        })
    );
  } else {
    // Network First for HTML and other resources
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Also cache the successful response
          caches.open(cacheName).then(cache => {
            cacheWithTimestamp(cache, event.request, networkResponse.clone(), false);
          });
          return networkResponse;
        })
        .catch(() => {
          // If network fails, try the cache
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Return offline page for navigation requests
              if (event.request.mode === 'navigate') {
                return caches.match(OFFLINE_URL);
              }
              
              return null;
            });
        })
    );
  }
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.startsWith('myfc-')) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
}); 