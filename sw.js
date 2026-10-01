const CACHE_NAME = 'taikou-english-cache-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './css/modal.css',
  './js/words-data.js',
  './js/progress.js',
  './js/speech.js',
  './js/hero.js',
  './js/game-characters.js',
  './js/game-map.js',
  './js/game-engine.js',
  './js/ui.js',
  './js/app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request).then((networkRes) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, networkRes.clone());
          return networkRes;
        });
      });
    }).catch(() => caches.match('./index.html'))
  );
});
