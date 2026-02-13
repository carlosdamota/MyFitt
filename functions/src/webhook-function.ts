import { onRequest } from "firebase-functions/v2/https";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";
import type { Request, Response } from "express";
import type Stripe from "stripe";
import { billingCollection } from "./data.js";

type PlanType = "free" | "pro";

interface WebhookDeps {
  db: Firestore;
  auth: Auth;
  appId: string;
  stripe: Stripe;
  stripeWebhookSecret: string;
}

export const createStripeWebhookFunction = ({
  db,
  auth,
  appId,
  stripe,
  stripeWebhookSecret,
}: WebhookDeps) => {
  const updatePlanForCustomer = async (customerId: string, isPro: boolean, subscriptionId?: string) => {
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
  };

  return onRequest({ timeoutSeconds: 60, invoker: "public" }, async (req: Request, res: Response) => {
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
            await updatePlanForCustomer(String(session.customer), true, String(session.subscription));
          }
          break;
        }
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const isActive = subscription.status === "active" || subscription.status === "trialing";
          await updatePlanForCustomer(String(subscription.customer), isActive, subscription.id);
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
  });
};
