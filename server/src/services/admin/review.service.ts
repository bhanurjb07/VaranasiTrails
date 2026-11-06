import type { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import type { ListAdminReviewsQuery } from "../../schemas/admin/review.schemas.js";
import { notFound } from "../../utils/errors.js";
import { paginationMeta } from "../../utils/pagination.js";
import { recomputeRating } from "../review/review.service.js";
import { recordAudit } from "./audit.service.js";

const include = {
  user: { select: { id: true, name: true, email: true } },
  destination: { select: { id: true, title: true, slug: true } },
} satisfies Prisma.ReviewInclude;
type ReviewRow = Prisma.ReviewGetPayload<{ include: typeof include }>;

const toDto = (review: ReviewRow) => ({
  id: review.id,
  rating: review.rating,
  title: review.title,
  comment: review.comment,
  isHidden: review.isHidden,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
  user: review.user,
  destination: review.destination,
});

export const listAdminReviews = async (query: ListAdminReviewsQuery) => {
  const where: Prisma.ReviewWhereInput = {
    ...(query.hidden !== undefined ? { isHidden: query.hidden } : {}),
    ...(query.rating ? { rating: query.rating } : {}),
    ...(query.destinationId ? { destinationId: query.destinationId } : {}),
    ...(query.q
      ? {
          OR: [
            { title: { contains: query.q } },
            { comment: { contains: query.q } },
            { user: { name: { contains: query.q } } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
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
  const review = await prisma.review.findUnique({ where: { id }, include });
  if (!review) throw notFound("Review not found");
  return review;
};

/** Hidden reviews vanish from the public site and from the trip's rating. */
export const setHidden = async (adminId: string, id: string, hidden: boolean) => {
  const review = await getRow(id);

  await prisma.$transaction(async (tx) => {
    await tx.review.update({ where: { id }, data: { isHidden: hidden } });
    await recomputeRating(tx, review.destinationId);
    await recordAudit(
      tx,
      adminId,
      hidden ? "review.hide" : "review.unhide",
      "review",
      id,
      `${hidden ? "Hid" : "Unhid"} a review of "${review.destination.title}" by ${review.user.name}`,
    );
  });

  return toDto(await getRow(id));
};

export const deleteReview = async (adminId: string, id: string) => {
  const review = await getRow(id);

  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id } });
    await recomputeRating(tx, review.destinationId);
    await recordAudit(
      tx,
      adminId,
      "review.delete",
      "review",
      id,
      `Deleted a review of "${review.destination.title}" by ${review.user.name}`,
    );
  });
};
