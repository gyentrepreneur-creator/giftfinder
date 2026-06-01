// Kadoizi Cockpit Service Worker v3 — full purge + version notify
const VERSION = 'v7-2026-06-01-21h15-mocks-always';

self.addEventListener('install', (e) => { self.skipWaiting(); });

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll())
      .then(clients => clients.forEach(c => c.postMessage({ type: 'SW_ACTIVATED', version: VERSION })))
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'GET_VERSION') e.source.postMessage({ type: 'VERSION', version: VERSION });
});
