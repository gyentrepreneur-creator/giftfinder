/* ─────────────────────────────────────────────
   GiftFinder — Service Worker v1.0
   Stratégie : Cache-first pour assets statiques,
               Network-first pour API Supabase.
   ───────────────────────────────────────────── */

const CACHE_NAME = 'giftfinder-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/questionnaire.html',
  '/historique.html',
  '/profil.html',
  '/404.html',
  '/cgu.html',
  '/confidentialite.html',
  '/mentions-legales.html',
  '/css/style.css',
  '/js/config.js',
  '/js/supabase-init.js',
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
          .map(function(name)   { return caches.delete(name); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* ── Fetch : stratégie hybride ── */
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Supabase / API calls → Network-first (pas de cache)
  if (url.hostname.includes('supabase.co') || url.hostname.includes('supabase.in')) {
    event.respondWith(
      fetch(event.request).catch(function() {
        return new Response(JSON.stringify({ error: 'Offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Requêtes POST/PUT/DELETE → toujours réseau
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Assets statiques → Cache-first avec fallback réseau
  event.respondWith(
    caches.match(event.request).then(function(cachedResponse) {
      if (cachedResponse) {
        // Mettre à jour le cache en arrière-plan (stale-while-revalidate)
        fetch(event.request).then(function(networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(function() {});
        return cachedResponse;
      }

      // Pas en cache → réseau
      return fetch(event.request).then(function(networkResponse) {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
          return networkResponse;
        }
        var responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(function() {
        // Offline : retourner la page d'accueil depuis le cache
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
