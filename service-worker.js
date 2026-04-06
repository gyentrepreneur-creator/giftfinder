/* ─────────────────────────────────────────────
   Kadoizi — Service Worker v2.0
   Stratégie : Cache-first pour assets statiques,
               Network-first pour API Supabase.
   ───────────────────────────────────────────── */


const CACHE_NAME = 'giftfinder-v2';
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
