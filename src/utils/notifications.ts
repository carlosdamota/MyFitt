import { getToken } from "firebase/messaging";
import { messaging, db } from "../config/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function requestNotificationPermission(userId: string) {
  if (!messaging) {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Get FCM Token
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

      if (!vapidKey) {
        console.warn("VITE_FIREBASE_VAPID_KEY is missing. Push notifications won't work.");
        return null;
      }

      const token = await getToken(messaging, {
        vapidKey: vapidKey,
      });

      if (token) {
        // Save token to user profile
        const tokenRef = doc(db as any, "users", userId, "fcm_tokens", token);

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
