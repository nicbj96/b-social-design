/**
 * B-Social Service Worker — Push Notifications + Clean Cache
 * Replaced the old self-destruct SW.
 * Handles Web Push notifications and notificationclick events.
 * Does NOT do any request caching — let the network (and Cloudflare) handle that.
 */

const SW_VERSION = 'b-social-sw-v2';

// ── Install: activate immediately, no pre-caching ──────────────────────────
self.addEventListener('install', () => {
  self.skipWaiting();
});

// ── Activate: claim clients so the new SW takes over right away ────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: pass-through, no caching ───────────────────────────────────────
self.addEventListener('fetch', () => {
  // Intentional no-op — let the browser handle all requests normally.
  // Caching is handled by Cloudflare Pages edge + HTTP headers.
});

// ── Push: show a notification ─────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'B-Social', body: event.data ? event.data.text() : '' };
  }

  const title   = data.title   || 'B-Social';
  const body    = data.body    || 'Du har en ny notifikation';
  const icon    = data.icon    || '/icon-192x192.png';
  const badge   = data.badge   || '/icon-96x96.png';
  const url     = data.url     || '/feed';
  const tag     = data.tag     || 'b-social-push';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag,
      data: { url },
      vibrate: [200, 100, 200],
      requireInteraction: false,
    })
  );
});

// ── NotificationClick: open or focus the relevant page ────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/feed';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Focus an existing tab if one is already open
        for (const client of clients) {
          if (new URL(client.url).pathname === new URL(targetUrl, self.location.origin).pathname) {
            return client.focus();
          }
        }
        // Otherwise open a new tab
        return self.clients.openWindow(targetUrl);
      })
  );
});
