import type { CookieOptions, Request, Response } from "express";

import { config } from "../config/env.js";
import type { SessionMeta } from "../services/auth/token.service.js";

export const REFRESH_COOKIE = "refresh_token";

// Secure everywhere except local development, where plain http is used.
const baseOptions: CookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv !== "development",
  sameSite: "lax",
  path: "/api",
};

export const setRefreshCookie = (res: Response, token: string) =>
  res.cookie(REFRESH_COOKIE, token, { ...baseOptions, maxAge: config.refreshTokenTtlMs });

export const clearRefreshCookie = (res: Response) => res.clearCookie(REFRESH_COOKIE, baseOptions);

export const getRefreshCookie = (req: Request): string | undefined => {
  const value = req.cookies?.[REFRESH_COOKIE];
  return typeof value === "string" && value ? value : undefined;
};

export const sessionMeta = (req: Request): SessionMeta => ({
  userAgent: req.get("user-agent") ?? undefined,
  ip: req.ip,
});
