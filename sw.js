// Santa Biblia: guarda la app y el texto bíblico para abrir al instante y leer sin conexión.
// Al publicar cambios en la app, sube el número de versión para que los teléfonos descarguen lo nuevo.
const VERSION = 'santa-biblia-v5';
const DATOS = 'santa-biblia-datos-rv1909';   // el texto bíblico: se descarga una sola vez y no se borra al actualizar
const FONTS = 'santa-biblia-fuentes';
const ARCHIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './maskable-512.png',
  './apple-touch-icon.png',
  './favicon.png',
  './favicon.svg'
];

// Espera la red como máximo `ms` milisegundos.
function conLimite(promesa, ms) {
  return Promise.race([promesa, new Promise((_, no) => setTimeout(() => no(new Error('tiempo')), ms))]);
}

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== FONTS && k !== DATOS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Fuentes de Google: copia guardada al instante; sin copia, espera la red como máximo 3 s.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then(async c => {
      const hit = await c.match(req);
      const red = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; });
      if (hit) { red.catch(() => {}); return hit; }
      return conLimite(red, 3000).catch(() => new Response('', { status: 504 }));
    }));
    return;
  }

  if (url.origin !== location.origin) return;

  // Página principal: abre al instante con la copia guardada y busca la versión nueva en segundo plano.
  if (req.mode === 'navigate') {
    e.respondWith(caches.open(VERSION).then(async c => {
      const hit = await c.match('./index.html');
      const red = fetch(req).then(r => { if (r.ok) c.put('./index.html', r.clone()); return r; });
      if (hit) { e.waitUntil(red.catch(() => {})); return hit; }
      return red.catch(() => caches.match('./'));
    }));
    return;
  }

  // Resto (texto bíblico, íconos): primero la copia guardada en cualquier caché.
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(r => {
    if (r.ok) {
      const copia = r.clone();
      caches.open(url.pathname.endsWith('biblia.json') ? DATOS : VERSION).then(c => c.put(req, copia));
    }
    return r;
  })));
});
