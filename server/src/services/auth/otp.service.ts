import crypto from "node:crypto";

import type { OtpPurpose } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import { sendEmail } from "../../lib/mailer.js";
import { badRequest } from "../../utils/errors.js";
import { generateOtpCode, hmac, randomToken, safeEqualHex } from "../../utils/crypto.js";
import { otpEmail } from "../../utils/emailTemplates.js";

export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_MAX_SENDS_PER_HOUR = 5;
export const RESET_TOKEN_TTL_MINUTES = 10;

const MINUTE = 60 * 1000;

const invalidOtp = () => badRequest("Invalid or expired code", "OTP_INVALID");

export type SendOtpResult = "sent" | "cooldown" | "limit";

/**
 * Issues a fresh OTP and emails it. Earlier unused OTPs of the same purpose
 * are invalidated. Returns "cooldown" / "limit" instead of throwing so callers
 * that must not reveal whether an account exists can ignore it.
 */
export const sendOtp = async (
  user: { id: string; email: string; name: string },
  purpose: OtpPurpose,
): Promise<SendOtpResult> => {
  const now = Date.now();

  const latest = await prisma.otp.findFirst({
    where: { userId: user.id, purpose },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (latest && now - latest.createdAt.getTime() < OTP_RESEND_COOLDOWN_SECONDS * 1000) {
    return "cooldown";
  }

  const sentLastHour = await prisma.otp.count({
    where: { userId: user.id, createdAt: { gte: new Date(now - 60 * MINUTE) } },
  });
  if (sentLastHour >= OTP_MAX_SENDS_PER_HOUR) {
    return "limit";
  }

  const code = generateOtpCode();
  const id = crypto.randomUUID();

  await prisma.$transaction([
    prisma.otp.updateMany({
      where: { userId: user.id, purpose, usedAt: null },
      data: { usedAt: new Date(now) },
    }),
    prisma.otp.create({
      data: {
        id,
        userId: user.id,
        email: user.email,
        purpose,
        codeHash: hmac(`${id}:${code}`),
        expiresAt: new Date(now + OTP_TTL_MINUTES * MINUTE),
      },
    }),
  ]);

  await sendEmail(otpEmail(user.email, user.name, code, purpose, OTP_TTL_MINUTES));
  return "sent";
};

/**
 * Checks a submitted code against the user's newest live OTP. Every check
 * burns one attempt first (atomically); after OTP_MAX_ATTEMPTS the OTP is dead.
 */
const checkCode = async (email: string, purpose: OtpPurpose, code: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw invalidOtp();

  const otp = await prisma.otp.findFirst({
    where: { userId: user.id, purpose, usedAt: null, verifiedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!otp || otp.expiresAt.getTime() <= Date.now()) throw invalidOtp();

  const claimed = await prisma.otp.updateMany({
    where: { id: otp.id, usedAt: null, attempts: { lt: OTP_MAX_ATTEMPTS } },
    data: { attempts: { increment: 1 } },
  });
  if (claimed.count === 0) throw invalidOtp();

  if (!safeEqualHex(hmac(`${otp.id}:${code}`), otp.codeHash)) {
    if (otp.attempts + 1 >= OTP_MAX_ATTEMPTS) {
      await prisma.otp.updateMany({ where: { id: otp.id, usedAt: null }, data: { usedAt: new Date() } });
    }
    throw invalidOtp();
  }

  return { user, otp };
};

/** EMAIL_VERIFY: consumes the OTP and marks the email verified. */
export const verifyEmailOtp = async (email: string, code: string) => {
  const { user, otp } = await checkCode(email, "EMAIL_VERIFY", code);

  return prisma.$transaction(async (tx) => {
    const consumed = await tx.otp.updateMany({
      where: { id: otp.id, usedAt: null },
      data: { usedAt: new Date(), verifiedAt: new Date() },
    });
    if (consumed.count === 0) throw invalidOtp();

    return tx.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: user.emailVerifiedAt ?? new Date() },
    });
  });
};

/**
 * PASSWORD_RESET: marks the OTP verified and returns a single-use reset token
 * bound to that OTP record. Only a hash of the token is stored.
 */
export const verifyResetOtp = async (email: string, code: string) => {
  const { otp } = await checkCode(email, "PASSWORD_RESET", code);

  const resetToken = randomToken(32);
  const marked = await prisma.otp.updateMany({
    where: { id: otp.id, usedAt: null, verifiedAt: null },
    data: {
      verifiedAt: new Date(),
      resetTokenHash: hmac(resetToken),
      resetTokenExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * MINUTE),
    },
  });
  if (marked.count === 0) throw invalidOtp();

  return resetToken;
};

/** Finds the verified, unused, unexpired reset OTP that this token belongs to. */
export const findResetOtp = async (userId: string, resetToken: string) => {
  const otp = await prisma.otp.findFirst({
    where: {
      userId,
      purpose: "PASSWORD_RESET",
      usedAt: null,
      verifiedAt: { not: null },
      resetTokenExpiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp?.resetTokenHash || !safeEqualHex(hmac(resetToken), otp.resetTokenHash)) {
    throw badRequest("Reset token is invalid or has expired", "RESET_TOKEN_INVALID");
  }
  return otp;
};
