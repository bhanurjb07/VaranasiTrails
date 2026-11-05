import { config } from "../config/env.js";
import { AppError } from "../utils/errors.js";

export interface Email {
  to: string;
  subject: string;
  html: string;
  text: string;
}

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * Sends a transactional email through Brevo with plain fetch (no SDK).
 * Without BREVO_API_KEY it only logs the email in development and fails
 * loudly everywhere else.
 */
export const sendEmail = async (email: Email) => {
  const { apiKey, senderEmail, senderName } = config.brevo;

  if (!apiKey || !senderEmail) {
    if (config.nodeEnv === "development") {
      console.log(`\n[mailer] BREVO_API_KEY not set - email not sent.\nTo: ${email.to}\nSubject: ${email.subject}\n${email.text}\n`);
      return;
    }
    throw new Error("Brevo is not configured (BREVO_API_KEY / BREVO_SENDER_EMAIL)");
  }

  let response: Response;
  try {
    response = await fetch(BREVO_URL, {
      method: "POST",
      headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: email.to }],
        subject: email.subject,
        htmlContent: email.html,
        textContent: email.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.error("[mailer] Brevo request failed", error);
    throw new AppError(502, "Could not send email. Please try again shortly.", "EMAIL_SEND_FAILED");
  }

  if (!response.ok) {
    console.error(`[mailer] Brevo responded ${response.status}: ${await response.text()}`);
    throw new AppError(502, "Could not send email. Please try again shortly.", "EMAIL_SEND_FAILED");
  }
};
