// MYFC Service Worker - Optimized for PWA Performance
const CACHE_VERSION = 'v3';
const STATIC_CACHE = 'myfc-static-' + CACHE_VERSION;
const DYNAMIC_CACHE = 'myfc-dynamic-' + CACHE_VERSION;
const API_CACHE = 'myfc-api-' + CACHE_VERSION;
const IMAGE_CACHE = 'myfc-images-' + CACHE_VERSION;
const OFFLINE_URL = './offline.html';

// Make sure we have the scope
const SCOPE = self.registration ? self.registration.scope : self.location.origin;
const IS_SUBDOMAIN = new URL(SCOPE).hostname === 'members.myfc.app';

console.log('[Service Worker] Initializing with scope:', SCOPE);
console.log('[Service Worker] Is subdomain:', IS_SUBDOMAIN);

// Assets to cache immediately - critical files
const STATIC_ASSETS = [
  './',
  './dashboard',
  './manifest.json',
  './offline.html',
  './pwa-status.html',
  './apple-touch-icon.png',
  './icons/512.png',
  './icons/192.png',
  './icons/180.png',
  './icons/152.png',
  './icons/120.png',
  './logo.png',
  './logo_white.png',
  './standalone.js'
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing optimized service worker with scope:', SCOPE);
  
  // Skip waiting to become active immediately
  self.skipWaiting();
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[Service Worker] Caching critical assets:', STATIC_ASSETS);
        return cache.addAll(STATIC_ASSETS)
          .then(() => console.log('[Service Worker] Successfully cached assets'))
          .catch(err => {
            console.error('[Service Worker] Failed to cache assets:', err);
            // Try caching assets one by one to identify problematic ones
            return Promise.allSettled(
              STATIC_ASSETS.map(asset => 
                cache.add(asset)
                  .then(() => console.log('[SW] Cached:', asset))
                  .catch(e => console.error('[SW] Failed to cache:', asset, e))
              )
            );
          });
      }),
      // Create other caches
      caches.open(DYNAMIC_CACHE),
      caches.open(API_CACHE),
      caches.open(IMAGE_CACHE)
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating optimized service worker with scope:', SCOPE);
  
  // Claim clients immediately
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
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
      .catch(err => console.error('[Service Worker] Activate error:', err))
  );
});

// Helper function to determine caching strategy by URL
function getCacheStrategy(url) {
  try {
    // Convert relative URLs to absolute using scope
    const parsedUrl = new URL(url, SCOPE);
    const { pathname } = parsedUrl;
    
    // Special handling for diagnostic page
    if (pathname.endsWith('/pwa-status.html')) {
      return {
        strategy: 'network-first',
        cache: DYNAMIC_CACHE
      };
    }
    
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
  } catch (e) {
    console.error('[SW] Error parsing URL:', url, e);
    return { strategy: 'network-first', cache: DYNAMIC_CACHE };
  }
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
  
  try {
    const resClone = cloneResponse ? response.clone() : response;
    const headers = new Headers(resClone.headers);
    headers.append('sw-cached-on', Date.now().toString());
    
    const init = {
      status: resClone.status,
      statusText: resClone.statusText,
      headers
    };
    
    const body = await resClone.blob();
    const timestampedResponse = new Response(body, init);
    await cache.put(request, timestampedResponse);
    console.log('[SW] Cached response for:', request.url);
  } catch (err) {
    console.error('[Service Worker] Cache write error:', err, 'for URL:', request.url);
  }
  
  return response;
}

