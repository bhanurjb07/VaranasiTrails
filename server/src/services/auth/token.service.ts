import type { Prisma, User } from "@prisma/client";

import { config } from "../../config/env.js";
import { prisma } from "../../lib/prisma.js";
import { randomToken, sha256 } from "../../utils/crypto.js";
import { unauthorized } from "../../utils/errors.js";
import { signAccessToken } from "../../utils/jwt.js";

export interface SessionMeta {
  userAgent?: string;
  ip?: string;
}

type Db = Prisma.TransactionClient | typeof prisma;

const createRefreshToken = async (userId: string, meta: SessionMeta, db: Db = prisma) => {
  const refreshToken = randomToken(48);
  await db.refreshToken.create({
    data: {
      userId,
      tokenHash: sha256(refreshToken),
      expiresAt: new Date(Date.now() + config.refreshTokenTtlMs),
      userAgent: meta.userAgent?.slice(0, 255),
      ip: meta.ip,
    },
  });
  return refreshToken;
};

/** New login session: a short-lived access JWT plus an opaque refresh token. */
export const issueSession = async (user: User, meta: SessionMeta) => ({
  accessToken: signAccessToken(user.id),
  refreshToken: await createRefreshToken(user.id, meta),
});

export const revokeAllForUser = (userId: string, db: Db = prisma, exceptTokenHash?: string) =>
  db.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
      ...(exceptTokenHash ? { tokenHash: { not: exceptTokenHash } } : {}),
    },
    data: { revokedAt: new Date() },
  });

/**
 * Rotates a refresh token. Presenting a token that was already rotated means
 * it leaked (or a client raced), so every session of that user is revoked.
 */
export const rotateSession = async (rawToken: string, meta: SessionMeta) => {
  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash: sha256(rawToken) },
    include: { user: true },
  });

  if (!record) throw unauthorized("Invalid refresh token", "REFRESH_INVALID");

  if (record.rotatedAt) {
    await revokeAllForUser(record.userId);
    throw unauthorized("Refresh token reuse detected, please log in again", "REFRESH_REUSED");
  }

  if (record.revokedAt || record.expiresAt.getTime() <= Date.now()) {
    throw unauthorized("Refresh token expired or revoked", "REFRESH_INVALID");
  }

  const refreshToken = await prisma.$transaction(async (tx) => {
    const claimed = await tx.refreshToken.updateMany({
      where: { id: record.id, rotatedAt: null, revokedAt: null },
      data: { rotatedAt: new Date(), revokedAt: new Date() },
    });
    // A concurrent request already rotated it: treat as reuse.
    if (claimed.count === 0) return null;
    return createRefreshToken(record.userId, meta, tx);
  });

  if (!refreshToken) {
    await revokeAllForUser(record.userId);
    throw unauthorized("Refresh token reuse detected, please log in again", "REFRESH_REUSED");
  }

  return { user: record.user, accessToken: signAccessToken(record.userId), refreshToken };
};

export const revokeSession = async (rawToken: string) => {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: sha256(rawToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
};
