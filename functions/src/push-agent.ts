import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { getMessaging } from "firebase-admin/messaging";
import { FieldValue, type Firestore } from "firebase-admin/firestore";

interface PushAgentDeps {
  db: Firestore;
  appId: string;
}

export const createPushAgentFunctions = ({ db, appId }: PushAgentDeps) => {
  const messaging = getMessaging();

  // --- Trigger: Send Push on Notification Document Creation ---
  // Listens to: artifacts/{appId}/users/{userId}/notifications/{notificationId}
  const sendPushOnNotification = onDocumentCreated(
    `artifacts/${appId}/users/{userId}/notifications/{notificationId}`,
    async (event) => {
      const snapshot = event.data;
      if (!snapshot) return;

      const notificationData = snapshot.data();
      const userId = event.params.userId;
      const { title, body, url } = notificationData;

      if (!title || !body) {
        logger.warn(`Notification ${event.params.notificationId} missing title or body`);
        return;
      }

      // Check if user has push disabled
      const profileSnap = await db
        .collection("artifacts")
        .doc(appId)
        .collection("users")
        .doc(userId)
        .collection("app_data")
        .doc("profile")
        .get();
      const profile = profileSnap.data();
      if (profile?.pushEnabled === false) {
        logger.info(`User ${userId} has push disabled, skipping`);
        return;
      }

      // Get user's FCM tokens from the correct path
      const tokensSnapshot = await db
        .collection("artifacts")
        .doc(appId)
        .collection("users")
        .doc(userId)
        .collection("fcm_tokens")
        .get();
      const tokens = tokensSnapshot.docs.map((d) => d.id);

      if (tokens.length === 0) {
        logger.info(`No FCM tokens found for user ${userId}`);
        return;
      }

      const message: any = {
        notification: {
          title,
          body,
        },
        webpush: {
          notification: {
            icon: "/icon-192x192.png",
            click_action: url || "/",
          },
          fcmOptions: {
            link: url || "/",
          },
        },
        tokens: tokens,
      };

      try {
        const response = await messaging.sendEachForMulticast(message);
        logger.info(`Sent push to ${response.successCount} devices for user ${userId}`);

        // Cleanup invalid tokens
        if (response.failureCount > 0) {
          const batch = db.batch();
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              const tokenDocRef = db
                .collection("artifacts")
                .doc(appId)
                .collection("users")
                .doc(userId)
                .collection("fcm_tokens")
                .doc(tokens[idx]);
              batch.delete(tokenDocRef);
            }
          });
          await batch.commit();
          logger.info(`Cleaned up ${response.failureCount} invalid FCM tokens`);
        }

        await snapshot.ref.update({ status: "sent", sentAt: FieldValue.serverTimestamp() });
      } catch (err) {
        logger.error(`Error sending push to user ${userId}`, err);
      }
    },
  );

  return {
    sendPushOnNotification,
  };
};
