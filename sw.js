const CACHE = 'wrb-v9-20261006';
const CORE = ['/index.html', '/pwa.js', '/manifest.webmanifest', '/wrb-icon.svg', '/wrb-icon-192.png', '/wrb-icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE)
    .then(cache => cache.addAll(CORE.map(path => new Request(path, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => event.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('wrb-') && key !== CACHE).map(key => caches.delete(key))))
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
    const fresh = fetch(event.request, { cache: 'no-store' });
    event.waitUntil(fresh.then(async response => {
      if (response.ok && url.pathname !== '/sw.js') {
        const copy = response.clone();
        const cache = await caches.open(CACHE);
        await cache.put(event.request.mode === 'navigate' ? '/index.html' : event.request, copy);
      }
    }).catch(() => {}));
    event.respondWith(
      fresh.catch(() =>
        event.request.mode === 'navigate' ? caches.match('/index.html') : caches.match(event.request)
      )
    );
    return;
  }

  if (!CORE.includes(url.pathname)) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
