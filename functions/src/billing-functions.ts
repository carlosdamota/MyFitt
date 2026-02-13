import { onRequest } from "firebase-functions/v2/https";
import type { Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";
import type { Request, Response } from "express";
import type Stripe from "stripe";
import {
  getAllowedOrigins,
  isOriginAllowed,
  sanitizeReturnUrl,
  setCors,
  sendJson,
  requireAuth,
} from "./http.js";
import { billingCollection } from "./data.js";

interface BillingFunctionDeps {
  db: Firestore;
  auth: Auth;
  appId: string;
  webOrigin: string;
  stripe: Stripe;
  stripePricePro: string;
}

export const createCheckoutSessionFunction = ({
  db,
  auth,
  appId,
  webOrigin,
  stripe,
  stripePricePro,
}: BillingFunctionDeps) => {
  return onRequest({ timeoutSeconds: 60, invoker: "public" }, async (req: Request, res: Response) => {
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
      const { uid } = await requireAuth(req, auth);
      if (!stripePricePro) {
        sendJson(res, 500, { error: "stripe_price_missing" });
        return;
      }
      const customerRef = billingCollection(db, appId, uid).doc("customer");
      const customerSnap = await customerRef.get();
      let customerId = customerSnap.exists ? (customerSnap.data()?.stripeCustomerId as string) : "";

      if (!customerId) {
        const customer = await stripe.customers.create({ metadata: { uid } });
        customerId = customer.id;
        await customerRef.set({ stripeCustomerId: customerId }, { merge: true });
      }

      const defaultOrigin = allowedOrigins[0] || "";
      const successUrl = sanitizeReturnUrl(req.body?.successUrl, allowedOrigins) || defaultOrigin;
      const cancelUrl = sanitizeReturnUrl(req.body?.cancelUrl, allowedOrigins) || defaultOrigin;
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: stripePricePro, quantity: 1 }],
        discounts: req.body?.couponId ? [{ coupon: String(req.body.couponId) }] : undefined,
        success_url: successUrl || "https://example.com/success",
        cancel_url: cancelUrl || "https://example.com/cancel",
        client_reference_id: uid,
        metadata: { uid },
      });

      sendJson(res, 200, { url: session.url });
    } catch (err: any) {
      if (err?.code === "resource_missing" && err?.param === "customer") {
        try {
          const { uid } = await requireAuth(req, auth);
          const customerRef = billingCollection(db, appId, uid).doc("customer");
          await customerRef.delete();
          const customer = await stripe.customers.create({ metadata: { uid } });
          const newCustomerId = customer.id;
          await customerRef.set({ stripeCustomerId: newCustomerId }, { merge: true });

          const defaultOrigin = allowedOrigins[0] || "";
          const successUrl = sanitizeReturnUrl(req.body?.successUrl, allowedOrigins) || defaultOrigin;
          const cancelUrl = sanitizeReturnUrl(req.body?.cancelUrl, allowedOrigins) || defaultOrigin;

          const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer: newCustomerId,
            line_items: [{ price: stripePricePro, quantity: 1 }],
            discounts: req.body?.couponId ? [{ coupon: String(req.body.couponId) }] : undefined,
            success_url: successUrl || "https://example.com/success",
            cancel_url: cancelUrl || "https://example.com/cancel",
            client_reference_id: uid,
            metadata: { uid },
          });

          sendJson(res, 200, { url: session.url });
          return;
        } catch (retryErr) {
          const message = retryErr instanceof Error ? retryErr.message : "unknown_retry_error";
          sendJson(res, 500, { error: "checkout_failed_retry", message });
          return;
        }
      }

      const message = err instanceof Error ? err.message : "unknown_error";
      sendJson(res, 500, { error: "checkout_failed", message });
    }
  });
};

export const createBillingPortalFunction = ({
  db,
  auth,
  appId,
  webOrigin,
  stripe,
}: Omit<BillingFunctionDeps, "stripePricePro">) => {
  return onRequest({ timeoutSeconds: 60, invoker: "public" }, async (req: Request, res: Response) => {
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
      const { uid } = await requireAuth(req, auth);
      const customerRef = billingCollection(db, appId, uid).doc("customer");
      const customerSnap = await customerRef.get();
      let customerId = customerSnap.data()?.stripeCustomerId as string | undefined;

      if (!customerId) {
        const customer = await stripe.customers.create({ metadata: { uid } });
        customerId = customer.id;
        await customerRef.set({ stripeCustomerId: customerId }, { merge: true });
      }

      const returnUrl = sanitizeReturnUrl(req.body?.returnUrl, allowedOrigins) || allowedOrigins[0] || "";
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl || "https://example.com",
      });
      sendJson(res, 200, { url: session.url });
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown_error";
      sendJson(res, 500, { error: "portal_failed", message });
    }
  });
};
