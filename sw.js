const CACHE = 'web-addictive-v2';
const CORE = ['./', './collect-letters/', './big-numbers/', './store-quest/', './slots/'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const url = new URL(req.url);
          // cache our own files, plus the Three.js CDN so games work offline
          if (res && res.ok && !res.redirected) {
            if (url.origin === self.location.origin || /cdn\./.test(url.hostname)) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
          }
          return res;
        })
        .catch(() => caches.match(req));
    })
  );
});
