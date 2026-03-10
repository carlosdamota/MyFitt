import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";

// 1. Precache essential assets (HTML, CSS, vendor+main JS, icons)
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// 2. Runtime cache for lazy JS/CSS chunks
registerRoute(
  ({ request }) =>
    request.destination === "script" || request.destination === "style",
  new StaleWhileRevalidate({
    cacheName: "assets-runtime",
  }),
);

// 3. SW lifecycle
addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
clientsClaim();

// 4. Import Firebase Messaging from public folder
// Note: importScripts() is not supported in Module Workers (Chrome dev mode with type: "module").
// We wrap it in a check and a try-catch to avoid crashing the SW in dev.
if (typeof importScripts === 'function') {
  try {
    importScripts('/firebase-messaging-sw.js');
  } catch (error) {
    console.error('Error loading firebase-messaging-sw.js:', error);
  }
} else {
  // In development, the worker is often loaded as a module where importScripts is unavailable.
  // This is expected if devOptions.type is "module" in vite.config.js.
  console.warn('SW: importScripts not supported in module mode. Background notifications might be disabled in dev.');
}
