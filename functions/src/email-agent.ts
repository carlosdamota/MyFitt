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
}: EmailAgentDeps) => {
  const db = getFirestore();
  const auth = getAuth();
  const resend = new Resend(resendApiKey);

  // ── Helpers ───────────────────────────────────────────────────────

  /** Check if user opted out of emails */
  const isEmailOptedOut = async (userId: string): Promise<boolean> => {
    const snap = await db.collection("users").doc(userId).get();
    return snap.data()?.emailOptOut === true;
  };

  /** Send an email via Resend (with opt-out guard) */
  const sendEmail = async (
    to: string,
    content: EmailContent,
    userId?: string,
    skipOptOutCheck = false,
  ) => {
    // Always send security emails (skipOptOutCheck = true)
    if (!skipOptOutCheck && userId) {
      const optedOut = await isEmailOptedOut(userId);
      if (optedOut) {
        logger.info(`User ${userId} opted out of emails, skipping.`);
        return;
      }
    }

    await resend.emails.send({
      from: fromEmail,
      to,
      subject: content.subject,
      html: content.body_html,
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

  // ─── 1. WELCOME EMAIL (Firestore trigger) ────────────────────────
  const sendWelcomeEmail = onDocumentCreated("users/{userId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const userData = snapshot.data();
    const email = userData.email;
    const name = userData.displayName || "Athlete";
    if (!email) return;

    const content = await generateEmailContent(
      `New user: ${name}`,
      "Write a warm welcome email. Introduce FitManual as their ultimate training companion. Include a CTA to open the app.",
    );

    try {
      await sendEmail(email, content); // No userId check needed – first email
      logger.info(`Welcome email sent to ${email}`);
    } catch (err) {
      logger.error(`Failed welcome email to ${email}`, err);
    }
  });

  // ─── 2. WEEKLY RE-ENGAGEMENT (Scheduled) ──────────────────────────
  const weeklyReengagement = onSchedule("every sunday 10:00", async () => {
    logger.info("Running weekly re-engagement scan...");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const snapshot = await db
      .collection("users")
      .where("lastWorkoutDate", "<", sevenDaysAgo)
      .where("emailOptOut", "!=", true)
      .limit(50)
      .get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (!data.email) continue;

      const content = await generateEmailContent(
        `User: ${data.displayName || "Athlete"}. Last workout over 7 days ago.`,
        "Write a short motivational 'We miss you' email. Include a CTA to open the app.",
      );

      try {
        await sendEmail(data.email, content, doc.id);
        logger.info(`Re-engagement email sent to ${data.email}`);
      } catch (err) {
        logger.error(`Failed re-engagement to ${data.email}`, err);
      }
    }
  });

  // ─── 3. SECURITY: New Login Alert (HTTP callable) ─────────────────
  // Called from the webhook or from the frontend after login detection
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
  // These are called from updatePlanForCustomer in webhook-function.ts
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
          "Write a congratulatory email welcoming them to Pro. Highlight unlimited routines, advanced AI coach, nutrition analysis. Keep it exciting.",
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
    sendSecurityAlert,
    sendProSubscriptionEmail, // Exported as a callable, not a Cloud Function
  };
};
