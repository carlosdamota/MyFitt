import { onRequest } from "firebase-functions/v2/https";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";
import type { Request, Response } from "express";
import type Stripe from "stripe";
import { billingCollection } from "./data.js";
import { getPostHogClient } from "./utils/posthog.js";
import type { MonitoringEventInput } from "./monitoring-functions.js";

type PlanType = "free" | "pro";

interface WebhookDeps {
  db: Firestore;
  auth: Auth;
  appId: string;
  stripe: Stripe;
  stripeWebhookSecret: string;
  sendProSubscriptionEmail: (userId: string, isSubscribing: boolean) => Promise<void>;
  enqueueMonitoringEvent?: (event: MonitoringEventInput) => Promise<void>;
}

export const createStripeWebhookFunction = ({
  db,
  auth,
  appId,
  stripe,
  stripeWebhookSecret,
  sendProSubscriptionEmail,
  enqueueMonitoringEvent,
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
        if (enqueueMonitoringEvent) {
          await enqueueMonitoringEvent({
            eventType: "stripe_webhook_invalid_signature",
            category: "technical",
            severity: "warning",
            source: "stripe",
            dedupeKey: "stripe_webhook_invalid_signature",
          });
        }
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

              if (enqueueMonitoringEvent) {
                await enqueueMonitoringEvent({
                  eventType: "payment_succeeded",
                  category: "business",
                  severity: "info",
                  source: "stripe",
                  dedupeKey: `stripe:checkout:${session.id}`,
                  context: {
                    checkoutSessionId: session.id,
                    customerId,
                    amount: (session.amount_total || 0) / 100,
                    currency: session.currency,
                  },
                });
              }

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

            if (enqueueMonitoringEvent) {
              const eventType =
                event.type === "customer.subscription.deleted"
                  ? "subscription_cancelled"
                  : isActive
                    ? "subscription_activated"
                    : "subscription_status_changed";
              await enqueueMonitoringEvent({
                eventType,
                category: "business",
                severity: event.type === "customer.subscription.deleted" ? "warning" : "info",
                source: "stripe",
                dedupeKey: `stripe:sub:${subscription.id}:${event.type}`,
                context: {
                  customerId,
                  subscriptionId: subscription.id,
                  status: subscription.status,
                  cancelAtPeriodEnd: subscription.cancel_at_period_end,
                },
              });
            }

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
          case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            const customerId = String(invoice.customer || "");
            if (enqueueMonitoringEvent) {
              await enqueueMonitoringEvent({
                eventType: "payment_failed",
                category: "business",
                severity: "warning",
                source: "stripe",
                dedupeKey: `stripe:invoice_failed:${invoice.id}`,
                context: {
                  invoiceId: invoice.id,
                  customerId,
                  amountDue: Number(invoice.amount_due || 0) / 100,
                  currency: invoice.currency,
                  attemptCount: invoice.attempt_count,
                },
              });
            }
            break;
          }
          default:
            break;
        }
      } catch {
        if (enqueueMonitoringEvent) {
          await enqueueMonitoringEvent({
            eventType: "stripe_webhook_failed",
            category: "technical",
            severity: "critical",
            source: "stripe",
            dedupeKey: `stripe_webhook_failed:${event.type}`,
            context: {
              eventType: event.type,
            },
          });
        }
        res.status(500).send("webhook_failed");
        return;
      }

      res.status(200).send("ok");
    },
  );
};
