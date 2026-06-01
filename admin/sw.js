// Kadoizi Cockpit Service Worker — v2 kill-switch (no fetch interception for now)
// PWA installable mais sans cache fetch pour éviter les soucis iOS PWA + cross-origin
const VERSION = 'v2-2026-06-01';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // Nettoie tous les anciens caches
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Pas de listener fetch → toutes les requêtes passent au réseau normalement
// (l'app reste "PWA installable" mais sans offline cache)
