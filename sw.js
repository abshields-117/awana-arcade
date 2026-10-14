// Awana Retro Arcade — Offline Service Worker
const CACHE_NAME = 'awanacade-v7';
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
  './games/eden_sentinel_tds.html',
  './games/noah_raindrop_rush.html',
  './games/eden_two_trees_td.html',
  './games/henrys_eden_craft.html',
  './games/flaming_sword_defense.html',
  './games/phantom_manor.html',
  './games/eden_screensaver.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching Awana Arcade games...');
      return cache.addAll(ASSETS_TO_CACHE); // Failed installs must not replace a working offline cache.
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k.startsWith('awanacade-') && k !== CACHE_NAME) {
            console.log('[SW] Purging stale cache:', k);
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if(e.request.method !== 'GET') return;
  const url = e.request.url;
  const isHtmlOrGame = e.request.mode === 'navigate' || url.endsWith('.html') || url.includes('/games/');

  if (isHtmlOrGame) {
    // Network-first for games and HTML so fixes land immediately on reload
    e.respondWith(
      fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => caches.match(e.request, {ignoreSearch: true}))
    );
    return;
  }

  // Cache-first for other static assets
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});