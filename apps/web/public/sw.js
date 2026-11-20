// Offline support: hashed build assets are cache-first because their URLs change with their content;
// everything else is network-first so updates show immediately and the cache is only a fallback.
const VERSION = 'v1'
const PAGES = `pages-${VERSION}`
const ASSETS = `assets-${VERSION}`
const scope = new URL(self.registration.scope)

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(PAGES).then((cache) => cache.add(scope.href)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== PAGES && key !== ASSETS).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

async function networkFirst(request, cacheKey) {
  const cache = await caches.open(PAGES)
  try {
    const response = await fetch(request)
    if (response.ok) await cache.put(cacheKey, response.clone())
    return response
  } catch (error) {
    const cached = await cache.match(cacheKey)
    if (cached) return cached
    throw error
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSETS)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) await cache.put(request, response.clone())
  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return

  if (request.mode === 'navigate') {
    // Every query string renders the same app shell, so cache it under one key.
    event.respondWith(networkFirst(request, scope.href))
  } else if (url.pathname.startsWith(`${scope.pathname}assets/`)) {
    event.respondWith(cacheFirst(request))
  } else {
    // Data, manifest and icons keep stable URLs, so they must be revalidated.
    event.respondWith(networkFirst(request, url.origin + url.pathname))
  }
})
