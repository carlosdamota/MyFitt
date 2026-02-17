import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { Resend } from "resend";
import { getFirestore } from "firebase-admin/firestore";

interface EmailAgentDeps {
  geminiApiKey: string;
  resendApiKey: string;
  fromEmail: string;
}

export const createEmailAgentFunctions = ({
  geminiApiKey,
  resendApiKey,
  fromEmail,
}: EmailAgentDeps) => {
  const db = getFirestore();

  // --- Helper: Call Gemini to generate email content ---
  const generateEmailContent = async (context: string, prompt: string) => {
    if (!geminiApiKey) {
      logger.error("Gemini API Key missing");
      return { subject: "Update from FitManual", body_html: "<p>Check the app for updates.</p>" };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `You are an AI assistant for a fitness app called 'FitManual'. 
          Write an email based on the following context: ${context}
          
          Prompt: ${prompt}
          
          Return JSON with 'subject' and 'body_html'. 
          Keep the tone professional yet encouraging.
          Format the body as clean HTML (using <p>, <br>, <strong>).`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      },
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        logger.error(`Gemini API Error: ${response.statusText}`);
        throw new Error(`Gemini API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty response from Gemini");

      return JSON.parse(text);
    } catch (error) {
      logger.error("Error generating email content:", error);
      return { subject: "Welcome to FitManual", body_html: "<p>Welcome to FitManual!</p>" };
    }
  };
  // --- Scheduled: Re-engagement Logic ---
  // Runs every Sunday at 10:00 AM
  const weeklyReengagement = onSchedule("every sunday 10:00", async (event) => {
    logger.info("Running weekly re-engagement scan...");
    const resend = new Resend(resendApiKey);

    // Find users who haven't logged a workout in 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Note: requires index on lastWorkoutDate
    const inactiveUsersSnapshot = await db
      .collection("users")
      .where("lastWorkoutDate", "<", sevenDaysAgo)
      // .where("emailOptOut", "!=", true) // specific field check if needed
      .limit(10) // batch limit
      .get();

    for (const doc of inactiveUsersSnapshot.docs) {
      const userData = doc.data();
      const email = userData.email;
      const name = userData.displayName || "Athlete";

      if (!email) continue;

      const content = await generateEmailContent(
        `User: ${name}. Last workout was over a week ago.`,
        "Write a short, punchy 'We miss you' email. Encourage them to get back to training.",
      );

      try {
        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: content.subject,
          html: content.body_html,
        });
        logger.info(`Sent re-engagement email to ${email}`);
      } catch (err) {
        logger.error(`Failed to send email to ${email}`, err);
      }
    }
  });

  // --- Trigger: Welcome Email ---
  const sendWelcomeEmail = onDocumentCreated("users/{userId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const resend = new Resend(resendApiKey);
    const userData = snapshot.data();
    const email = userData.email;
    const name = userData.displayName || "New User";

    if (!email) return;

    const content = await generateEmailContent(
      `New User: ${name}`,
      "Write a warm welcome email. Introduce FitManual as their ultimate training companion.",
    );

    try {
      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: content.subject,
        html: content.body_html,
      });
      logger.info(`Sent welcome email to ${email}`);
    } catch (err) {
      logger.error(`Failed to send welcome email to ${email}`, err);
    }
  });

  return {
    weeklyReengagement,
    sendWelcomeEmail,
  };
};
