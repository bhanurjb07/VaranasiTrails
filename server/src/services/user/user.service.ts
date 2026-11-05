import { prisma } from "../../lib/prisma.js";
import type { ChangePasswordInput, UpdateProfileInput } from "../../schemas/user/user.schemas.js";
import { sha256 } from "../../utils/crypto.js";
import { badRequest, conflict, notFound } from "../../utils/errors.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { publicUser } from "../auth/auth.service.js";
import { revokeAllForUser } from "../auth/token.service.js";

const getUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw notFound("User not found");
  return user;
};

export const getProfile = async (userId: string) => publicUser(await getUser(userId));

export const updateProfile = async (userId: string, input: UpdateProfileInput) => {
  if (input.phone) {
    const taken = await prisma.user.findFirst({
      where: { phone: input.phone, id: { not: userId } },
      select: { id: true },
    });
    if (taken) throw conflict("This phone number is already in use", "PHONE_EXISTS");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: input.name, phone: input.phone },
  });
  return publicUser(user);
};

/** Changes the password and signs out every session except the current one. */
export const changePassword = async (
  userId: string,
  input: ChangePasswordInput,
  currentRefreshToken?: string,
) => {
  const user = await getUser(userId);

  if (!(await verifyPassword(input.oldPassword, user.passwordHash))) {
    throw badRequest("Current password is incorrect", "INVALID_PASSWORD");
  }

  const passwordHash = await hashPassword(input.newPassword);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { passwordHash } });
    await revokeAllForUser(userId, tx, currentRefreshToken ? sha256(currentRefreshToken) : undefined);
  });
};
