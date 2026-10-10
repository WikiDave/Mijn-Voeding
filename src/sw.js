// Mijn Voeding: offline-ondersteuning. Je gegevens staan in IndexedDB en worden hier nooit aangeraakt.
const CACHE = 'mijn-voeding-__VERSION__';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

function metTimeout(p, ms) {
  return new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('timeout')), ms); p.then(r => { clearTimeout(t); res(r); }, e => { clearTimeout(t); rej(e); }); });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // De app zelf: eerst online (zodat updates binnenkomen), anders de bewaarde versie.
  if (req.mode === 'navigate') {
    e.respondWith(metTimeout(fetch(req), 4000).then(r => {
      if (r && r.ok) { const kopie = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', kopie)); }
      return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  // Iconen en lettertypes: eerst uit de cache, op de achtergrond vernieuwen.
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin === location.origin || fonts) {
    e.respondWith(caches.match(req).then(hit => {
      const net = fetch(req).then(r => {
        if (r && (r.ok || r.type === 'opaque')) { const kopie = r.clone(); caches.open(CACHE).then(c => c.put(req, kopie)); }
        return r;
      }).catch(() => hit);
      return hit || net;
    }));
  }
});
