const CACHE_NAME = 'zyad-casino-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/css/main.css',
  '/src/js/app.js',
  '/assets/logo.png',
  '/assets/icons/icon-192x192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});