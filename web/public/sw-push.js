// =====================================================
// Service Worker - Push Notifications
// =====================================================
// Task Group 35: Push Notifications
// Handles push events and notification clicks

// Service Worker version
const SW_VERSION = "1.0.0";

// =====================================================
// Push Event Handler
// =====================================================

self.addEventListener("push", (event) => {
  console.log("[SW] Push received:", event);

  if (!event.data) {
    console.warn("[SW] Push event has no data");
    return;
  }

  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    // Fallback for text payload
    payload = {
      title: "TeqBook",
      body: event.data.text(),
    };
  }

  const options = {
    body: payload.body,
    icon: payload.icon || "/icons/icon-192.png",
    badge: payload.badge || "/icons/badge-72.png",
    tag: payload.tag || "default",
    data: payload.data || {},
    vibrate: payload.vibrate || [100, 50, 100],
    actions: payload.actions || [],
    requireInteraction: payload.requireInteraction || false,
    silent: payload.silent || false,
    timestamp: payload.timestamp || Date.now(),
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// =====================================================
// Notification Click Handler
// =====================================================

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action);

  event.notification.close();

  const data = event.notification.data || {};
  const action = event.action;

  // Handle different actions
  if (action === "dismiss") {
    return;
  }

  // Determine URL to open
  let url = "/dashboard";
  
  if (data.url) {
    url = data.url;
  } else if (data.bookingId) {
    url = `/bookings/${data.bookingId}`;
  }

  // Focus existing window or open new one
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            // Navigate existing window
            client.postMessage({
              type: "NOTIFICATION_CLICK",
              url: url,
            });
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// =====================================================
// Notification Close Handler
// =====================================================

self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event.notification.tag);
  
  // Track notification dismissals if needed
  const data = event.notification.data || {};
  
  // Could send analytics event here
  // trackNotificationDismissal(data);
});

// =====================================================
// Push Subscription Change Handler
// =====================================================

self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("[SW] Push subscription changed");
  
  event.waitUntil(
    // Attempt to resubscribe
    self.registration.pushManager
      .subscribe(event.oldSubscription.options)
      .then((subscription) => {
        // Send new subscription to server
        return fetch("/api/push/resubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oldEndpoint: event.oldSubscription?.endpoint,
            newSubscription: subscription.toJSON(),
          }),
        });
      })
      .catch((error) => {
        console.error("[SW] Failed to resubscribe:", error);
      })
  );
});

// =====================================================
// Message Handler (from main app)
// =====================================================

self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);
  
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  
  if (event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: SW_VERSION });
  }
});

// =====================================================
// Install Event
// =====================================================

self.addEventListener("install", (event) => {
  console.log("[SW] Installing version:", SW_VERSION);
  self.skipWaiting();
});

// =====================================================
// Activate Event
// =====================================================

self.addEventListener("activate", (event) => {
  console.log("[SW] Activated version:", SW_VERSION);
  event.waitUntil(clients.claim());
});
