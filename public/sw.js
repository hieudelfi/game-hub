/* eslint-env serviceworker */
/* Service Worker cho Game Hub — cache-first cho asset hashed, network-first cho shell HTML. */

const CACHE_NAME = "gamehub-v1";

const STATIC_URLS = [
  "/",
  "/favicon.svg",
  "/games/snake-cover.svg",
  "/games/tetris-cover.svg",
  "/games/flappy-cover.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Hashed asset và cover: cache-first (immutable)
  if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/games/")) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Navigation HTML: network-first, fallback shell root khi offline
  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req));
    return;
  }

  // Còn lại: stale-while-revalidate
  event.respondWith(staleWhileRevalidate(req));
});

async function cacheFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) await cache.put(req, res.clone());
    return res;
  } catch {
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetch(req);
    if (res.ok) await cache.put(req, res.clone());
    return res;
  } catch {
    const cached = (await cache.match(req)) || (await cache.match("/"));
    return cached || new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || (await fetchPromise);
}
