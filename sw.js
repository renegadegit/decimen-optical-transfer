// Service worker: precache the whole app at install — including the ~940 KB
// zxing WASM, without which the receiver is useless offline — then serve
// cache-first forever. There is nothing to fetch at runtime by design
// (BUILD_LOOP invariant 7): after one visit, every radio can be off.
//
// The precache list and version are injected by scripts/inject-sw.cjs after
// `vite build`; this file is served verbatim from /sw.js so its URL is
// stable across deploys while the hashed assets inside the list change.

const VERSION = "548b6095c1eb";
const CACHE = `decimen-${VERSION}`;
const PRECACHE = [
  "./",
  "./apple-touch-icon.png",
  "./assets/index-BlcvUTvK.js",
  "./assets/index-iIJ8NeeL.css",
  "./assets/jetbrains-mono-latin-400-normal-6-qcROiO.woff",
  "./assets/jetbrains-mono-latin-400-normal-V6pRDFza.woff2",
  "./assets/jetbrains-mono-latin-700-normal-BYuf6tUa.woff2",
  "./assets/jetbrains-mono-latin-700-normal-D3wTyLJW.woff",
  "./assets/worker-DjXik4rX.js",
  "./assets/zxing_reader-vui-RP1A.wasm",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./manifest.webmanifest"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (e.request.mode === "navigate") {
    // single page: every navigation inside scope is the shell
    e.respondWith(caches.match("./").then((r) => r || fetch(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
