// Minimal service worker for PWA desktop installation
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let network handle dynamic API and assets
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
