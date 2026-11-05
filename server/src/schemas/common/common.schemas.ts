import { z } from "zod";

export const emailField = z.string().trim().toLowerCase().email("Enter a valid email").max(254);

/** Indian mobile: 10 digits starting 6-9, optional +91. Normalised to +919XXXXXXXXX. */
export const phoneField = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid Indian mobile number"))
  .transform((value) => `+91${value.slice(-10)}`);

/** 8-72 bytes (bcrypt's limit), with at least one letter and one number. */
export const passwordField = z
  .string()
  .refine((value) => Buffer.byteLength(value) >= 8, "Password must be at least 8 characters")
  .refine((value) => Buffer.byteLength(value) <= 72, "Password must be at most 72 bytes")
  .refine((value) => /[A-Za-z]/.test(value), "Password must contain a letter")
  .refine((value) => /\d/.test(value), "Password must contain a number");

export const otpField = z.string().trim().regex(/^\d{6}$/, "OTP must be 6 digits");

export const pageField = z.coerce.number().int().min(1).default(1);
export const limitField = (max: number, fallback: number) =>
  z.coerce.number().int().min(1).max(max).default(fallback);
