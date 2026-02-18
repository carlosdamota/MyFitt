import { user as authUser } from "firebase-functions/v1/auth";
import type { UserRecord } from "firebase-functions/v1/auth";
import { onRequest } from "firebase-functions/v2/https";
import type { Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";
import type Stripe from "stripe";
import { getAllowedOrigins, isOriginAllowed, setCors, sendJson, requireAuth } from "./http.js";
import { billingCollection } from "./data.js";

interface AccountDeletionDeps {
  db: Firestore;
  auth: Auth;
  appId: string;
  stripe: Stripe;
  webOrigin: string;
}

/** Recursively delete all documents in a subcollection */
const deleteSubcollection = async (
  db: Firestore,
  parentRef: FirebaseFirestore.DocumentReference,
  subcollectionName: string,
) => {
  const snapshot = await parentRef.collection(subcollectionName).limit(500).get();
  if (snapshot.empty) return;

  const batch = db.batch();
  for (const doc of snapshot.docs) {
    batch.delete(doc.ref);
  }
  await batch.commit();

  // Recurse in case there are more than 500 docs
  if (snapshot.size === 500) {
    await deleteSubcollection(db, parentRef, subcollectionName);
  }
};

export const createAccountDeletionFunctions = ({
  db,
  auth,
  appId,
  stripe,
  webOrigin,
}: AccountDeletionDeps) => {
  // --- 1. Auth trigger: clean up user data when account is deleted ---
  const onAccountDeleted = authUser().onDelete(async (userRecord: UserRecord) => {
    const uid = userRecord.uid;
    console.log(`[Account Deletion] Cleaning up data for user: ${uid}`);

    const userDocRef = db.collection("artifacts").doc(appId).collection("users").doc(uid);

    // Cancel Stripe subscription if any
    try {
      const customerDoc = await billingCollection(db, appId, uid).doc("customer").get();
      const stripeCustomerId = customerDoc.data()?.stripeCustomerId as string | undefined;

      if (stripeCustomerId) {
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: "active",
        });

        for (const sub of subscriptions.data) {
          await stripe.subscriptions.cancel(sub.id);
          console.log(`[Account Deletion] Canceled Stripe subscription: ${sub.id}`);
        }
      }
    } catch (err) {
      console.error("[Account Deletion] Error canceling Stripe subscription:", err);
      // Continue with data deletion even if Stripe fails
    }

    // Delete all known subcollections
    const subcollections = ["app_data", "routines", "nutrition_logs", "billing", "fcm_tokens"];

    for (const sub of subcollections) {
      try {
        await deleteSubcollection(db, userDocRef, sub);
        console.log(`[Account Deletion] Deleted subcollection: ${sub}`);
      } catch (err) {
        console.error(`[Account Deletion] Error deleting ${sub}:`, err);
      }
    }

    // Delete the user document itself
    try {
      await userDocRef.delete();
      console.log(`[Account Deletion] Deleted user document for: ${uid}`);
    } catch (err) {
      console.error("[Account Deletion] Error deleting user document:", err);
    }

    console.log(`[Account Deletion] Cleanup complete for user: ${uid}`);
  });

  // --- 2. HTTP endpoint: store anonymous deletion feedback ---
  const submitDeletionFeedback = onRequest(
    { timeoutSeconds: 30, invoker: "public" },
    async (req, res) => {
      const allowedOrigins = getAllowedOrigins(webOrigin);
      setCors(req.headers.origin, res, allowedOrigins);

      if (!isOriginAllowed(req.headers.origin, allowedOrigins)) {
        sendJson(res, 403, { error: "origin_not_allowed" });
        return;
      }
      if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
      }
      if (req.method !== "POST") {
        sendJson(res, 405, { error: "method_not_allowed" });
        return;
      }

      try {
        // Verify the user is authenticated (they're about to delete their account)
        await requireAuth(req, auth);

        const { reason, comment } = req.body || {};

        if (!reason || typeof reason !== "string") {
          sendJson(res, 400, { error: "missing_reason" });
          return;
        }

        // Store feedback anonymously — no uid stored
        await db
          .collection("artifacts")
          .doc(appId)
          .collection("deletion_feedback")
          .add({
            reason: reason.slice(0, 200),
            comment: typeof comment === "string" ? comment.slice(0, 1000) : null,
            createdAt: new Date().toISOString(),
          });

        sendJson(res, 200, { ok: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : "unknown_error";
        sendJson(res, 500, { error: "feedback_failed", message });
      }
    },
  );

  return { onAccountDeleted, submitDeletionFeedback };
};
