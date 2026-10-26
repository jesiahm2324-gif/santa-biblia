// Santa Biblia: guarda la app y el texto bíblico para abrir al instante y leer sin conexión.
// Al publicar cambios: sube el número de versión aquí, en version.json y en APP_VERSION de index.html.
const VERSION = 'santa-biblia-v7';
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

function conLimite(promesa, ms) {
  return Promise.race([promesa, new Promise((_, no) => setTimeout(() => no(new Error('tiempo')), ms))]);
}

self.addEventListener('install', e => {
  // cache: 'reload' evita copias viejas guardadas por el navegador: siempre baja la versión publicada.
  e.waitUntil(
    caches.open(VERSION)
      .then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSION && k !== FONTS && k !== DATOS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Aviso de versión: siempre directo a internet, nunca desde la copia guardada.
  if (url.origin === location.origin && (url.pathname.endsWith('/version.json') || url.pathname.endsWith('/sw.js'))) return;

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

  // Página principal: abre al instante con la copia guardada y trae la versión nueva en segundo plano.
  if (req.mode === 'navigate') {
    e.respondWith(caches.open(VERSION).then(async c => {
      const hit = await c.match('./index.html');
      const red = fetch(req.url, { cache: 'no-store' }).then(r => { if (r.ok) c.put('./index.html', r.clone()); return r; });
      if (hit) { e.waitUntil(red.catch(() => {})); return hit; }
      return red.catch(() => caches.match('./'));
    }));
    return;
  }

  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(r => {
    if (r.ok) {
      const copia = r.clone();
      caches.open(url.pathname.endsWith('biblia.json') ? DATOS : VERSION).then(c => c.put(req, copia));
    }
    return r;
  })));
});
