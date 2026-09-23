// ZUNA TAILORS - Service Worker for Web Push & PWA
const CACHE_NAME = 'zuna-tailors-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push Event: Receives and displays Web Push Notifications even when app is closed
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch (err) {
    payload = {
      title: 'ZUNA TAILORS',
      body: event.data.text()
    };
  }

  const title = payload.title || 'ZUNA TAILORS';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/logo.jpg',
    badge: payload.badge || '/logo.jpg',
    image: payload.image,
    data: payload.data || {},
    tag: (payload.data && payload.data.orderId) ? `order-${payload.data.orderId}` : 'zuna-notification',
    renotify: true,
    vibrate: [200, 100, 200],
    actions: payload.actions || [
      { action: 'open', title: 'View Details' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click Event: Opens / focuses browser tab to the targeted order/admin page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) 
    ? event.notification.data.url 
    : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
