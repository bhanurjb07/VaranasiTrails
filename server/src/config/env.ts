import crypto from "node:crypto";

import "dotenv/config";
import { z } from "zod";

import { emailField, passwordField, phoneField } from "../schemas/common/common.schemas.js";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(emptyToUndefined, schema.optional());

/** A stable, valid-looking Indian mobile number for an admin that has no ADMIN_PHONE. */
const placeholderPhone = (email: string) => {
  const digits = BigInt(`0x${crypto.createHash("sha256").update(email).digest("hex").slice(0, 12)}`) % 1_000_000_000n;
  return `+919${String(digits).padStart(9, "0")}`;
};

/** Stricter than the public rule: the admin account can change everything. */
const adminPassword = passwordField
  .refine((value) => value.length >= 10, "Admin password must be at least 10 characters")
  .refine((value) => /[a-z]/.test(value) && /[A-Z]/.test(value), "Admin password needs upper and lower case letters");

const envSchema = z
  .object({
    // Defaults to production so a missing variable never enables dev behaviour.
    NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
    PORT: z.coerce.number().int().positive().default(5001),
    // Reverse proxies between the internet and this server (host = 1, Cloudflare + host = 2).
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(1),

    // Local: file:./dev.db. Production: TURSO_DATABASE_URL + TURSO_AUTH_TOKEN.
    DATABASE_URL: optional(z.string().min(1)),
    TURSO_DATABASE_URL: optional(z.string().min(1)),
    TURSO_AUTH_TOKEN: optional(z.string().min(1)),

    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    OTP_SECRET: z.string().min(32, "OTP_SECRET must be at least 32 characters"),
    BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),

    // Comma separated: the public site AND the admin panel origins.
    CORS_ORIGIN: z.string().default("http://localhost:5173,http://localhost:5174"),
    // For sharing the refresh cookie between app./admin./api. subdomains, e.g. ".example.com".
    COOKIE_DOMAIN: optional(z.string().min(2)),
    COOKIE_SAMESITE: z.enum(["lax", "none"]).default("lax"),

    BREVO_API_KEY: optional(z.string().min(1)),
    BREVO_SENDER_EMAIL: optional(z.string().email()),
    BREVO_SENDER_NAME: z.string().default("VaranasiTrails"),
    ENQUIRY_NOTIFY_EMAIL: optional(z.string().email()),

    R2_ACCOUNT_ID: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_BUCKET: z.string().min(1),
    R2_PUBLIC_BASE_URL: z.string().url(),

    // Optional bootstrap admin: created/updated on every start when both are set.
    ADMIN_EMAIL: optional(emailField),
    ADMIN_PASSWORD: optional(adminPassword),
    ADMIN_NAME: optional(z.string().trim().min(2).max(80)),
    ADMIN_PHONE: optional(phoneField),

    // Reserved for future payments; intentionally optional.
    STRIPE_SECRET_KEY: optional(z.string()),
    RAZORPAY_KEY_ID: optional(z.string()),
    RAZORPAY_KEY_SECRET: optional(z.string()),
  })
  .superRefine((env, ctx) => {
    if (!env.DATABASE_URL && !env.TURSO_DATABASE_URL) {
      ctx.addIssue({
        code: "custom",
        path: ["DATABASE_URL"],
        message: "Set DATABASE_URL (file:./dev.db) or TURSO_DATABASE_URL",
      });
    }
    if (env.TURSO_DATABASE_URL && !env.TURSO_AUTH_TOKEN) {
      ctx.addIssue({
        code: "custom",
        path: ["TURSO_AUTH_TOKEN"],
        message: "TURSO_AUTH_TOKEN is required with TURSO_DATABASE_URL",
      });
    }
    if (env.NODE_ENV === "production") {
      for (const key of ["BREVO_API_KEY", "BREVO_SENDER_EMAIL"] as const) {
        if (!env[key]) {
          ctx.addIssue({ code: "custom", path: [key], message: `${key} is required in production` });
        }
      }
    }
    if (Boolean(env.ADMIN_EMAIL) !== Boolean(env.ADMIN_PASSWORD)) {
      ctx.addIssue({
        code: "custom",
        path: [env.ADMIN_EMAIL ? "ADMIN_PASSWORD" : "ADMIN_EMAIL"],
        message: "ADMIN_EMAIL and ADMIN_PASSWORD must be set together",
      });
    }
  });

/** Validates a raw environment (process.env or a test fixture). Throws one readable error. */
export const parseEnv = (source: Record<string, string | undefined>) => {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${details}`);
  }
  return parsed.data;
};

const buildConfig = (env: ReturnType<typeof parseEnv>) => ({
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  isProduction: env.NODE_ENV === "production",
  trustProxyHops: env.TRUST_PROXY_HOPS,

  databaseUrl: (env.TURSO_DATABASE_URL ?? env.DATABASE_URL)!,
  databaseAuthToken: env.TURSO_AUTH_TOKEN,

  jwtSecret: env.JWT_SECRET,
  otpSecret: env.OTP_SECRET,
  bcryptRounds: env.BCRYPT_ROUNDS,
  accessTokenTtl: "15m" as const,
  refreshTokenTtlMs: 30 * 24 * 60 * 60 * 1000,

  corsOrigins: env.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  cookie: { domain: env.COOKIE_DOMAIN, sameSite: env.COOKIE_SAMESITE },

  brevo: {
    apiKey: env.BREVO_API_KEY,
    senderEmail: env.BREVO_SENDER_EMAIL,
    senderName: env.BREVO_SENDER_NAME,
  },
  enquiryNotifyEmail: env.ENQUIRY_NOTIFY_EMAIL,

  r2: {
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucket: env.R2_BUCKET,
    publicBaseUrl: env.R2_PUBLIC_BASE_URL,
  },

  // Present only when ADMIN_EMAIL and ADMIN_PASSWORD are both set.
  admin:
    env.ADMIN_EMAIL && env.ADMIN_PASSWORD
      ? {
          email: env.ADMIN_EMAIL,
          password: env.ADMIN_PASSWORD,
          name: env.ADMIN_NAME ?? "Admin",
          phone: env.ADMIN_PHONE ?? placeholderPhone(env.ADMIN_EMAIL),
        }
      : undefined,

  stripeSecretKey: env.STRIPE_SECRET_KEY,
  razorpay: { keyId: env.RAZORPAY_KEY_ID, keySecret: env.RAZORPAY_KEY_SECRET },
});

export const config = buildConfig(parseEnv(process.env));
