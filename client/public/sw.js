/**
 * Meslegim.tr Service Worker - Push Notifications
 */

// Push notification received
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || '',
      icon: data.icon || '/logo.png',
      badge: data.badge || '/logo.png',
      data: data.data || {},
      tag: data.tag || 'meslegim-notification',
      renotify: true,
      requireInteraction: false,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'open', title: 'Görüntüle' },
        { action: 'dismiss', title: 'Kapat' },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Meslegim.tr', options)
    );
  } catch (err) {
    console.error('Push notification parse error:', err);
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/dashboard';
  const fullUrl = new URL(url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.navigate(fullUrl);
          return client.focus();
        }
      }
      // Open new window
      return clients.openWindow(fullUrl);
    })
  );
});

// Service worker install
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Service worker activate
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
