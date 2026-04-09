/* ─────────────────────────────────────────────
   Kadoizi — Service Worker v3.0
   Stratégie : Cache-first pour assets statiques,
               Network-first pour API Supabase.
   ───────────────────────────────────────────── */

const CACHE_NAME = 'giftfinder-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/questionnaire.html',
  '/historique.html',
  '/resultats.html',
  '/profil.html',
  '/shared.html',
  '/404.html',
  '/cgu.html',
  '/confidentialite.html',
  '/mentions-legales.html',
  '/css/style.css',
  '/css/animations.css',
  '/js/config.js',
  '/js/supabase-init.js',
  '/js/analytics.js',
  '/js/animate.js',
  '/manifest.json'
];


/* ── Installation : mise en cache des assets statiques ── */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});


/* ── Activation : nettoyage des anciens caches ── */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(name) { return name !== CACHE_NAME; })
          .map(function(name) { return caches.delete(name); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});


/* ── Fetch : Network-first pour API, Cache-first pour statiques ── */
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // API Supabase / requêtes externes → toujours réseau
  if (url.hostname.includes('supabase') ||
      url.hostname.includes('cdn.jsdelivr.net') ||
      event.request.method !== 'GET') {
    return;
  }

  // Assets statiques → cache-first avec fallback réseau
  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      if (cachedResponse) {
        // Mise à jour en arrière-plan (stale-while-revalidate)
        var fetchPromise = fetch(event.request).then(function(networkResponse) {
          if (networkResponse && networkResponse.ok) {
            var responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        }).catch(function() {});
        return cachedResponse;
      }

      // Pas en cache → réseau avec mise en cache
      return fetch(event.request).then(function(networkResponse) {
        if (networkResponse && networkResponse.ok && url.origin === self.location.origin) {
          var responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(function() {
        // Offline fallback pour les pages HTML
        if (event.request.headers.get('accept') &&
            event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});
