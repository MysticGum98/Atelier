// Zay service worker.
// HTML: network-first, so a new deploy is picked up on the next open.
// Everything else: cache-first, so icons and fonts load instantly and offline still works.
// v3 (10 Oct 2026): the ground tile joined the precache (gone again in v5).
// v4 (10 Oct 2026): the three typefaces (fonts/) and the policy pages join it; Google Fonts is gone.
// v5 (21 Oct 2026): the name is Zay; the velvet is gone (the ground is flat); the icons are the ZY mark.
const CACHE = "zay-v6";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["./icon.png", "./apple-touch-icon.png", "./fonts/bodoni-moda.woff2", "./fonts/bodoni-moda-italic.woff2", "./fonts/inter.woff2", "./fonts/ibm-plex-mono-400.woff2", "./fonts/ibm-plex-mono-500.woff2", "./privacy.html", "./terms.html", "./support.html", "./about.html"])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // API calls go straight to the network

  const isHtml = e.request.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith(".html");
  if (isHtml) {
    e.respondWith(
      fetch(e.request)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res; })
        .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((res) => {
    const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res;
  })));
});
