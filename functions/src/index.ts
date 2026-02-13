import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from "stripe";
import { createAiGenerateFunction } from "./ai-function.js";
import {
  createCheckoutSessionFunction,
  createBillingPortalFunction,
} from "./billing-functions.js";
import { createStripeWebhookFunction } from "./webhook-function.js";

initializeApp();

const db = getFirestore();
const auth = getAuth();

const APP_ID = process.env.FITMANUAL_APP_ID ?? "fitmanual-default";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3-flash-preview";
const PRO_AI_MONTHLY_QUOTA = Number(process.env.PRO_AI_MONTHLY_QUOTA ?? "100");
const FREE_AI_MONTHLY_QUOTA = Number(process.env.FREE_AI_MONTHLY_QUOTA ?? "5");
const FREE_MAX_DAYS = Number(process.env.FREE_MAX_DAYS ?? "2");
const GEMINI_MODEL_LITE = process.env.GEMINI_MODEL_LITE ?? "gemini-2.5-flash-lite";
const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const stripePricePro = process.env.STRIPE_PRICE_PRO_MONTHLY ?? "";
const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });

export const aiGenerate = createAiGenerateFunction({
  db,
  auth,
  appId: APP_ID,
  geminiApiKey: GEMINI_API_KEY,
  geminiModel: GEMINI_MODEL,
  geminiModelLite: GEMINI_MODEL_LITE,
  proAiMonthlyQuota: PRO_AI_MONTHLY_QUOTA,
  freeAiMonthlyQuota: FREE_AI_MONTHLY_QUOTA,
  freeMaxDays: FREE_MAX_DAYS,
  webOrigin: WEB_ORIGIN,
});

export const createCheckoutSession = createCheckoutSessionFunction({
  db,
  auth,
  appId: APP_ID,
  webOrigin: WEB_ORIGIN,
  stripe,
  stripePricePro,
});

export const createBillingPortal = createBillingPortalFunction({
  db,
  auth,
  appId: APP_ID,
  webOrigin: WEB_ORIGIN,
  stripe,
});

export const stripeWebhook = createStripeWebhookFunction({
  db,
  auth,
  appId: APP_ID,
  stripe,
  stripeWebhookSecret,
});
