import type { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import type {
  CreateReviewInput,
  ListReviewsQuery,
  UpdateReviewInput,
} from "../../schemas/review/review.schemas.js";
import { conflict, notFound } from "../../utils/errors.js";
import { paginationMeta } from "../../utils/pagination.js";

export const reviewInclude = {
  user: { select: { name: true } },
} satisfies Prisma.ReviewInclude;

type ReviewWithUser = Prisma.ReviewGetPayload<{ include: typeof reviewInclude }>;

export const toReviewDto = (review: ReviewWithUser) => ({
  id: review.id,
  rating: review.rating,
  title: review.title,
  comment: review.comment,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
  user: { name: review.user.name },
});

const findPublishedDestination = async (slug: string) => {
  const destination = await prisma.destination.findFirst({
    where: { slug, isPublished: true, deletedAt: null },
    select: { id: true },
  });
  if (!destination) throw notFound("Destination not found");
  return destination;
};

/** Recomputes the denormalised rating inside the caller's transaction. */
export const recomputeRating = async (tx: Prisma.TransactionClient, destinationId: string) => {
  const { _avg, _count } = await tx.review.aggregate({
    where: { destinationId, isHidden: false },
    _avg: { rating: true },
    _count: { _all: true },
  });

  await tx.destination.update({
    where: { id: destinationId },
    data: {
      ratingAvg: _avg.rating ? Math.round(_avg.rating * 10) / 10 : 0,
      ratingCount: _count._all,
    },
  });
};

export const listReviews = async (slug: string, query: ListReviewsQuery) => {
  const destination = await findPublishedDestination(slug);
  const where = { destinationId: destination.id, isHidden: false };

  const [total, reviews] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      include: reviewInclude,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return { data: reviews.map(toReviewDto), meta: paginationMeta(query.page, query.limit, total) };
};

export const createReview = async (userId: string, slug: string, input: CreateReviewInput) => {
  const destination = await findPublishedDestination(slug);

  const existing = await prisma.review.findUnique({
    where: { userId_destinationId: { userId, destinationId: destination.id } },
    select: { id: true },
  });
  if (existing) throw conflict("You have already reviewed this destination", "REVIEW_EXISTS");

  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: { ...input, userId, destinationId: destination.id },
      include: reviewInclude,
    });
    await recomputeRating(tx, destination.id);
    return created;
  });

  return toReviewDto(review);
};

const findOwnReview = async (userId: string, slug: string, reviewId: string) => {
  const review = await prisma.review.findFirst({
    where: { id: reviewId, userId, destination: { slug } },
    select: { id: true, destinationId: true },
  });
  if (!review) throw notFound("Review not found");
  return review;
};

export const updateReview = async (
  userId: string,
  slug: string,
  reviewId: string,
  input: UpdateReviewInput,
) => {
  const own = await findOwnReview(userId, slug, reviewId);

  const review = await prisma.$transaction(async (tx) => {
    const updated = await tx.review.update({
      where: { id: own.id },
      data: input,
      include: reviewInclude,
    });
    await recomputeRating(tx, own.destinationId);
    return updated;
  });

  return toReviewDto(review);
};

export const deleteReview = async (userId: string, slug: string, reviewId: string) => {
  const own = await findOwnReview(userId, slug, reviewId);

  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id: own.id } });
    await recomputeRating(tx, own.destinationId);
  });
};
