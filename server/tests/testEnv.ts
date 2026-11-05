import crypto from "node:crypto";
import os from "node:os";
import path from "node:path";

// One throwaway SQLite file per test run, outside the repo. The path is kept in
// process.env so the config and the global setup (separate module graphs in the
// same process) agree on it.
export const testDbFile = (process.env.VT_TEST_DB ??= path
  .join(os.tmpdir(), `varanasitrails-test-${crypto.randomUUID()}.db`)
  .replaceAll("\\", "/"));

export const testEnv = {
  NODE_ENV: "test",
  DATABASE_URL: `file:${testDbFile}`,
  JWT_SECRET: "test-jwt-secret-0123456789-0123456789-abcdef",
  OTP_SECRET: "test-otp-secret-0123456789-0123456789-abcdef",
  BCRYPT_ROUNDS: "4",
  CORS_ORIGIN: "http://localhost:5173",
  ENQUIRY_NOTIFY_EMAIL: "owner@example.com",
  R2_ACCOUNT_ID: "test-account",
  R2_ACCESS_KEY_ID: "test-key",
  R2_SECRET_ACCESS_KEY: "test-secret",
  R2_BUCKET: "test-bucket",
  R2_PUBLIC_BASE_URL: "https://media.test",
};
