const CACHE_NAME = "pub-golf-cache-v2";
const APP_BASE = new URL(self.registration.scope).pathname.replace(/\/$/, "");
const ASSETS = [
  `${APP_BASE}/`,
  `${APP_BASE}/index.html`,
  `${APP_BASE}/manifest.webmanifest`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(`${APP_BASE}/index.html`, copy));
          return response;
        })
        .catch(() => caches.match(`${APP_BASE}/index.html`)),
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (requestUrl.origin === self.location.origin) {
          const copy = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
