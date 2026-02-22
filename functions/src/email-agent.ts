import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { Resend } from "resend";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import type { Request, Response } from "express";

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

  /** Wrap body with an unsubscribe footer (for commercial emails only) */
  const wrapWithFooter = (bodyHtml: string, isSecurity: boolean): string => {
    if (isSecurity) return bodyHtml;

    const settingsUrl = `${webOrigin}/#/profile`;
    return `${bodyHtml}
<br><hr style="border:none;border-top:1px solid #334155;margin:24px 0 12px">
<p style="font-size:11px;color:#94a3b8;text-align:center;margin:0">
  ¿No quieres recibir estos emails?
  <a href="${settingsUrl}" style="color:#22d3ee;text-decoration:underline">Gestionar preferencias</a>
</p>
<p style="font-size:10px;color:#64748b;text-align:center;margin:4px 0 0">
  FitManual — Tu compañero de entrenamiento
</p>`;
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
        subject: "Te echamos de menos en FitManual 💪",
        body_html:
          `<p>Hola <strong>${safeName}</strong>,</p><p>Hace unos días que no entrenas. Vuelve con una sesión corta de 15 minutos para retomar el ritmo.</p><p><strong>Tu próxima mejora empieza hoy.</strong></p>`,
      },
      {
        subject: "Tu próxima sesión está a un clic 🚀",
        body_html:
          `<p>Hola <strong>${safeName}</strong>,</p><p>Sabemos que mantener la constancia cuesta. Abre FitManual y completa un entrenamiento rápido para recuperar tu progreso.</p><p><strong>Pequeños pasos, grandes resultados.</strong></p>`,
      },
      {
        subject: "No rompas tu progreso 📈",
        body_html:
          `<p>Hola <strong>${safeName}</strong>,</p><p>Llevas más de una semana sin entrenar. Haz una sesión ligera hoy para volver a la rutina sin presión.</p><p><strong>Tu yo de mañana te lo agradecerá.</strong></p>`,
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

  /** Send an email via Resend (with opt-out guard) */
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

    const settingsUrl = `${webOrigin}/#/profile`;
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
      html: wrapWithFooter(content.body_html, skipOptOutCheck),
      headers,
    });
  };

  /** Call Gemini to generate email content */
  const generateEmailContent = async (context: string, prompt: string): Promise<EmailContent> => {
    if (!geminiApiKey) {
      logger.error("Gemini API Key missing, using fallback");
      return { subject: "FitManual", body_html: "<p>Check your app.</p>" };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `You are an AI copywriter for a fitness app called 'FitManual'.
Context: ${context}
Task: ${prompt}
Return ONLY valid JSON: {"subject":"...","body_html":"..."}
Tone: professional, encouraging, concise.
Format body_html with <p>, <strong>, <br>. Max 150 words.`,
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
        subject: "Update from FitManual",
        body_html: "<p>You have a pending update in FitManual.</p>",
      };
    }
  };

  // ─── 1. WELCOME EMAIL (Firestore trigger on profile creation) ─────
  // Triggers when a user completes onboarding and their profile is created
  const sendWelcomeEmail = onDocumentCreated(
    `artifacts/${appId}/users/{userId}/app_data/profile`,
    async (event) => {
      const snapshot = event.data;
      if (!snapshot) return;

      const userId = event.params.userId;
      const profileData = snapshot.data();
      let email = profileData?.email as string | undefined;
      let name = (profileData?.displayName as string) || "Athlete";

      logger.info("Welcome email trigger fired", {
        userId,
        hasProfileEmail: Boolean(email),
      });

      // Frontend profile docs do not always persist email/displayName.
      // Fallback to Firebase Auth so welcome email can still be delivered.
      if (!email || !profileData?.displayName) {
        try {
          const userRecord = await auth.getUser(userId);
          email = email || userRecord.email || undefined;
          name = profileData?.displayName || userRecord.displayName || "Athlete";
        } catch (err) {
          logger.error(`Failed to load auth user ${userId} for welcome email`, err);
        }
      }

      if (!email) {
        logger.warn(`Welcome email skipped for user ${userId}: no email available`);
        return;
      }

      const content = await generateEmailContent(
        `New user: ${name}`,
        "Write a warm welcome email. Introduce FitManual as their ultimate training companion. Include a CTA to open the app.",
      );

      try {
        await sendEmail(email, content);
        logger.info(`Welcome email sent to ${email}`);
      } catch (err) {
        logger.error(`Failed welcome email to ${email}`, err);
      }
    },
  );

  // ─── 2. WEEKLY RE-ENGAGEMENT (Scheduled) ──────────────────────────
  const weeklyReengagement = onSchedule({ schedule: "every sunday 10:00", timeZone: campaignTimeZone }, async () => {
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
  });

  // ─── 2b. PUSH RE-ENGAGEMENT QUEUE (Scheduled) ─────────────────────
  // Creates notification docs for users inactive for 3+ days.
  // push-agent function delivers these notifications to registered devices.
  const queuePushReengagement = onSchedule({ schedule: "every day 18:00", timeZone: campaignTimeZone }, async () => {
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
  });

  // ─── 2c. FIRST-WORKOUT NUDGE QUEUE (Scheduled) ────────────────────
  // Nudges users that completed onboarding but still have no first workout logged.
  const queueFirstWorkoutNudge = onSchedule({ schedule: "every day 12:00", timeZone: campaignTimeZone }, async () => {
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
      if (!profile || profile.pushEnabled === false || profile.onboardingCompleted !== true) continue;

      const hasWorkout = Boolean(profile.lastWorkoutDate?.toDate?.());
      if (hasWorkout) continue;

      const updatedAtRaw = profile.updatedAt;
      const updatedAt =
        typeof updatedAtRaw === "string" ? new Date(updatedAtRaw) : updatedAtRaw?.toDate?.() ?? null;
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
          body: "Empieza con una sesión corta hoy y activa tu progreso en FitManual.",
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
  });

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
            subject = "🔐 New sign-in to your FitManual account";
            body = `<p>Hi <strong>${name}</strong>,</p>
              <p>We detected a new sign-in to your FitManual account.</p>
              <p><strong>Device:</strong> ${metadata?.device || "Unknown"}<br>
              <strong>Time:</strong> ${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</p>
              <p>If this wasn't you, please change your password immediately.</p>`;
            break;

          case "password_changed":
            subject = "🔑 Password changed on your FitManual account";
            body = `<p>Hi <strong>${name}</strong>,</p>
              <p>Your password was successfully changed.</p>
              <p>If you didn't make this change, contact support immediately.</p>`;
            break;

          default:
            subject = "🔔 Security alert from FitManual";
            body = `<p>Hi <strong>${name}</strong>,</p>
              <p>There was a security event on your account. If you didn't initiate this, please contact support.</p>`;
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
          `User: ${name} just subscribed to FitManual Pro.`,
          "Write a congratulatory email welcoming them to Pro. Highlight unlimited routines, advanced AI coach, nutrition analysis.",
        );
      } else {
        content = await generateEmailContent(
          `User: ${name} cancelled their FitManual Pro subscription.`,
          "Write a respectful cancellation confirmation. Mention they can still use free features. Include a subtle CTA to re-subscribe.",
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
    sendSecurityAlert,
    sendProSubscriptionEmail,
  };
};
