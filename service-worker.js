// Service worker de PrestaYan: permite instalar la app y abrirla sin conexión.
// Al subir una versión nueva, cambia el número de CACHE para forzar la actualización.
const CACHE = 'prestayan-v8';
const ARCHIVOS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(k => k.startsWith('prestayan-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero la red (siempre la versión más reciente); si no hay conexión, la copia guardada.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        if (resp && resp.ok && new URL(e.request.url).origin === location.origin) {
          const copia = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copia));
        }
        return resp;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
