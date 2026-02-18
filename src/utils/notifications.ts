import { getToken } from "firebase/messaging";
import { messaging, db, appId, firebaseConfig } from "../config/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function requestNotificationPermission(userId: string) {
  if (!messaging) {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

      if (!vapidKey) {
        console.warn("VITE_FIREBASE_VAPID_KEY is missing. Push notifications won't work.");
        return null;
      }

      const swUrl = `/firebase-messaging-sw.js?${new URLSearchParams(firebaseConfig as any).toString()}`; // Pass config via URL
      const registration = await navigator.serviceWorker.register(swUrl);

      const token = await getToken(messaging, {
        vapidKey: vapidKey,
        serviceWorkerRegistration: registration,
      });

      if (token) {
        // Save token under the correct path: artifacts/{appId}/users/{uid}/fcm_tokens/{token}
        const tokenRef = doc(db as any, "artifacts", appId, "users", userId, "fcm_tokens", token);

        await setDoc(tokenRef, {
          token: token,
          createdAt: new Date(),
          device: navigator.userAgent,
        });

        console.log("FCM Token registered:", token);
        return token;
      }
    } else {
      console.log("Notification permission denied");
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
  }
  return null;
}
