const CACHE = "bologna-v6";
const KERN = ["./", "index.html", "manifest.webmanifest", "icon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(KERN)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
// ALLEEN eigen bestanden afhandelen; extern verkeer (Wikipedia, kaarttegels, fonts)
// volledig met rust laten — de service worker mag daar nooit tussen zitten.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const kopie = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, kopie));
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
