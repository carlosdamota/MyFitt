import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { Resend } from "resend";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import type { Request, Response } from "express";
import { getPostHogClient } from "./utils/posthog";

// ─── Types ──────────────────────────────────────────────────────────
interface EmailAgentDeps {
  geminiApiKey: string;
  resendApiKey: string;
  fromEmail: string;
  webOrigin: string;
  appId: string;
}

interface EmailContent {
  subject: string;
  body_html: string;
}

// ─── Factory ────────────────────────────────────────────────────────
export const createEmailAgentFunctions = ({
  geminiApiKey,
  resendApiKey,
  fromEmail,
  webOrigin,
  appId,
}: EmailAgentDeps) => {
  const db = getFirestore();
  const auth = getAuth();
  const campaignTimeZone = process.env.CAMPAIGN_TIME_ZONE || "Europe/Madrid";

  // Lazy init: Resend throws if key is empty, but during deploy analysis env vars aren't loaded
  let _resend: Resend | null = null;
  const getResend = () => {
    if (!_resend) _resend = new Resend(resendApiKey);
    return _resend;
  };

  // ── Helpers ───────────────────────────────────────────────────────

  /** Check if user opted out of emails */
  const isEmailOptedOut = async (userId: string): Promise<boolean> => {
    const profileSnap = await db
      .collection("artifacts")
      .doc(appId)
      .collection("users")
      .doc(userId)
      .collection("app_data")
      .doc("profile")
      .get();
    return profileSnap.data()?.emailOptOut === true;
  };

  /** Wrap body with a professional, branded HTML template */
  const wrapWithFittwizTemplate = (
    bodyHtml: string,
    isSecurity: boolean,
    title: string,
    ctaText: string = "ABRIR FITTWIZ",
  ): string => {
    // WEB_ORIGIN can be a comma-separated list of URLs. Select the first valid origin.
    const allowedOrigins = webOrigin
      .split(",")
      .map((url) => url.trim().replace(/\/$/, ""))
      .filter(Boolean);
    const cleanOrigin =
      allowedOrigins.find((o) => o.includes("fittwiz.app")) ||
      allowedOrigins.find((o) => o.startsWith("https://") && !o.includes("localhost")) ||
      allowedOrigins[0] ||
      "https://fittwiz.app";
    const appUrl = `${cleanOrigin}/app`;
    const settingsUrl = `${cleanOrigin}/app/profile`;

    // Email clients often strip <style> tags when translating. All styles must be inline.
    const containerStyle =
      "max-width: 600px; margin: 40px auto; background-color: #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;";
    const headerStyle =
      "background-color: #0f172a; padding: 24px; text-align: center; border-bottom: 1px solid #334155;";
    const logoStyle =
      "color: #f8fafc; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; text-decoration: none; margin: 0;";
    const logoSpanStyle = "color: #ef4444;";
    const contentStyle =
      "padding: 32px 24px; font-size: 16px; line-height: 1.6; color: #cbd5e1; background-color: #1e293b;";
    const titleStyle =
      "color: #f8fafc; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 20px;";
    const ctaContainerStyle = "text-align: center; margin-top: 32px; margin-bottom: 16px;";
    const ctaButtonStyle =
      "display: inline-block; background-color: #dc2626; color: #ffffff; font-weight: 600; font-size: 16px; text-decoration: none; padding: 14px 28px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.5px;";
    const footerStyle =
      "text-align: center; padding: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #334155; background-color: #1e293b;";
    const footerLinkStyle = "color: #94a3b8; text-decoration: underline;";

    // We inject inline styles directly into the bodyHtml paragraphs
    const styledBodyHtml = bodyHtml
      .replace(/<p>/g, '<p style="margin-top: 0; margin-bottom: 16px;">')
      .replace(/<strong>/g, '<strong style="color: #f8fafc; font-weight: 600;">')
      .replace(/<b>/g, '<b style="color: #f8fafc; font-weight: 600;">');

    const template = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; -webkit-font-smoothing: antialiased;">
  <div style="${containerStyle}">
    <div style="${headerStyle}">
      <p style="${logoStyle}">FITT<span style="${logoSpanStyle}">WIZ</span></p>
    </div>
    <div style="${contentStyle}">
      <h1 style="${titleStyle}">${title}</h1>
      ${styledBodyHtml}
      
      ${
        !isSecurity
          ? `
      <div style="${ctaContainerStyle}">
        <a href="${appUrl}" style="${ctaButtonStyle}">${ctaText}</a>
      </div>`
          : ""
      }
    </div>
    <div style="${footerStyle}">
      <p style="margin: 0; margin-bottom: 8px;">FittWiz &copy; ${new Date().getFullYear()} — Tu compañero de entrenamiento IA</p>
      ${
        !isSecurity
          ? `<p style="margin: 0;">¿No quieres recibir estos correos? <a href="${settingsUrl}" style="${footerLinkStyle}">Gestionar preferencias</a></p>`
          : ""
      }
    </div>
  </div>
</body>
</html>`;

    return template;
  };

  const hashString = (value: string): number => {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const pickTemplate = (userId: string, displayName: string): EmailContent => {
    const safeName = displayName || "Athlete";
    const templates: EmailContent[] = [
      {
        subject: "Te echamos de menos en FittWiz 💪",
        body_html: `<p>Hola <strong>${safeName}</strong>,</p><p>Hace unos días que no entrenas. Vuelve con una sesión corta de 15 minutos para retomar el ritmo.</p><p><strong>Tu próxima mejora empieza hoy.</strong></p>`,
      },
      {
        subject: "Tu próxima sesión está a un clic 🚀",
        body_html: `<p>Hola <strong>${safeName}</strong>,</p><p>Sabemos que mantener la constancia cuesta. Abre FittWiz y completa un entrenamiento rápido para recuperar tu progreso.</p><p><strong>Pequeños pasos, grandes resultados.</strong></p>`,
      },
      {
        subject: "No rompas tu progreso 📈",
        body_html: `<p>Hola <strong>${safeName}</strong>,</p><p>Llevas más de una semana sin entrenar. Haz una sesión ligera hoy para volver a la rutina sin presión.</p><p><strong>Tu yo de mañana te lo agradecerá.</strong></p>`,
      },
    ];

    return templates[hashString(userId) % templates.length];
  };

  const getWeekKey = (date: Date): string => {
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const dayMs = 24 * 60 * 60 * 1000;
    const dayOfYear = Math.floor((date.getTime() - yearStart.getTime()) / dayMs) + 1;
    const week = Math.ceil(dayOfYear / 7);
    return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
  };

  const outreachLimitPerWeek = 3;

  const acquireOutreachSlot = async (profileRef: any, now: Date): Promise<boolean> => {
    const currentWeek = getWeekKey(now);

    return db.runTransaction(async (tx) => {
      const profileSnap: any = await tx.get(profileRef as any);
      const profile = profileSnap.data?.() || {};

      const weekKey = profile.outreachWeekKey as string | undefined;
      const weekCount = Number(profile.outreachWeekCount ?? 0);

      if (weekKey === currentWeek && weekCount >= outreachLimitPerWeek) {
        return false;
      }

      if (weekKey !== currentWeek) {
        tx.set(
          profileRef,
          {
            outreachWeekKey: currentWeek,
            outreachWeekCount: 1,
            outreachLastSentAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      } else {
        tx.set(
          profileRef,
          {
            outreachWeekCount: FieldValue.increment(1),
            outreachLastSentAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      }

      return true;
    });
  };

  const recordCampaignStats = async (
    campaign: string,
    payload: Record<string, number>,
  ): Promise<void> => {
    const now = new Date();
    const dateKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;

    const statsRef = db
      .collection("artifacts")
      .doc(appId)
      .collection("system")
      .doc("notification_campaign_metrics")
      .collection("daily")
      .doc(`${campaign}_${dateKey}`);

    const updates: Record<string, unknown> = {
      campaign,
      dateKey,
      updatedAt: FieldValue.serverTimestamp(),
    };

    for (const [key, value] of Object.entries(payload)) {
      updates[key] = FieldValue.increment(value);
    }

    await statsRef.set(updates, { merge: true });
  };

  const recordCampaignSnapshot = async (
    campaign: string,
    payload: Record<string, number>,
  ): Promise<void> => {
    const snapshotRef = db
      .collection("artifacts")
      .doc(appId)
      .collection("system")
      .doc("notification_campaign_metrics")
      .collection("latest")
      .doc(campaign);

    await snapshotRef.set(
      {
        campaign,
        ...payload,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  };

  const persistCampaignMetrics = async (
    campaign: string,
    payload: Record<string, number>,
  ): Promise<void> => {
    await recordCampaignStats(campaign, payload);
    await recordCampaignSnapshot(campaign, payload);
  };

  /** Send an email via Resend (with opt-out guard + List-Unsubscribe header) */
  const sendEmail = async (
    to: string,
    content: EmailContent,
    userId?: string,
    skipOptOutCheck = false,
  ) => {
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (!skipOptOutCheck && userId) {
      const optedOut = await isEmailOptedOut(userId);
      if (optedOut) {
        logger.info(`User ${userId} opted out of emails, skipping.`);
        return;
      }
    }

    const allowedOrigins = webOrigin
      .split(",")
      .map((url) => url.trim().replace(/\/$/, ""))
      .filter(Boolean);
    const cleanOrigin =
      allowedOrigins.find((o) => o.includes("fittwiz.app")) ||
      allowedOrigins.find((o) => o.startsWith("https://") && !o.includes("localhost")) ||
      allowedOrigins[0] ||
      "https://fittwiz.app";
    const settingsUrl = `${cleanOrigin}/app/profile`;
    const headers: Record<string, string> = {};

    // Add List-Unsubscribe header for commercial emails (email clients use this natively)
    if (!skipOptOutCheck) {
      headers["List-Unsubscribe"] = `<${settingsUrl}>`;
      headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
    }

    await getResend().emails.send({
      from: fromEmail,
      to,
      subject: content.subject,
      html: wrapWithFittwizTemplate(content.body_html, skipOptOutCheck, content.subject),
      headers,
    });

    if (userId) {
      const ph = getPostHogClient();
      ph.capture({
        distinctId: userId,
        event: "email_sent",
        properties: {
          subject: content.subject,
          type: skipOptOutCheck ? "security" : "marketing",
        },
      });
    }
  };

  /** Call Gemini to generate email content */
  const generateEmailContent = async (context: string, prompt: string): Promise<EmailContent> => {
    if (!geminiApiKey) {
      logger.error("Gemini API Key missing, using fallback");
      return {
        subject: "¡Bienvenido a FITTWIZ! 🚀 Tu transformación empieza hoy",
        body_html: `
          <p>¡Hola! Te damos la bienvenida a <strong>FITTWIZ</strong>.</p>
          <p>Gracias por confiar en nosotros para alcanzar tus objetivos de fitness. Estamos preparando todo para que tu experiencia sea increíble.</p>
          <p>Entra en la app ahora para descubrir tu plan personalizado.</p>
        `,
      };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `You are an expert AI copywriter for an elite fitness app called 'FITTWIZ'.
Context: ${context}
Task: ${prompt}
Return ONLY valid JSON: {"subject":"...","body_html":"..."}
Tone: professional, high-energy, motivating, personal, and concise.
CRITICAL INSTRUCTIONS FOR 'body_html':
- Return pure, clean HTML paragraphs (<p>).
- Use <b> or <strong> for emphasis.
- DO NOT wrap the text in full HTML documents, body tags, or boilerplate. Just the raw paragraphs.
- Keep it under 100 words. Make every word count.`,
            },
          ],
        },
      ],
      generationConfig: { responseMimeType: "application/json" },
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Gemini ${response.status}`);

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty Gemini response");
      return JSON.parse(text) as EmailContent;
    } catch (error) {
      logger.error("Gemini email generation failed:", error);
      return {
        subject: "Novedades importantes en FITTWIZ",
        body_html:
          "<p>Tienes una actualización pendiente en FITTWIZ. Entra para ver los detalles.</p>",
      };
    }
  };

  // ─── 1. WELCOME EMAIL (Firestore trigger on profile creation) ─────
  // Triggers when a user completes onboarding and their profile is created
  const sendWelcomeEmail = onDocumentCreated(
    `artifacts/${appId}/users/{userId}/app_data/profile`,
    async (event) => {
      const snapshot = event.data;
      const userId = event.params.userId;

      logger.info(`[sendWelcomeEmail] Trigger fired for user: ${userId}`, {
        eventId: event.id,
        timestamp: event.time,
      });

      if (!snapshot) {
        logger.warn(`[sendWelcomeEmail] No snapshot data for user ${userId}`);
        return;
      }

      try {
        const profileData = snapshot.data();
        let email = profileData?.email as string | undefined;
        let name = (profileData?.displayName as string) || "Athlete";

        logger.info(`[sendWelcomeEmail] Processing profile for ${userId}`, {
          hasProfileEmail: Boolean(email),
          displayName: name,
        });

        // Frontend profile docs do not always persist email/displayName.
        // Fallback to Firebase Auth so welcome email can still be delivered.
        if (!email || !profileData?.displayName) {
          try {
            const userRecord = await auth.getUser(userId);
            email = email || userRecord.email || undefined;
            name = profileData?.displayName || userRecord.displayName || "Athlete";
            logger.info(`[sendWelcomeEmail] Fetched auth data for ${userId}`, {
              foundEmail: Boolean(email),
            });
          } catch (err) {
            logger.error(`[sendWelcomeEmail] Failed to load auth user ${userId}`, err);
          }
        }

        if (!email) {
          logger.warn(`[sendWelcomeEmail] Skipped for user ${userId}: no email available`);
          return;
        }

        const content = await generateEmailContent(
          `New user welcome email`,
          "Write a high-energy welcome email IN SPANISH. Introduce FITTWIZ as the most advanced AI-powered workout companion. Emphasize that we're going to transform their fitness journey together. Include a clear and motivating CTA to open the app and start their first session. CRITICAL: DO NOT use or infer any names, address the user generally (e.g., 'Hola atleta', 'Bienvenido/a').",
        );

        await sendEmail(email, content);
        logger.info(`[sendWelcomeEmail] Sent to ${email}`);
      } catch (err) {
        logger.error(`[sendWelcomeEmail] CRITICAL FAILURE for user ${userId}`, err);
      }
    },
  );

  // ─── 2. WEEKLY RE-ENGAGEMENT (Scheduled) ──────────────────────────
  const weeklyReengagement = onSchedule(
    { schedule: "every sunday 10:00", timeZone: campaignTimeZone },
    async () => {
      logger.info("Running weekly re-engagement scan...", { campaignTimeZone });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const cooldownMs = 7 * 24 * 60 * 60 * 1000;
      const maxEmailsPerRun = 80;

      const usersRef = db.collection("artifacts").doc(appId).collection("users");
      const usersSnap = await usersRef.listDocuments();

      let sentCount = 0;
      let skippedCooldown = 0;
      let skippedOutreachCap = 0;

      for (const userDocRef of usersSnap) {
        if (sentCount >= maxEmailsPerRun) break;

        const profileRef = userDocRef.collection("app_data").doc("profile");
        const profileSnap = await profileRef.get();
        const profile = profileSnap.data();
        if (!profile || !profile.email || profile.emailOptOut) continue;

        const lastWorkout = profile.lastWorkoutDate?.toDate?.() ?? null;
        if (!lastWorkout || lastWorkout >= sevenDaysAgo) continue;

        const lastSentAt = profile.reengagementLastSentAt?.toDate?.() ?? null;
        if (lastSentAt && Date.now() - lastSentAt.getTime() < cooldownMs) {
          skippedCooldown++;
          continue;
        }

        const now = new Date();
        const hasOutreachSlot = await acquireOutreachSlot(profileRef, now);
        if (!hasOutreachSlot) {
          skippedOutreachCap++;
          continue;
        }

        const content = pickTemplate(userDocRef.id, profile.displayName || "Athlete");

        try {
          await sendEmail(profile.email, content, userDocRef.id);
          await profileRef.set({ reengagementLastSentAt: now }, { merge: true });
          sentCount++;
          logger.info(`Re-engagement email sent to ${profile.email}`);
        } catch (err) {
          logger.error(`Failed re-engagement to ${profile.email}`, err);
        }
      }

      logger.info("Weekly re-engagement completed", {
        sentCount,
        skippedCooldown,
        skippedOutreachCap,
        scannedUsers: usersSnap.length,
        maxEmailsPerRun,
      });

      if (sentCount === 0) {
        logger.warn("Weekly re-engagement sent 0 emails", {
          skippedCooldown,
          skippedOutreachCap,
          scannedUsers: usersSnap.length,
        });
      }

      await persistCampaignMetrics("weekly_reengagement_email", {
        sentCount,
        skippedCooldown,
        skippedOutreachCap,
        scannedUsers: usersSnap.length,
      });
    },
  );

  // ─── 2b. PUSH RE-ENGAGEMENT QUEUE (Scheduled) ─────────────────────
  // Creates notification docs for users inactive for 3+ days.
  // push-agent function delivers these notifications to registered devices.
  const queuePushReengagement = onSchedule(
    { schedule: "every day 18:00", timeZone: campaignTimeZone },
    async () => {
      logger.info("Running push re-engagement queue...", { campaignTimeZone });

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const pushCooldownMs = 3 * 24 * 60 * 60 * 1000;
      const maxPushQueuedPerRun = 120;

      const usersRef = db.collection("artifacts").doc(appId).collection("users");
      const usersSnap = await usersRef.listDocuments();

      let queuedCount = 0;
      let skippedCooldown = 0;
      let skippedOutreachCap = 0;

      for (const userDocRef of usersSnap) {
        if (queuedCount >= maxPushQueuedPerRun) break;

        const profileRef = userDocRef.collection("app_data").doc("profile");
        const profileSnap = await profileRef.get();
        const profile = profileSnap.data();
        if (!profile || profile.pushEnabled === false) continue;

        const lastWorkout = profile.lastWorkoutDate?.toDate?.() ?? null;
        if (!lastWorkout || lastWorkout >= threeDaysAgo) continue;

        const lastPushAt = profile.reengagementPushLastSentAt?.toDate?.() ?? null;
        if (lastPushAt && Date.now() - lastPushAt.getTime() < pushCooldownMs) {
          skippedCooldown++;
          continue;
        }

        const now = new Date();
        const hasOutreachSlot = await acquireOutreachSlot(profileRef, now);
        if (!hasOutreachSlot) {
          skippedOutreachCap++;
          continue;
        }

        const displayName = profile.displayName || "Athlete";
        const title = "Vuelve a entrenar hoy 💪";
        const body = `Hola ${displayName}, haz una sesión rápida y retoma tu progreso.`;

        try {
          await userDocRef.collection("notifications").add({
            title,
            body,
            url: "/app/workout",
            status: "pending",
            createdAt: new Date(),
            type: "reengagement_push",
          });

          await profileRef.set({ reengagementPushLastSentAt: now }, { merge: true });
          queuedCount++;
        } catch (err) {
          logger.error(`Failed to queue push re-engagement for user ${userDocRef.id}`, err);
        }
      }

      logger.info("Push re-engagement queue completed", {
        queuedCount,
        skippedCooldown,
        skippedOutreachCap,
        scannedUsers: usersSnap.length,
        maxPushQueuedPerRun,
      });

      if (queuedCount === 0) {
        logger.warn("Daily re-engagement push queued 0 notifications", {
          skippedCooldown,
          skippedOutreachCap,
          scannedUsers: usersSnap.length,
        });
      }

      await persistCampaignMetrics("daily_reengagement_push", {
        queuedCount,
        skippedCooldown,
        skippedOutreachCap,
        scannedUsers: usersSnap.length,
      });
    },
  );

  // ─── 2c. FIRST-WORKOUT NUDGE QUEUE (Scheduled) ────────────────────
  // Nudges users that completed onboarding but still have no first workout logged.
  const queueFirstWorkoutNudge = onSchedule(
    { schedule: "every day 12:00", timeZone: campaignTimeZone },
    async () => {
      logger.info("Running first-workout nudge queue...", { campaignTimeZone });

      const onboardingGraceMs = 2 * 24 * 60 * 60 * 1000;
      const nudgeCooldownMs = 7 * 24 * 60 * 60 * 1000;
      const maxQueuedPerRun = 80;

      const usersRef = db.collection("artifacts").doc(appId).collection("users");
      const usersSnap = await usersRef.listDocuments();

      let queuedCount = 0;
      let skippedCooldown = 0;
      let skippedOutreachCap = 0;

      for (const userDocRef of usersSnap) {
        if (queuedCount >= maxQueuedPerRun) break;

        const profileRef = userDocRef.collection("app_data").doc("profile");
        const profileSnap = await profileRef.get();
        const profile = profileSnap.data();
        if (!profile || profile.pushEnabled === false || profile.onboardingCompleted !== true)
          continue;

        const hasWorkout = Boolean(profile.lastWorkoutDate?.toDate?.());
        if (hasWorkout) continue;

        const updatedAtRaw = profile.updatedAt;
        const updatedAt =
          typeof updatedAtRaw === "string"
            ? new Date(updatedAtRaw)
            : (updatedAtRaw?.toDate?.() ?? null);
        if (!updatedAt || Number.isNaN(updatedAt.getTime())) continue;

        const now = new Date();
        if (now.getTime() - updatedAt.getTime() < onboardingGraceMs) continue;

        const lastNudgeAt = profile.firstWorkoutNudgeLastSentAt?.toDate?.() ?? null;
        if (lastNudgeAt && now.getTime() - lastNudgeAt.getTime() < nudgeCooldownMs) {
          skippedCooldown++;
          continue;
        }

        const hasOutreachSlot = await acquireOutreachSlot(profileRef, now);
        if (!hasOutreachSlot) {
          skippedOutreachCap++;
          continue;
        }

        try {
          await userDocRef.collection("notifications").add({
            title: "Tu primer entrenamiento te espera 🏁",
            body: "Empieza con una sesión corta hoy y activa tu progreso en FittWiz.",
            url: "/app/workout",
            status: "pending",
            createdAt: new Date(),
            type: "first_workout_nudge",
          });

          await profileRef.set({ firstWorkoutNudgeLastSentAt: now }, { merge: true });
          queuedCount++;
        } catch (err) {
          logger.error(`Failed to queue first-workout nudge for user ${userDocRef.id}`, err);
        }
      }

      logger.info("First-workout nudge queue completed", {
        queuedCount,
        skippedCooldown,
        skippedOutreachCap,
        scannedUsers: usersSnap.length,
        maxQueuedPerRun,
      });

      if (queuedCount === 0) {
        logger.warn("First-workout nudge queued 0 notifications", {
          skippedCooldown,
          skippedOutreachCap,
          scannedUsers: usersSnap.length,
        });
      }

      await persistCampaignMetrics("first_workout_nudge_push", {
        queuedCount,
        skippedCooldown,
        skippedOutreachCap,
        scannedUsers: usersSnap.length,
      });
    },
  );

  // ─── 2d. ONBOARDING REMINDER NUDGE (Scheduled) ────────────────────────
  // Nudges users who created their account ~24h ago but haven't completed onboarding.
  const queueOnboardingReminderNudge = onSchedule(
    { schedule: "every day 14:00", timeZone: campaignTimeZone },
    async () => {
      logger.info("Running onboarding reminder queue...", { campaignTimeZone });

      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      // Grace period of ~24h to max 48h to prevent spamming old users
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const maxQueuedPerRun = 80;

      const usersRef = db.collection("artifacts").doc(appId).collection("users");
      const usersSnap = await usersRef.listDocuments();

      let queuedCount = 0;
      let sentEmailCount = 0;
      let skippedOutreachCap = 0;

      for (const userDocRef of usersSnap) {
        if (queuedCount >= maxQueuedPerRun) break;

        const profileRef = userDocRef.collection("app_data").doc("profile");
        const profileSnap = await profileRef.get();
        const profile = profileSnap.data();

        // Check if onboarding is already completed
        if (profile?.onboardingCompleted === true) continue;

        // Verify account age (must be between 24h and 48h old)
        // If not found in profile, try to fetch from auth record
        let createdAtRaw = profile?.createdAt;
        let authEmail = profile?.email;
        let authName = profile?.displayName;

        if (!createdAtRaw || !authEmail) {
          try {
            const userRecord = await auth.getUser(userDocRef.id);
            createdAtRaw = createdAtRaw || userRecord.metadata.creationTime;
            authEmail = authEmail || userRecord.email;
            authName = authName || userRecord.displayName;
          } catch (e) {
            // User might be deleted in auth but not firestore
            continue;
          }
        }

        const createdAt =
          typeof createdAtRaw === "string"
            ? new Date(createdAtRaw)
            : (createdAtRaw?.toDate?.() ?? null);

        if (!createdAt || Number.isNaN(createdAt.getTime())) continue;

        // Skip if they are too new (less than 24h) or too old (more than 48h)
        if (createdAt > oneDayAgo || createdAt < twoDaysAgo) continue;

        // Check if we already sent this reminder
        if (profile?.onboardingReminderSentAt) continue;

        // Check if they explicitly have routines (safety check)
        const routinesSnap = await userDocRef.collection("routines").limit(1).get();
        const hasCustomRoutines = routinesSnap.docs.some((doc) => !doc.data().isDefault);
        if (hasCustomRoutines) {
          // They somehow bypassed onboarding but have routines. Mark as complete to avoid further checks.
          await profileRef.set({ onboardingCompleted: true }, { merge: true });
          continue;
        }

        const now = new Date();
        const hasOutreachSlot = await acquireOutreachSlot(profileRef, now);
        if (!hasOutreachSlot) {
          skippedOutreachCap++;
          continue;
        }

        const displayName = authName || "Atleta";
        const emailTemplate: EmailContent = {
          subject: "Tu plan de entrenamiento inteligente te espera 🚀",
          body_html: `
            <p>Hola <strong>${displayName}</strong>,</p>
            <p>Nos dimos cuenta de que creaste tu cuenta hace poco pero no has terminado de configurar tu perfil en FITTWIZ.</p>
            <p>La personalización lo es todo. Nuestro asistente IA necesita unos pocos datos sobre tu experiencia, material disponible y objetivos para diseñarte una rutina perfecta.</p>
            <p>Entra ahora, responde unas breves preguntas en menos de 1 minuto y descubre el entrenamiento que transformará tu físico.</p>
          `,
        };

        try {
          // 1. Send High-Conversion Email if they have not opted out
          if (authEmail && profile?.emailOptOut !== true) {
            await sendEmail(authEmail, emailTemplate, userDocRef.id);
            sentEmailCount++;
          }

          // 2. Queue Push Notification if push is enabled
          if (profile?.pushEnabled !== false) {
            await userDocRef.collection("notifications").add({
              title: "Termina de configurar tu cuenta ⚙️",
              body: "Descubre tu rutina ideal generada con IA en 1 minuto.",
              url: "/app/dashboard",
              status: "pending",
              createdAt: new Date(),
              type: "onboarding_reminder_push",
            });
            queuedCount++;
          }

          // Mark as sent
          await profileRef.set({ onboardingReminderSentAt: now }, { merge: true });
        } catch (err) {
          logger.error(`Failed to execute onboarding reminder for user ${userDocRef.id}`, err);
        }
      }

      logger.info("Onboarding reminder queue completed", {
        queuedCount,
        sentEmailCount,
        skippedOutreachCap,
        scannedUsers: usersSnap.length,
      });

      await persistCampaignMetrics("onboarding_reminder_nudge", {
        queuedCount,
        sentEmailCount,
        skippedOutreachCap,
        scannedUsers: usersSnap.length,
      });
    },
  );

  // ─── 3. SECURITY ALERT (HTTP endpoint) ────────────────────────────
  const sendSecurityAlert = onRequest(
    { timeoutSeconds: 30, invoker: "public" },
    async (req: Request, res: Response) => {
      if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
      }

      const { userId, alertType, metadata } = req.body ?? {};
      if (!userId || !alertType) {
        res.status(400).json({ error: "missing_fields" });
        return;
      }

      try {
        const userRecord = await auth.getUser(userId);
        const email = userRecord.email;
        if (!email) {
          res.status(404).json({ error: "no_email" });
          return;
        }

        const name = userRecord.displayName || "User";
        let subject = "";
        let body = "";

        switch (alertType) {
          case "new_login":
            subject = "🔐 Nuevo inicio de sesión en tu cuenta de FITTWIZ";
            body = `<p>Hola <strong>${name}</strong>,</p>
              <p>Hemos detectado un nuevo inicio de sesión en tu cuenta de FITTWIZ.</p>
              <p><strong>Dispositivo:</strong> ${metadata?.device || "Desconocido"}<br>
              <strong>Hora:</strong> ${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</p>
              <p>Si no has sido tú, te recomendamos cambiar tu contraseña inmediatamente para proteger tu progreso.</p>`;
            break;

          case "password_changed":
            subject = "🔑 Contraseña actualizada en FITTWIZ";
            body = `<p>Hola <strong>${name}</strong>,</p>
              <p>Tu contraseña se ha cambiado correctamente.</p>
              <p>Si no has realizado este cambio, contacta con nosotros de inmediato.</p>`;
            break;

          default:
            subject = "🔔 Alerta de seguridad de FITTWIZ";
            body = `<p>Hola <strong>${name}</strong>,</p>
              <p>Se ha producido un evento de seguridad en tu cuenta. Si no has sido tú, ponte en contacto con soporte.</p>`;
        }

        // Security emails ALWAYS skip opt-out
        await sendEmail(email, { subject, body_html: body }, userId, true);
        res.status(200).json({ ok: true });
      } catch (err) {
        logger.error("Security alert error:", err);
        res.status(500).json({ error: "send_failed" });
      }
    },
  );

  // ─── 4. COMMERCIAL: Pro Subscription/Cancellation ─────────────────
  const sendProSubscriptionEmail = async (userId: string, isSubscribing: boolean) => {
    try {
      const userRecord = await auth.getUser(userId);
      const email = userRecord.email;
      if (!email) return;

      const name = userRecord.displayName || "Athlete";

      let content: EmailContent;

      if (isSubscribing) {
        content = await generateEmailContent(
          `User: ${name} just subscribed to FITTWIZ Pro.`,
          "Write an enthusiastic congratulatory email welcoming them to the FITTWIZ Pro elite squad. Highlight that they now have full power: unlimited AI routines, deep nutrition analysis, and the full capability of the AI Coach. Use high-performance language.",
        );
      } else {
        content = await generateEmailContent(
          `User: ${name} cancelled their FITTWIZ Pro subscription.`,
          "Write a respectful cancellation confirmation. Remind them they can still reach their goals with the free version, and their progress is safe. Briefly mention the Pro features they'll miss. Include a subtle CTA to come back anytime.",
        );
      }

      await sendEmail(email, content, userId);
      logger.info(`Pro ${isSubscribing ? "welcome" : "cancellation"} email sent to ${email}`);
    } catch (err) {
      logger.error(`Failed Pro email for user ${userId}`, err);
    }
  };

  return {
    sendWelcomeEmail,
    weeklyReengagement,
    queuePushReengagement,
    queueFirstWorkoutNudge,
    queueOnboardingReminderNudge,
    sendSecurityAlert,
    sendProSubscriptionEmail,
  };
};
