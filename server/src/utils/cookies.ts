import type { CookieOptions, Request, Response } from "express";

import { config } from "../config/env.js";
import type { SessionMeta } from "../services/auth/token.service.js";

export const REFRESH_COOKIE = "refresh_token";

interface CookieSettings {
  nodeEnv: "development" | "production" | "test";
  domain?: string;
  sameSite: "lax" | "none";
}

/**
 * Refresh-cookie attributes. Secure everywhere except plain-http local development,
 * and always Secure with SameSite=None (browsers reject the combination otherwise).
 * `domain` (e.g. ".example.com") shares the cookie between app./admin./api. subdomains.
 */
export const buildCookieOptions = (settings: CookieSettings): CookieOptions => ({
  httpOnly: true,
  secure: settings.sameSite === "none" || settings.nodeEnv !== "development",
  sameSite: settings.sameSite,
  path: "/api",
  ...(settings.domain ? { domain: settings.domain } : {}),
});

const baseOptions = buildCookieOptions({
  nodeEnv: config.nodeEnv,
  domain: config.cookie.domain,
  sameSite: config.cookie.sameSite,
});

export const setRefreshCookie = (res: Response, token: string) =>
  res.cookie(REFRESH_COOKIE, token, { ...baseOptions, maxAge: config.refreshTokenTtlMs });

// clearCookie only works when path/domain match the ones used to set the cookie.
export const clearRefreshCookie = (res: Response) => res.clearCookie(REFRESH_COOKIE, baseOptions);

export const getRefreshCookie = (req: Request): string | undefined => {
  const value = req.cookies?.[REFRESH_COOKIE];
  return typeof value === "string" && value ? value : undefined;
};

export const sessionMeta = (req: Request): SessionMeta => ({
  userAgent: req.get("user-agent") ?? undefined,
  ip: req.ip,
});
