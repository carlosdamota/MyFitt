import { onRequest } from "firebase-functions/v2/https";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";
import type { Request, Response } from "express";
import type Stripe from "stripe";
import { billingCollection } from "./data.js";
import { getPostHogClient } from "./utils/posthog.js";

type PlanType = "free" | "pro";

interface WebhookDeps {
  db: Firestore;
  auth: Auth;
  appId: string;
  stripe: Stripe;
  stripeWebhookSecret: string;
  sendProSubscriptionEmail: (userId: string, isSubscribing: boolean) => Promise<void>;
}

export const createStripeWebhookFunction = ({
  db,
  auth,
  appId,
  stripe,
  stripeWebhookSecret,
  sendProSubscriptionEmail,
}: WebhookDeps) => {
  const updatePlanForCustomer = async (
    customerId: string,
    isPro: boolean,
    subscriptionId?: string,
  ) => {
    const userQuery = await db
      .collectionGroup("billing")
      .where("stripeCustomerId", "==", customerId)
      .limit(1)
      .get();

    if (userQuery.empty) return;

    const customerDoc = userQuery.docs[0];
    const uid = customerDoc.ref.parent.parent?.id;
    if (!uid) return;

    const plan: PlanType = isPro ? "pro" : "free";
    await auth.setCustomUserClaims(uid, { plan });
    await billingCollection(db, appId, uid)
      .doc("entitlement")
      .set(
        {
          plan,
          subscriptionId: subscriptionId ?? null,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

    // --- Send commercial email on plan change ---
    try {
      if (typeof sendProSubscriptionEmail === "function") {
        await sendProSubscriptionEmail(uid, isPro);
      }
    } catch (err) {
      // Non-critical: log and continue
      console.error("Failed to send Pro email:", err);
    }
  };

  return onRequest(
    { timeoutSeconds: 60, invoker: "public" },
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"] as string | undefined;
      if (!sig || !stripeWebhookSecret) {
        res.status(400).send("missing_signature");
        return;
      }

      let event: Stripe.Event;
      try {
        const payload = (req as any).rawBody;
        event = stripe.webhooks.constructEvent(payload, sig, stripeWebhookSecret);
      } catch {
        res.status(400).send("invalid_signature");
        return;
      }

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            if (session.customer) {
              const customerId = String(session.customer);
              await updatePlanForCustomer(customerId, true, String(session.subscription));

              // Track Revenue in PostHog
              try {
                const userQuery = await db
                  .collectionGroup("billing")
                  .where("stripeCustomerId", "==", customerId)
                  .limit(1)
                  .get();

                if (!userQuery.empty) {
                  const uid = userQuery.docs[0].ref.parent.parent?.id;
                  if (uid) {
                    const ph = getPostHogClient();
                    ph.capture({
                      distinctId: uid,
                      event: "payment_succeeded",
                      properties: {
                        amount: (session.amount_total || 0) / 100, // Normalize cents to units
                        currency: session.currency,
                        checkout_session_id: session.id,
                      },
                    });
                  }
                }
              } catch (phError) {
                console.error("Failed to track payment in PostHog:", phError);
              }
            }
            break;
          }
          case "customer.subscription.created":
          case "customer.subscription.updated":
          case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const isActive = subscription.status === "active" || subscription.status === "trialing";
            const customerId = String(subscription.customer);
            await updatePlanForCustomer(customerId, isActive, subscription.id);

            // Track Subscription Change in PostHog
            try {
              const userQuery = await db
                .collectionGroup("billing")
                .where("stripeCustomerId", "==", customerId)
                .limit(1)
                .get();

              if (!userQuery.empty) {
                const uid = userQuery.docs[0].ref.parent.parent?.id;
                if (uid) {
                  const ph = getPostHogClient();
                  ph.capture({
                    distinctId: uid,
                    event: "subscription_status_changed",
                    properties: {
                      status: subscription.status,
                      is_active: isActive,
                      subscription_id: subscription.id,
                    },
                  });
                }
              }
            } catch (phError) {
              console.error("Failed to track subscription change in PostHog:", phError);
            }
            break;
          }
          default:
            break;
        }
      } catch {
        res.status(500).send("webhook_failed");
        return;
      }

      res.status(200).send("ok");
    },
  );
};
