import { getToken, deleteToken } from "firebase/messaging";
import { messaging, db, appId } from "../config/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";

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

      const registration = await navigator.serviceWorker.ready;

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

        // Persist token locally so we can delete it on logout
        localStorage.setItem(`fittwiz_fcm_token_${userId}`, token);

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

/**
 * Remove the FCM token for the given user from Firestore and deregister it
 * from Firebase Messaging. Must be called before signOut so new push
 * notifications are no longer delivered to this device for the signed-out user.
 */
export async function removeNotificationToken(userId: string): Promise<void> {
  try {
    const savedToken = localStorage.getItem(`fittwiz_fcm_token_${userId}`);
    if (!savedToken) return;

    // Delete from Firestore
    if (db) {
      const tokenRef = doc(
        db as any,
        "artifacts",
        appId,
        "users",
        userId,
        "fcm_tokens",
        savedToken,
      );
      await deleteDoc(tokenRef);
    }

    // Deregister from Firebase Messaging
    if (messaging) {
      await deleteToken(messaging).catch(() => {
        // Non-fatal: token may already be expired
      });
    }

    localStorage.removeItem(`fittwiz_fcm_token_${userId}`);
    console.log("FCM Token removed on logout for user:", userId);
  } catch (error) {
    // Non-fatal: push cleanup should never block logout
    console.warn("Failed to remove FCM token on logout:", error);
  }
}
