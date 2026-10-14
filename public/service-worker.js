// IOU Tracker service worker
//
// Vite builds the app into hashed files (assets/index-abc123.js), so this worker
// doesn't hard-code the app's files. Instead:
//   - Page loads (navigations) are network-first: you always get the latest
//     deploy when online, and the cached copy when offline.
//   - Hashed build assets are cache-first (their names change whenever their
//     content does, so a cached copy is never stale).
//   - Everything else (manifest, icons, the Tailwind CDN script) is
//     stale-while-revalidate: served from cache instantly, refreshed in the background.
//
// Because of this you no longer need to bump CACHE_NAME on every deploy. Only bump
// it if you change how this file caches things.

const CACHE_NAME = 'iou-tracker-cache-v12';
const SCOPE = self.registration.scope; // e.g. https://kimballsdk.github.io/iou-tracker/
const INDEX_URL = new URL('./', SCOPE).href;
const TAILWIND_CDN = 'https://cdn.tailwindcss.com';

const PRECACHE_URLS = ['./', 'manifest.json', 'icon-192.png', 'icon-512.png'].map(
  (path) => new URL(path, SCOPE).href
);

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: 'reload' })));
      // Tailwind comes from another origin; cache it if we can, but don't fail install over it.
      try {
        const res = await fetch(new Request(TAILWIND_CDN, { mode: 'no-cors' }));
        await cache.put(TAILWIND_CDN, res);
      } catch (err) {
        console.warn('Could not precache Tailwind:', err);
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

// Opaque responses (cross-origin, no-cors) report ok=false but are still usable.
const isCacheable = (res) => res && (res.ok || res.type === 'opaque');

async function networkFirstPage(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(INDEX_URL, res.clone());
    return res;
  } catch (err) {
    return (await cache.match(INDEX_URL)) || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (isCacheable(res)) cache.put(request, res.clone());
  return res;
}

async function staleWhileRevalidate(event) {
  const { request } = event;
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreVary: true });
  const network = fetch(request)
    .then((res) => {
      if (isCacheable(res)) cache.put(request, res.clone());
      return res;
    })
    .catch(() => undefined);
  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  return (await network) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const inScope = request.url.startsWith(SCOPE);
  const isTailwind = url.origin === new URL(TAILWIND_CDN).origin;
  if (!inScope && !isTailwind) return; // let the browser handle anything else

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
  } else if (inScope && url.pathname.includes('/assets/')) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(event));
  }
});
