// ═══════════════════════════════════════════════════════
//  Hifdh Tracker — Service Worker v2
//  Phase 3: Firebase Cloud Messaging (background push)
// ═══════════════════════════════════════════════════════

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBTfA-W5bl6Eb2U6IQxyPvGDETx989SDtA",
  authDomain: "hifdh-tracker-da869.firebaseapp.com",
  projectId: "hifdh-tracker-da869",
  storageBucket: "hifdh-tracker-da869.firebasestorage.app",
  messagingSenderId: "43337176433",
  appId: "1:43337176433:web:a4527e43250cdb531a92d0"
});

const messaging = firebase.messaging();

const CACHE = 'hifdh-v2';
const ASSETS = [
  '/hifdh-tracker/',
  '/hifdh-tracker/index.html',
  '/hifdh-tracker/manifest.json',
  '/hifdh-tracker/icon-192.png',
  '/hifdh-tracker/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});

messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || 'مُتابَعَةُ الحِفْظِ';
  const body  = payload.notification?.body  || 'Time for your Hifdh session';
  self.registration.showNotification(title, {
    body,
    icon:  '/hifdh-tracker/icon-192.png',
    badge: '/hifdh-tracker/icon-192.png',
    tag:   'hifdh-reminder',
    renotify: true,
    data: { url: '/hifdh-tracker/' }
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes('/hifdh-tracker/') && 'focus' in c) return c.focus();
      }
      return clients.openWindow(e.notification.data?.url || '/hifdh-tracker/');
    })
  );
});
