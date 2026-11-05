import crypto from "node:crypto";

import { config } from "../config/env.js";

/** HMAC-SHA256 keyed with OTP_SECRET. Used for OTP codes and reset tokens. */
export const hmac = (value: string) =>
  crypto.createHmac("sha256", config.otpSecret).update(value).digest("hex");

export const sha256 = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

export const safeEqualHex = (a: string, b: string) => {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString("base64url");

export const generateOtpCode = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
