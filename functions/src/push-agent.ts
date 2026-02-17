import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { getMessaging } from "firebase-admin/messaging";
import { getFirestore, FieldValue, type Firestore } from "firebase-admin/firestore";

interface PushAgentDeps {
  db: Firestore;
}

export const createPushAgentFunctions = ({ db }: PushAgentDeps) => {
  const messaging = getMessaging();

  // --- Trigger: Send Push on Notification Document Creation ---
  // Listens to: users/{userId}/notifications/{notificationId}
  const sendPushOnNotification = onDocumentCreated(
    "users/{userId}/notifications/{notificationId}",
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

      // specific field check if needed
      // const userData = (await db.collection("users").doc(userId).get()).data();
      // if (userData?.pushOptOut) return;

      // Get user's FCM tokens
      // Assuming structure: users/{userId}/fcmTokens/{tokenId} or array in users/{userId}
      // Let's assume a subcollection 'fcm_tokens' for scalability
      const tokensSnapshot = await db.collection(`users/${userId}/fcm_tokens`).get();
      const tokens = tokensSnapshot.docs.map((doc: { id: string }) => doc.id); // Assuming ID is the token, or doc.data().token

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
            icon: "/icon-192x192.png", // Adjust path as needed
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
          // Logic to remove failed tokens would go here
        }

        // Update notification status to 'sent'
        await snapshot.ref.update({ status: "sent", sentAt: FieldValue.serverTimestamp() });
      } catch (err) {
        logger.error(`Error sending push to user ${userId}`, err);
        // await snapshot.ref.update({ status: 'error', error: err.message });
      }
    },
  );

  return {
    sendPushOnNotification,
  };
};
