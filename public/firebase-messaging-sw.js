importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // We need to replace these or fetch them? SW doesn't have access to env vars easily at build time without a bundler injection usually.
  // For now we might need to hardcode or use a strategy to inject.
  // Given this is a PWA using Vite, we can try to rely on import.meta.env BUT accessing that in a public file is tricky.
  // Standard practice for public SW: Hardcode public config or use a script to generate this file.
  // Let's use a placeholder and warn the user, or try to read the config if possible.
  // Actually, for a PWA, we usually register the SW from the main thread where we have config.
  // But the SW itself needs to init firebase to handle background messages.
};

// However, we can use a trick: self.__WB_MANIFEST if we were using Workbox, but we are writing a raw file.
// Let's simplify: The user needs to put their firebase config here.
// OR we use the existing firebase.ts to prompt the user.

// Wait, the better approach for Vite PWA is often letting vite-plugin-pwa handle it, but for FCM specifically, we need a separate worker or include it.
// Let's stick to the standard `firebase-messaging-sw.js` in public.

firebase.initializeApp({
  // TODO: User must replace this with their config or we inject it
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon-192x192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
