import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from "stripe";
import { createAiGenerateFunction } from "./ai-function.js";
import { createCheckoutSessionFunction, createBillingPortalFunction } from "./billing-functions.js";
import { createStripeWebhookFunction } from "./webhook-function.js";
import { createShareImageFunction } from "./share-image-function.js";

initializeApp();

const db = getFirestore();
const auth = getAuth();

const APP_ID = process.env.FITMANUAL_APP_ID ?? "fitmanual-default";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_MODEL_DEFAULT =
  process.env.GEMINI_MODEL_DEFAULT ?? process.env.GEMINI_MODEL ?? "gemini-3-flash-preview";
const GEMINI_MODEL_NUTRITION_FREE = process.env.GEMINI_MODEL_NUTRITION_FREE ?? "gemini-2.5-flash";
const GEMINI_MODEL_NUTRITION_PRO =
  process.env.GEMINI_MODEL_NUTRITION_PRO ?? "gemini-3-flash-preview";
const FREE_MAX_DAYS = Number(process.env.FREE_MAX_DAYS ?? "2");
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
  geminiDefaultModel: GEMINI_MODEL_DEFAULT,
  geminiNutritionModelFree: GEMINI_MODEL_NUTRITION_FREE,
  geminiNutritionModelPro: GEMINI_MODEL_NUTRITION_PRO,
  quotas: {
    routine: {
      free: Number(process.env.QUOTAS_ROUTINE_FREE ?? "1"),
      pro: Number(process.env.QUOTAS_ROUTINE_PRO ?? "5"),
    },
    nutrition: {
      free: Number(process.env.QUOTAS_NUTRITION_FREE ?? "100"),
      pro: Number(process.env.QUOTAS_NUTRITION_PRO ?? "1000"),
    },
    coach: {
      free: Number(process.env.QUOTAS_COACH_FREE ?? "5"),
      pro: Number(process.env.QUOTAS_COACH_PRO ?? "1000"),
    },
    analysis: {
      free: Number(process.env.QUOTAS_ANALYSIS_FREE ?? "5"),
      pro: Number(process.env.QUOTAS_ANALYSIS_PRO ?? "1000"),
    },
  },
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

// --- Subagent Functions ---

import { createEmailAgentFunctions } from "./email-agent.js";
import { createPushAgentFunctions } from "./push-agent.js";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const EMAIL_FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev";

const emailAgentFns = createEmailAgentFunctions({
  geminiApiKey: GEMINI_API_KEY,
  resendApiKey: RESEND_API_KEY,
  fromEmail: EMAIL_FROM,
  webOrigin: WEB_ORIGIN,
  appId: APP_ID,
});

// Cloud Functions (auto-deployed)
export const sendWelcomeEmail = emailAgentFns.sendWelcomeEmail;
export const weeklyReengagement = emailAgentFns.weeklyReengagement;
export const sendSecurityAlert = emailAgentFns.sendSecurityAlert;

// Callable helper (used by webhook internally)
export const sendProSubscriptionEmail = emailAgentFns.sendProSubscriptionEmail;

export const pushAgent = createPushAgentFunctions({
  db,
  appId: APP_ID,
});

// --- Account Deletion ---

import { createAccountDeletionFunctions } from "./account-deletion.js";

const accountDeletionFns = createAccountDeletionFunctions({
  db,
  auth,
  appId: APP_ID,
  stripe,
  webOrigin: WEB_ORIGIN,
});

export const onAccountDeleted = accountDeletionFns.onAccountDeleted;
export const submitDeletionFeedback = accountDeletionFns.submitDeletionFeedback;


export const createShareImage = createShareImageFunction({
  auth,
  appId: APP_ID,
  webOrigin: WEB_ORIGIN,
});
