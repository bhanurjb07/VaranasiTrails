import type { Email } from "../lib/mailer.js";

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export type OtpEmailPurpose = "EMAIL_VERIFY" | "PASSWORD_RESET";

export const otpEmail = (
  to: string,
  name: string,
  code: string,
  purpose: OtpEmailPurpose,
  expiresInMinutes: number,
): Omit<Email, "to"> & { to: string } => {
  const action =
    purpose === "EMAIL_VERIFY" ? "verify your email address" : "reset your password";
  const subject =
    purpose === "EMAIL_VERIFY"
      ? "Verify your email - VaranasiTrails"
      : "Reset your password - VaranasiTrails";

  const text = [
    `Hi ${name},`,
    "",
    `Use this code to ${action}:`,
    "",
    code,
    "",
    `It expires in ${expiresInMinutes} minutes and can be used once.`,
    "If you didn't request this, you can safely ignore this email.",
    "",
    "- VaranasiTrails",
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f3ee;font-family:Arial,Helvetica,sans-serif;color:#222;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr><td align="center">
        <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:8px;padding:32px;">
          <tr><td style="font-size:20px;font-weight:bold;color:#b45309;">VaranasiTrails</td></tr>
          <tr><td style="padding-top:20px;font-size:16px;">Hi ${escapeHtml(name)},</td></tr>
          <tr><td style="padding-top:8px;font-size:16px;">Use this code to ${action}:</td></tr>
          <tr><td align="center" style="padding:24px 0;">
            <span style="display:inline-block;font-size:32px;letter-spacing:8px;font-weight:bold;background:#f6f3ee;padding:12px 24px;border-radius:6px;">${code}</span>
          </td></tr>
          <tr><td style="font-size:14px;color:#555;">This code expires in ${expiresInMinutes} minutes and can be used once.</td></tr>
          <tr><td style="padding-top:16px;font-size:13px;color:#888;">Didn't request this? You can safely ignore this email - your account stays as it is.</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return { to, subject, html, text };
};
