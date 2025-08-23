// Service Worker für Push-Benachrichtigungen
const CACHE_NAME = 'arabic-learning-v1';

// Install Event
self.addEventListener('install', (event) => {
  console.log('Service Worker installiert');
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  console.log('Service Worker aktiviert');
  event.waitUntil(clients.claim());
});

// Push Event - wird ausgelöst wenn Push-Nachricht empfangen wird
self.addEventListener('push', (event) => {
  console.log('Push-Nachricht empfangen:', event);
  
  let notificationData = {
    title: 'Zeit zum Arabisch lernen! 📚',
    body: 'Deine tägliche Lerneinheit wartet auf dich.',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: {
      url: '/dashboard',
      action: 'open_app'
    },
    actions: [
      {
        action: 'start_learning',
        title: 'Jetzt lernen',
        icon: '/icons/learn.png'
      },
      {
        action: 'snooze',
        title: 'Später erinnern',
        icon: '/icons/clock.png'
      }
    ],
    requireInteraction: true,
    tag: 'learning-reminder'
  };

  // Parse data from server if available
  if (event.data) {
    try {
      const serverData = event.data.json();
      notificationData = { ...notificationData, ...serverData };
    } catch (e) {
      console.log('Konnte Push-Daten nicht parsen:', e);
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: notificationData.requireInteraction,
      tag: notificationData.tag
    }
  );

  event.waitUntil(promiseChain);
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  console.log('Benachrichtigung geklickt:', event);
  
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data;

  if (action === 'start_learning') {
    // Öffne App direkt im Lernbereich
    event.waitUntil(
      clients.openWindow('/book-reader')
    );
  } else if (action === 'snooze') {
    // Benachrichtigung für später planen (wird über Webapp-Logik gehandelt)
    console.log('Snooze gewählt - wird später erinnert');
  } else {
    // Standard-Klick - öffne die Haupt-App
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Prüfe ob App bereits geöffnet ist
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Öffne neue App-Instanz
        if (clients.openWindow) {
          return clients.openWindow(notificationData.url || '/dashboard');
        }
      })
    );
  }
});

// Background Sync für offline Funktionalität
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background Sync ausgeführt');
  }
});

// Fetch Event für Caching (optional)
self.addEventListener('fetch', (event) => {
  // Basis-Caching für bessere Performance
  if (event.request.url.includes('/api/')) {
    return; // API-Anfragen nicht cachen
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});