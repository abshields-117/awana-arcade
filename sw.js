// Awana Retro Arcade — Offline Service Worker
const CACHE_NAME = 'awana-arcade-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './games/creation_architect.html',
  './games/cosmic_arcade_shooter.html',
  './games/garden_architect.html',
  './games/cosmic_defender.html',
  './games/galaxy_architect.html',
  './games/star_navigator.html',
  './games/retro_screensaver.html',
  './games/eden_explorer.html',
  './games/eden_sentinel_tds.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching Awana Arcade games for offline Chromebook play...');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.warn('[SW] Cache addAll warning:', err));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            console.log('[SW] Clearing old cache:', k);
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Cache-first strategy for fast offline loading
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Offline fallback to index
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
