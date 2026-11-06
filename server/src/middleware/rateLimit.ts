import type { Request, Response } from "express";
import { rateLimit } from "express-rate-limit";

import { config } from "../config/env.js";

const limiter = (windowMs: number, limit: number, message: string) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    // Tests make many calls from one IP; limits are covered by config, not tests.
    skip: () => config.nodeEnv === "test",
    handler: (_req: Request, res: Response) => {
      res.status(429).json({ message, code: "RATE_LIMITED" });
    },
  });

const MINUTE = 60 * 1000;

export const globalLimiter = limiter(15 * MINUTE, 300, "Too many requests, please slow down");
export const loginLimiter = limiter(15 * MINUTE, 10, "Too many login attempts, try again later");
export const signupLimiter = limiter(60 * MINUTE, 10, "Too many signup attempts, try again later");
export const otpLimiter = limiter(15 * MINUTE, 10, "Too many verification attempts, try again later");
export const passwordResetLimiter = limiter(
  15 * MINUTE,
  10,
  "Too many password reset attempts, try again later",
);
export const adminLimiter = limiter(15 * MINUTE, 600, "Too many admin requests, please slow down");
export const enquiryLimiter =limiter(60 * MINUTE, 5, "Too many enquiries, try again later");
