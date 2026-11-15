import type { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import { publicUrl } from "../../lib/r2.js";
import type { ListUsersQuery } from "../../schemas/admin/user.schemas.js";
import { AppError, conflict, notFound } from "../../utils/errors.js";
import { paginationMeta } from "../../utils/pagination.js";
import { revokeAllForUser } from "../auth/token.service.js";
import { recordAudit } from "./audit.service.js";

const include = { _count: { select: { reviews: true, wishlistItems: true } } } satisfies Prisma.UserInclude;
type UserRow = Prisma.UserGetPayload<{ include: typeof include }>;

const toDto = (user: UserRow) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  emailVerified: user.emailVerifiedAt !== null,
  isBlocked: user.isBlocked,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  reviewCount: user._count.reviews,
  wishlistCount: user._count.wishlistItems,
});

export const listUsers = async (query: ListUsersQuery) => {
  const where: Prisma.UserWhereInput = {
    ...(query.verified !== undefined ? { emailVerifiedAt: query.verified ? { not: null } : null } : {}),
    ...(query.blocked !== undefined ? { isBlocked: query.blocked } : {}),
    ...(query.q
      ? { OR: [{ name: { contains: query.q } }, { email: { contains: query.q } }, { phone: { contains: query.q } }] }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return { data: rows.map(toDto), meta: paginationMeta(query.page, query.limit, total) };
};

const getRow = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id }, include });
  if (!user) throw notFound("User not found");
  return user;
};

export const getUser = async (id: string) => toDto(await getRow(id));

/** One user plus everything they did on the site: wishlist, reviews and enquiries sent with their email. */
export const getUserDetail = async (id: string) => {
  const row = await getRow(id);

  const [wishlist, reviews, enquiries] = await Promise.all([
    prisma.wishlistItem.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      include: {
        destination: {
          select: {
            id: true,
            title: true,
            slug: true,
            priceInr: true,
            isPublished: true,
            deletedAt: true,
            images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }], take: 1, select: { key: true } },
          },
        },
      },
    }),
    prisma.review.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      include: { destination: { select: { id: true, title: true, slug: true } } },
    }),
    prisma.enquiry.findMany({
      where: { email: row.email },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { destination: { select: { title: true } } },
    }),
  ]);

  return {
    user: toDto(row),
    wishlist: wishlist.map((item) => ({
      addedAt: item.createdAt,
      id: item.destination.id,
      title: item.destination.title,
      slug: item.destination.slug,
      priceInr: item.destination.priceInr,
      status: item.destination.deletedAt ? "archived" : item.destination.isPublished ? "published" : "draft",
      coverImage: item.destination.images[0] ? publicUrl(item.destination.images[0].key) : null,
    })),
    reviews: reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isHidden: review.isHidden,
      createdAt: review.createdAt,
      destination: review.destination,
    })),
    enquiries: enquiries.map((enquiry) => ({
      id: enquiry.id,
      status: enquiry.status,
      message: enquiry.message,
      destinationTitle: enquiry.destination?.title ?? null,
      createdAt: enquiry.createdAt,
    })),
  };
};

/** Blocking signs the user out everywhere. Admins (and yourself) cannot be blocked. */
export const setBlocked = async (adminId: string, id: string, blocked: boolean) => {
  const user = await getRow(id);

  if (blocked) {
    if (user.id === adminId) throw conflict("You cannot block your own account", "CANNOT_BLOCK_SELF");
    if (user.role === "ADMIN") throw new AppError(409, "Admin accounts cannot be blocked", "CANNOT_BLOCK_ADMIN");
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data: { isBlocked: blocked } });
    if (blocked) await revokeAllForUser(id, tx);
    await recordAudit(
      tx,
      adminId,
      blocked ? "user.block" : "user.unblock",
      "user",
      id,
      `${blocked ? "Blocked" : "Unblocked"} ${user.name} (${user.email})`,
    );
  });

  return getUser(id);
};
