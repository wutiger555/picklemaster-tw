// Service Worker for PWA support — v4
// Strategy:
//   - HTML/navigation: network-first (always fresh content)
//   - JS/CSS hashed assets: cache-first with stale-while-revalidate fallback
//   - Images: cache-first with long TTL
//   - JSON data: stale-while-revalidate (fast UI + background update)
//   - External CDN (Unsplash, fonts): cache-first

const CACHE_VERSION = 'v4';
const STATIC_CACHE = `pickle-static-${CACHE_VERSION}`;
const ASSETS_CACHE = `pickle-assets-${CACHE_VERSION}`;
const IMAGES_CACHE = `pickle-images-${CACHE_VERSION}`;
const DATA_CACHE = `pickle-data-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/logo.webp',
  '/manifest.json',
];

// ===== Install =====
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ===== Activate — clean old caches =====
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names
          .filter(n => !n.endsWith(CACHE_VERSION))
          .map(n => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// ===== Fetch =====
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, chrome-extension, devtools etc.
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // 1. HTML/navigation: network-first
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, STATIC_CACHE));
    return;
  }

  // 2. JSON data (courts.json, etc.): stale-while-revalidate
  if (url.pathname.endsWith('.json')) {
    event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
    return;
  }

  // 3. Images: cache-first
  if (request.destination === 'image' || /\.(png|jpe?g|webp|svg|gif|avif)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGES_CACHE));
    return;
  }

  // 4. Hashed JS/CSS assets (Vite output): cache-first
  if (url.pathname.startsWith('/assets/') || /\.(js|css)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, ASSETS_CACHE));
    return;
  }

  // 5. External fonts (Google Fonts): cache-first
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirst(request, ASSETS_CACHE));
    return;
  }

  // Default: try network, fallback to cache
  event.respondWith(networkFirst(request, ASSETS_CACHE));
});

// ===== Strategies =====
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw new Error('Network failed and no cache');
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return cached || Promise.reject(err);
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then(response => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);
  return cached || networkPromise;
}
