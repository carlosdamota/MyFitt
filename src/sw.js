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
// This avoids bundling heavy Firebase code into the PWA worker
importScripts('/firebase-messaging-sw.js');
