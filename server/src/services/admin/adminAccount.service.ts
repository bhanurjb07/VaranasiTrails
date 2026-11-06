import { prisma } from "../../lib/prisma.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { revokeAllForUser } from "../auth/token.service.js";

export interface AdminCredentials {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export type EnsureAdminResult = "created" | "promoted" | "password_rotated" | "unchanged";

/**
 * Makes the account described by ADMIN_EMAIL / ADMIN_PASSWORD exist as an ADMIN.
 * Safe to run on every start:
 *  - missing account: created (verified, role ADMIN)
 *  - existing account: promoted to ADMIN and unblocked if needed
 *  - password: re-hashed only when the env value no longer matches the stored hash
 *    (a restart changes nothing; changing the env value rotates the password and
 *    signs the admin out everywhere).
 */
export const ensureAdmin = async (credentials: AdminCredentials): Promise<EnsureAdminResult> => {
  const existing = await prisma.user.findUnique({ where: { email: credentials.email } });

  if (!existing) {
    await prisma.user.create({
      data: {
        name: credentials.name,
        email: credentials.email,
        phone: credentials.phone,
        passwordHash: await hashPassword(credentials.password),
        role: "ADMIN",
        emailVerifiedAt: new Date(),
      },
    });
    return "created";
  }

  const passwordMatches = await verifyPassword(credentials.password, existing.passwordHash);
  const needsPromotion = existing.role !== "ADMIN" || existing.isBlocked || !existing.emailVerifiedAt;

  if (passwordMatches && !needsPromotion) return "unchanged";

  const newHash = passwordMatches ? undefined : await hashPassword(credentials.password);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: existing.id },
      data: {
        role: "ADMIN",
        isBlocked: false,
        emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
        ...(newHash ? { passwordHash: newHash } : {}),
      },
    });
    if (newHash) await revokeAllForUser(existing.id, tx);
  });

  return passwordMatches ? "promoted" : "password_rotated";
};

const MESSAGES: Record<EnsureAdminResult, string> = {
  created: "Created the admin account",
  promoted: "Existing account promoted to admin",
  password_rotated: "Admin password rotated from ADMIN_PASSWORD and all admin sessions revoked",
  unchanged: "Admin account already up to date",
};

/** Runs ensureAdmin and logs the outcome. Never prints the password and never throws. */
export const ensureAdminFromConfig = async (
  admin: AdminCredentials | undefined,
  log: (message: string) => void = console.log,
): Promise<EnsureAdminResult | null> => {
  if (!admin) return null;

  try {
    const result = await ensureAdmin(admin);
    log(`[admin] ${MESSAGES[result]} (${admin.email})`);
    return result;
  } catch (error) {
    // A bootstrap problem (for example the phone is taken) must not stop the API.
    const reason = error instanceof Error ? (error.message.trim().split(/\r?\n/).pop() ?? error.message) : String(error);
    console.error(`[admin] Could not ensure the admin account for ${admin.email}: ${reason}`);
    return null;
  }
};
