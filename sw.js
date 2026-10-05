const CACHE = 'wrb-v5-20261004';
const CORE = ['/index.html', '/pwa.js', '/manifest.webmanifest', '/wrb-icon.svg', '/wrb-icon-192.png', '/wrb-icon-512.png'];

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => event.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('wrb-')).map(key => caches.delete(key))))
    .then(() => self.clients.claim())
));

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/.netlify/')) return;

  // Always fetch navigations and PWA control files from the network first so
  // a previously installed WRB cannot trap the device on an old release.
  const isControlFile = event.request.mode === 'navigate' ||
    ['/pwa.js', '/manifest.webmanifest', '/sw.js'].includes(url.pathname);

  if (isControlFile) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() =>
        event.request.mode === 'navigate' ? caches.match('/index.html') : caches.match(event.request)
      )
    );
    return;
  }

  if (!CORE.includes(url.pathname)) return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy)));
      }
      return response;
    }))
  );
});
