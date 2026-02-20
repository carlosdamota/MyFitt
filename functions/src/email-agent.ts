import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { Resend } from "resend";
import { getFirestore } from "firebase-admin/firestore";
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
  FITTWIZ — Tu compañero de entrenamiento
</p>`;
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
              text: `You are an AI copywriter for a fitness app called 'FITTWIZ'.
Context: ${context}
Task: ${prompt}
Return ONLY valid JSON: {"subject":"...","body_html":"..."}
Tone: professional, high-energy, motivating, and personal.
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
          `New user: ${name}`,
          "Write a high-energy welcome email. Introduce FITTWIZ as the most advanced AI-powered workout companion. Emphasize that we're going to transform their fitness journey together. Include a clear and motivating CTA to open the app and start their first session.",
        );

        await sendEmail(email, content);
        logger.info(`[sendWelcomeEmail] Sent to ${email}`);
      } catch (err) {
        logger.error(`[sendWelcomeEmail] CRITICAL FAILURE for user ${userId}`, err);
      }
    },
  );

  // ─── 2. WEEKLY RE-ENGAGEMENT (Scheduled) ──────────────────────────
  const weeklyReengagement = onSchedule("every sunday 10:00", async () => {
    logger.info("Running weekly re-engagement scan...");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const usersRef = db.collection("artifacts").doc(appId).collection("users");
    const usersSnap = await usersRef.listDocuments();

    const candidates: { uid: string; email: string; displayName: string }[] = [];
    for (const userDocRef of usersSnap.slice(0, 100)) {
      const profileSnap = await userDocRef.collection("app_data").doc("profile").get();
      const profile = profileSnap.data();
      if (!profile || !profile.email || profile.emailOptOut) continue;

      const lastWorkout = profile.lastWorkoutDate?.toDate?.() ?? null;
      if (lastWorkout && lastWorkout < sevenDaysAgo) {
        candidates.push({
          uid: userDocRef.id,
          email: profile.email,
          displayName: profile.displayName || "Athlete",
        });
      }
      if (candidates.length >= 50) break;
    }

    for (const candidate of candidates) {
      const content = await generateEmailContent(
        `User: ${candidate.displayName}. Last workout over 7 days ago.`,
        "Write a short, powerful 'We miss you' email. Remind them why they started and how good they feel after a workout. Include a strong CTA to jump back into FITTWIZ.",
      );

      try {
        await sendEmail(candidate.email, content, candidate.uid);
        logger.info(`Re-engagement email sent to ${candidate.email}`);
      } catch (err) {
        logger.error(`Failed re-engagement to ${candidate.email}`, err);
      }
    }
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
    sendSecurityAlert,
    sendProSubscriptionEmail,
  };
};
