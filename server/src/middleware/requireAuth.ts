import type { NextFunction, Request, Response } from "express";

import { prisma } from "../lib/prisma.js";
import { forbidden, unauthorized } from "../utils/errors.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(unauthorized("Missing bearer token"));
  }

  try {
    req.user = verifyAccessToken(header.slice("Bearer ".length).trim());
    next();
  } catch {
    next(unauthorized("Invalid or expired token", "TOKEN_INVALID"));
  }
};

// Role is re-read from the database, never trusted from the token.
export const requireAdmin = async (req: Request, _res: Response, next: NextFunction) => {
  const user = req.user
    ? await prisma.user.findUnique({ where: { id: req.user.sub }, select: { role: true } })
    : null;

  if (user?.role !== "ADMIN") {
    return next(forbidden("Admin access required"));
  }
  next();
};

export const requireVerifiedEmail = async (req: Request, _res: Response, next: NextFunction) => {
  const user = req.user
    ? await prisma.user.findUnique({
        where: { id: req.user.sub },
        select: { emailVerifiedAt: true },
      })
    : null;

  if (!user) return next(unauthorized("Account no longer exists"));
  if (!user.emailVerifiedAt) {
    return next(forbidden("Please verify your email first", "EMAIL_NOT_VERIFIED"));
  }
  next();
};
