// Firebase Messaging Service Worker
// This file MUST be at the root of the public folder for FCM to work.
// It handles background push notifications when the app/tab is not in focus.

// We use the compat libraries because service workers don't support ES modules.
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// Parse the configuration from the URL query parameters
const configParams = new URLSearchParams(self.location.search);
const config = {
  apiKey: configParams.get("apiKey"),
  authDomain: configParams.get("authDomain"),
  projectId: configParams.get("projectId"),
  storageBucket: configParams.get("storageBucket"),
  messagingSenderId: configParams.get("messagingSenderId"),
  appId: configParams.get("appId"),
};

// Initialize Firebase app in the service worker with the passed configuration
// Fallback to empty strings if needed, though they should be present if passed correctly
firebase.initializeApp({
  apiKey: config.apiKey || self.__FIREBASE_CONFIG__?.apiKey || "",
  authDomain: config.authDomain || self.__FIREBASE_CONFIG__?.authDomain || "",
  projectId: config.projectId || self.__FIREBASE_CONFIG__?.projectId || "",
  storageBucket: config.storageBucket || self.__FIREBASE_CONFIG__?.storageBucket || "",
  messagingSenderId: config.messagingSenderId || self.__FIREBASE_CONFIG__?.messagingSenderId || "",
  appId: config.appId || self.__FIREBASE_CONFIG__?.appId || "",
});

const messaging = firebase.messaging();

// Handle background messages (when app is not in focus)
messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw.js] Background message:", payload);

  const notificationTitle = payload.notification?.title || "FitManual";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/icon-192x192.png",
    badge: "/icon-72x72.png",
    data: {
      url: payload.data?.url || payload.fcmOptions?.link || "/",
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click — open the app at the right URL
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open new window
      return clients.openWindow(targetUrl);
    }),
  );
});
