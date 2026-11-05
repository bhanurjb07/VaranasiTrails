import "dotenv/config";
import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(emptyToUndefined, schema.optional());

const envSchema = z
  .object({
    // Defaults to production so a missing variable never enables dev behaviour.
    NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
    PORT: z.coerce.number().int().positive().default(5001),

    // Local: file:./dev.db. Production: TURSO_DATABASE_URL + TURSO_AUTH_TOKEN.
    DATABASE_URL: optional(z.string().min(1)),
    TURSO_DATABASE_URL: optional(z.string().min(1)),
    TURSO_AUTH_TOKEN: optional(z.string().min(1)),

    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
    OTP_SECRET: z.string().min(32, "OTP_SECRET must be at least 32 characters"),
    BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),

    CORS_ORIGIN: z.string().default("http://localhost:5173"),

    BREVO_API_KEY: optional(z.string().min(1)),
    BREVO_SENDER_EMAIL: optional(z.string().email()),
    BREVO_SENDER_NAME: z.string().default("VaranasiTrails"),
    ENQUIRY_NOTIFY_EMAIL: optional(z.string().email()),

    R2_ACCOUNT_ID: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_BUCKET: z.string().min(1),
    R2_PUBLIC_BASE_URL: z.string().url(),

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
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "env"}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${details}`);
}

const env = parsed.data;

export const config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  isProduction: env.NODE_ENV === "production",

  databaseUrl: (env.TURSO_DATABASE_URL ?? env.DATABASE_URL)!,
  databaseAuthToken: env.TURSO_AUTH_TOKEN,

  jwtSecret: env.JWT_SECRET,
  otpSecret: env.OTP_SECRET,
  bcryptRounds: env.BCRYPT_ROUNDS,
  accessTokenTtl: "15m",
  refreshTokenTtlMs: 30 * 24 * 60 * 60 * 1000,

  corsOrigins: env.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),

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

  stripeSecretKey: env.STRIPE_SECRET_KEY,
  razorpay: { keyId: env.RAZORPAY_KEY_ID, keySecret: env.RAZORPAY_KEY_SECRET },
} as const;
