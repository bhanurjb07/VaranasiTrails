import type { OtpPurpose, User } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import { badRequest, conflict, forbidden, tooManyRequests, unauthorized } from "../../utils/errors.js";
import { fakeVerifyPassword, hashPassword, verifyPassword } from "../../utils/password.js";
import type {
  ForgotPasswordInput,
  LoginInput,
  ResendOtpInput,
  ResetPasswordInput,
  SignupInput,
  VerifyEmailInput,
  VerifyResetOtpInput,
} from "../../schemas/auth/auth.schemas.js";
import { findResetOtp, sendOtp, verifyEmailOtp, verifyResetOtp } from "./otp.service.js";
import { issueSession, revokeAllForUser, type SessionMeta } from "./token.service.js";

const invalidResetToken = () =>
  badRequest("Reset token is invalid or has expired", "RESET_TOKEN_INVALID");

export const publicUser =(user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  emailVerified: user.emailVerifiedAt !== null,
  createdAt: user.createdAt,
});

const sessionFor = async (user: User, meta: SessionMeta) => {
  if (user.isBlocked) {
    throw forbidden("This account has been blocked. Please contact support.", "ACCOUNT_BLOCKED");
  }
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const { accessToken, refreshToken } = await issueSession(user, meta);
  return { user: publicUser(user), accessToken, refreshToken };
};

export const signup = async (input: SignupInput) => {
  const matches = await prisma.user.findMany({
    where: { OR: [{ email: input.email }, { phone: input.phone }] },
  });

  // A verified account owns its email and phone. Nothing can replace it.
  if (matches.some((account) => account.emailVerifiedAt !== null)) {
    throw conflict("An account with this email or phone number already exists", "ACCOUNT_EXISTS");
  }

  const passwordHash = await hashPassword(input.password);
  let user: User;

  if (matches.length === 0) {
    // Always a plain USER. The admin account comes from ADMIN_EMAIL / ADMIN_PASSWORD.
    user = await prisma.user.create({
      data: { name: input.name, email: input.email, phone: input.phone, passwordHash },
    });
  } else {
    // Only unverified (pending) accounts match, and nobody has proven they own that
    // email or phone. The newest submission replaces the pending account, so a stranger
    // cannot squat on an address and the real owner can always sign up.
    const keep = matches.find((account) => account.email === input.email) ?? matches[0]!;
    const others = matches.filter((account) => account.id !== keep.id);

    user = await prisma.$transaction(async (tx) => {
      if (others.length > 0) {
        await tx.user.deleteMany({ where: { id: { in: others.map((account) => account.id) } } });
      }
      await tx.otp.updateMany({ where: { userId: keep.id, usedAt: null }, data: { usedAt: new Date() } });
      await revokeAllForUser(keep.id, tx);
      return tx.user.update({
        where: { id: keep.id },
        data: { name: input.name, email: input.email, phone: input.phone, passwordHash },
      });
    });
  }

  // If the email fails to send, the OTP is rolled back and the same request can simply
  // be retried: it finds this pending account again and succeeds.
  const sent = await sendOtp(user, "EMAIL_VERIFY", { ignoreCooldown: true });
  if (sent === "limit") {
    throw tooManyRequests("Too many verification emails requested. Please try again later.", "OTP_SEND_LIMIT", 3600);
  }
};

export const verifyEmail = async (input: VerifyEmailInput, meta: SessionMeta) => {
  const user = await verifyEmailOtp(input.email, input.otp);
  return sessionFor(user, meta);
};

/** Same outcome whether or not the account exists (or is already verified). */
export const resendOtp = async (input: ResendOtpInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) return;
  if (input.purpose === "EMAIL_VERIFY" && user.emailVerifiedAt) return;

  await sendOtp(user, input.purpose as OtpPurpose);
};

export const login = async (input: LoginInput, meta: SessionMeta) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    await fakeVerifyPassword(input.password);
    throw unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
  }
  if (!(await verifyPassword(input.password, user.passwordHash))) {
    throw unauthorized("Invalid email or password", "INVALID_CREDENTIALS");
  }
  // Only revealed after the password is correct, so it leaks nothing to strangers.
  if (!user.emailVerifiedAt) {
    throw forbidden("Please verify your email before logging in", "EMAIL_NOT_VERIFIED");
  }

  return sessionFor(user, meta);
};

export const forgotPassword = async (input: ForgotPasswordInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (user) {
    await sendOtp(user, "PASSWORD_RESET");
  }
};

export const verifyResetOtpCode = async (input: VerifyResetOtpInput) => ({
  resetToken: await verifyResetOtp(input.email, input.otp),
});

export const resetPassword = async (input: ResetPasswordInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    // Same error as a bad token, so this endpoint cannot be used to probe emails.
    throw invalidResetToken();
  }

  const otp = await findResetOtp(user.id, input.resetToken);
  const passwordHash = await hashPassword(input.newPassword);

  await prisma.$transaction(async (tx) => {
    const consumed = await tx.otp.updateMany({
      where: { id: otp.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    if (consumed.count === 0) {
      throw invalidResetToken();
    }

    await tx.user.update({ where: { id: user.id }, data: { passwordHash } });
    await revokeAllForUser(user.id, tx);
  });
};

export const getUserById = (id: string) => prisma.user.findUnique({ where: { id } });