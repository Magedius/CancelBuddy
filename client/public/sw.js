// Service Worker for CancelBuddy PWA
const CACHE_NAME = 'cancelbuddy-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Message event for badge updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_BADGE') {
    const badgeCount = event.data.count;
    
    if ('setAppBadge' in self.navigator) {
      if (badgeCount > 0) {
        self.navigator.setAppBadge(badgeCount);
      } else {
        self.navigator.clearAppBadge();
      }
    }
  }
});

// Background sync for checking subscription status
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-subscriptions') {
    event.waitUntil(
      // This would check subscription status and update badge
      fetch('/api/subscriptions')
        .then(response => response.json())
        .then(subscriptions => {
          const upcoming = subscriptions.filter(s => 
            s.status === "warning" || s.status === "urgent"
          ).length;
          
          if ('setAppBadge' in self.navigator) {
            if (upcoming > 0) {
              self.navigator.setAppBadge(upcoming);
            } else {
              self.navigator.clearAppBadge();
            }
          }
        })
        .catch(err => console.log('Background sync failed:', err))
    );
  }
});