// Fetch event with appropriate caching strategies
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests
  if (event.request.method !== 'GET') return;
  
  try {
    const url = new URL(event.request.url);
    
    // Handle diagnostic page specially
    if (url.pathname.endsWith('/pwa-status.html')) {
      event.respondWith(fetch(event.request));
      return;
    }
    
    // Skip cross-origin requests
    if (url.origin !== self.location.origin) return;
    
    // Skip Stripe-related URLs
    if (url.hostname.includes('stripe.com')) return;
    
    // Get appropriate caching strategy
    const { strategy, cache: cacheName, expiration } = getCacheStrategy(event.request.url);
    console.log(`[SW] Handling ${strategy} for ${event.request.url}`);
    
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
                  console.log('[SW] Serving from cache:', event.request.url);
                  return cachedResponse;
                }
                
                // Otherwise fetch from network
                console.log('[SW] Not in cache, fetching:', event.request.url);
                return fetch(event.request)
                  .then(networkResponse => {
                    return cacheWithTimestamp(cache, event.request, networkResponse);
                  })
                  .catch(error => {
                    console.error('[Service Worker] Fetch error:', error, 'for URL:', event.request.url);
                    
                    // If it's an image, try to return a fallback
                    if (url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|avif)$/)) {
                      return caches.match('./icons/192.png');
                    }
                    
                    throw error;
                  });
              });
          })
          .catch(err => {
            console.error('[SW] Cache-first strategy error:', err, 'for URL:', event.request.url);
            return fetch(event.request);
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
                  .catch((err) => {
                    console.log('[Service Worker] Failed to update API cache:', err);
                    // If fetch fails, we still have the cached version
                  });
                
                // Return the cached response immediately, but update cache in background
                if (cachedResponse && !hasExpired(cachedResponse, expiration)) {
                  console.log('[SW] Serving stale response while revalidating:', event.request.url);
                  fetchPromise.catch(() => console.log('Background fetch failed'));
                  return cachedResponse;
                }
                
                // No valid cache, wait for the network response
                console.log('[SW] No cache, waiting for network:', event.request.url);
                return fetchPromise;
              });
          })
          .catch((err) => {
            console.error('[SW] Stale-while-revalidate error:', err, 'for URL:', event.request.url);
            
            // Last resort - if all caching mechanisms fail
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            return fetch(event.request);
          })
      );
    } else {
      // Network First for HTML and other resources
      event.respondWith(
        fetch(event.request)
          .then(networkResponse => {
            console.log('[SW] Network-first success for:', event.request.url);
            // Also cache the successful response
            caches.open(cacheName).then(cache => {
              cacheWithTimestamp(cache, event.request, networkResponse.clone(), false);
            });
            return networkResponse;
          })
          .catch((err) => {
            console.log('[SW] Network failed, trying cache:', event.request.url, err);
            // If network fails, try the cache
            return caches.match(event.request)
              .then(cachedResponse => {
                if (cachedResponse) {
                  console.log('[SW] Serving from cache after network failure:', event.request.url);
                  return cachedResponse;
                }
                
                console.log('[SW] No cache entry after network failure, serving offline page');
                // Return offline page for navigation requests
                if (event.request.mode === 'navigate') {
                  return caches.match(OFFLINE_URL)
                    .then(offlineResponse => {
                      if (offlineResponse) {
                        return offlineResponse;
                      }
                      console.error('[SW] Even offline page not found!');
                      return new Response('Network error and offline page not found', { 
                        status: 503,
                        headers: { 'Content-Type': 'text/plain' }
                      });
                    });
                }
                
                return null;
              });
          })
      );
    }
  } catch (err) {
    console.error('[SW] Fatal error in fetch handler:', err);
    // Don't break the fetch
    return;
  }
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  console.log('[SW] Received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        console.log('[SW] Clearing all caches:', cacheNames);
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.startsWith('myfc-')) {
              return caches.delete(cacheName)
                .then(() => console.log('[SW] Successfully deleted cache:', cacheName))
                .catch(err => console.error('[SW] Failed to delete cache:', cacheName, err));
            }
          })
        );
      })
    );
  }
  
  if (event.data && event.data.type === 'ONLINE_STATUS') {
    console.log('[SW] Online status changed to:', event.data.status);
  }
}); 