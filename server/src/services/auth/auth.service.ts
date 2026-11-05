import type { OtpPurpose, User } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import { badRequest, conflict, forbidden, unauthorized } from "../../utils/errors.js";
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
  const { accessToken, refreshToken } = await issueSession(user, meta);
  return { user: publicUser(user), accessToken, refreshToken };
};

export const signup = async (input: SignupInput) => {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, { phone: input.phone }] },
    select: { id: true },
  });
  if (existing) {
    throw conflict("An account with this email or phone number already exists", "ACCOUNT_EXISTS");
  }

  // Always a plain USER. Admins are created with `npm run seed:admin`.
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash: await hashPassword(input.password),
    },
  });

  await sendOtp(user, "EMAIL_VERIFY");
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