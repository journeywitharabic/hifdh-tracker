// ═══════════════════════════════════════════════════════
//  Hifdh Tracker — Service Worker
//  Phase 2: PWA install + offline cache
//  Phase 3 will add Firebase push notification handling
// ═══════════════════════════════════════════════════════

const CACHE = 'hifdh-v1';
const ASSETS = [
  '/hifdh-tracker/',
  '/hifdh-tracker/index.html',
  '/hifdh-tracker/manifest.json',
  '/hifdh-tracker/icon-192.png',
  '/hifdh-tracker/icon-512.png'
];

// Install: cache all app assets so it works offline
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  e.waitUntil(clients.claim());
});

// Fetch: serve from cache first, fall back to network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

// ── PUSH NOTIFICATIONS (Phase 3 — Firebase will populate this) ──
self.addEventListener('push', e => {
  if (!e.data) return;
  const payload = e.data.json();
  e.waitUntil(
    self.registration.showNotification(payload.title || 'مُتابَعَةُ الحِفْظِ', {
      body: payload.body || 'Time for your Hifdh session',
      icon: '/hifdh-tracker/icon-192.png',
      badge: '/hifdh-tracker/icon-192.png',
      tag: 'hifdh-reminder',
      renotify: true,
      requireInteraction: false,
      data: { url: payload.url || '/hifdh-tracker/' }
    })
  );
});

// Tap notification → open app at Today's session
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('/hifdh-tracker/') && 'focus' in client)
          return client.focus();
      }
      return clients.openWindow(e.notification.data?.url || '/hifdh-tracker/');
    })
  );
});
