import { z } from "zod";

import { emailField, otpField, passwordField, phoneField } from "../common/common.schemas.js";

const otpPurpose = z.enum(["EMAIL_VERIFY", "PASSWORD_RESET"]);

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  phone: phoneField,
  email: emailField,
  password: passwordField,
});

export const verifyEmailSchema = z.object({
  email: emailField,
  otp: otpField,
});

export const resendOtpSchema = z.object({
  email: emailField,
  purpose: otpPurpose,
});

export const loginSchema = z.object({
  email: emailField,
  // Existing passwords are only checked against the hash, not the signup rules.
  password: z.string().min(1, "Password is required").max(200),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const verifyResetOtpSchema = z.object({
  email: emailField,
  otp: otpField,
});

export const resetPasswordSchema = z.object({
  email: emailField,
  resetToken: z.string().min(1, "Reset token is required").max(200),
  newPassword: passwordField,
});

export type SignupInput = z.infer<typeof signupSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyResetOtpInput = z.infer<typeof verifyResetOtpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
