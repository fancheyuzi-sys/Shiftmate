// ShiftMate service worker. Cache the public app shell, never salary data.
const CACHE = 'shiftmate-shell-v1.1';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // Refresh app files when online, but keep a working offline copy.
  event.respondWith(fetch(req).then(async response => {
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(req, response.clone());
    }
    return response;
  }).catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});
