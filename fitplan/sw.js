// FitPlan Service Worker – macht die App offline verfügbar.
// Bei jeder Änderung an der App VERSION hochzählen, damit Handys die neue Version laden.
const VERSION = 'fitplan-v4';

// Dateien, die beim ersten Öffnen sofort gespeichert werden.
// Weitere Dateien (CSS, JS, Bilder) werden beim ersten Laden automatisch mitgespeichert.
// App-Code (css/, js/) – die Liste muss zu den <script>-Zeilen in index.html passen.
const APP = ['./css/app.css', './js/design.js', './js/daten-rezepte.js', './js/daten-sport.js', './js/daten-lebensmittel.js', './js/kern.js', './js/essen.js', './js/scanner-suche.js', './js/sport.js', './js/plan.js', './js/sync.js', './js/einkaufsmodus.js', './js/familie.js', './js/familie-import.js', './js/kalender.js', './js/fortschritt.js', './js/mehr.js', './js/start.js'];
const PRECACHE = ['./', './index.html', './manifest.json', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png', './zxing.min.js', ...APP];

// Ablage für Inhalte, die aus anderen Apps an FitPlan geteilt werden (Text, Links, Kalenderdateien)
const SHARE = 'fitplan-share';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== SHARE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Teilen aus anderen Apps (Android): Inhalt merken, dann FitPlan mit ?shared öffnen (start.js holt ihn ab)
  if (req.method === 'POST' && new URL(req.url).searchParams.has('share-target')) {
    event.respondWith((async () => {
      const out = { title: '', text: '', url: '', files: [] };
      try {
        const fd = await req.formData();
        out.title = String(fd.get('title') || ''); out.text = String(fd.get('text') || ''); out.url = String(fd.get('url') || '');
        for (const f of fd.getAll('files')) if (f && typeof f.text === 'function' && f.size < 5e6) out.files.push({ name: f.name || '', text: await f.text() });
      } catch (e) {}
      const c = await caches.open(SHARE);
      await c.put(new URL('share-inbox', self.registration.scope).href, new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json' } }));
      return Response.redirect(new URL('./?shared=1', self.registration.scope).href, 303);
    })());
    return;
  }

  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // Seitenaufrufe: erst online versuchen (neueste Version), offline aus dem Speicher.
  if (req.mode === 'navigate') {
    event.respondWith(
      // cache: 'no-cache' – nicht die bis zu 10 Min. alte Kopie aus dem Browser-Cache nehmen
      fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' })
        .then((res) => {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // App-Code (CSS/JS): wie die Seite erst online (passend zur neuen index.html), offline aus dem Speicher.
  if (/\/(css|js)\/[^/]+\.(css|js)$/.test(new URL(req.url).pathname)) {
    event.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then((res) => {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || Response.error()))
    );
    return;
  }

  // Alle anderen Dateien (Icons, Barcode-Scanner): sofort aus dem Speicher, im Hintergrund aktualisieren.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
