// Kadoizi Cockpit Service Worker
// Stratégie : cache-first pour l'app shell, network-only pour /functions (API)
const CACHE = 'kadoizi-admin-v1';
const SHELL = [
  '/admin/',
  '/admin/index.html',
  '/admin/manifest.json',
  '/admin/logo.jpg'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => null)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Ne JAMAIS cacher l'API ou les CDN externes (Supabase, fonts, scripts)
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdn.jsdelivr.net')
  ) return; // laisse passer au réseau

  // Pour le shell admin : cache-first
  if (url.pathname.startsWith('/admin/')) {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(resp => {
        if (resp.ok && e.request.method === 'GET') {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => caches.match('/admin/index.html')))
    );
  }
});
