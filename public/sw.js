// Service Worker for caching and offline support
const CACHE_NAME = 'meal-app-v1';
const STATIC_CACHE_NAME = 'meal-app-static-v1';
const DYNAMIC_CACHE_NAME = 'meal-app-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/cumeal\.vercel\.app\/api\/menu/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('Service Worker install failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== CACHE_NAME
            ) {
              return caches.delete(cacheName);
            }
          })
        );
      })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests with cache-first strategy for menu data
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE_NAME)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              // If we have a cached version, use it but also update cache in background
              if (cachedResponse) {
                // Background fetch to update cache
                fetch(request)
                  .then((response) => {
                    if (response.ok) {
                      cache.put(request, response.clone());
                    }
                  })
                  .catch(() => {
                    // Network error, but we have cache
                  });
                return cachedResponse;
              }

              // No cache, fetch from network
              return fetch(request)
                .then((response) => {
                  if (response.ok) {
                    cache.put(request, response.clone());
                  }
                  return response;
                })
                .catch(() => {
                  // Return offline fallback for API requests
                  return new Response(
                    JSON.stringify({ 
                      error: 'Offline', 
                      message: 'You are currently offline. Please check your connection.' 
                    }),
                    {
                      status: 503,
                      statusText: 'Service Unavailable',
                      headers: { 'Content-Type': 'application/json' }
                    }
                  );
                });
            });
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'image') {
    
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(request)
            .then((response) => {
              // Don't cache non-successful responses
              if (!response.ok) {
                return response;
              }

              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });

              return response;
            })
            .catch(() => {
              // Return offline page for document requests
              if (request.destination === 'document') {
                return caches.match('/offline.html');
              }
              
              // Return empty response for other assets
              return new Response('', {
                status: 408,
                statusText: 'Request Timeout'
              });
            });
        })
    );
  }
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync operations
      self.clients.matchAll()
        .then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'BACKGROUND_SYNC' });
          });
        })
    );
  }
});

// Push notification handling (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo.svg',
      badge: '/logo.svg',
      tag: 'meal-notification',
      data: data,
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});
