import type { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import { publicUrl } from "../../lib/r2.js";
import type { ListDestinationsQuery } from "../../schemas/destination/destination.schemas.js";
import { notFound } from "../../utils/errors.js";
import { paginationMeta } from "../../utils/pagination.js";
import { reviewInclude, toReviewDto } from "../review/review.service.js";

export const cardInclude = {
  images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }], take: 1 },
} satisfies Prisma.DestinationInclude;

type CardRow = Prisma.DestinationGetPayload<{ include: typeof cardInclude }>;

const discountPercent = (price: number, original: number | null) =>
  original && original > price ? Math.round(((original - price) / original) * 100) : 0;

/** Videos are either a full http(s) URL (e.g. YouTube embed) or an R2 key. */
const mediaUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : publicUrl(value));

export const toCard = (destination: CardRow) => ({
  id: destination.id,
  slug: destination.slug,
  title: destination.title,
  tagline: destination.tagline,
  city: destination.city,
  coverImage: destination.images[0] ? publicUrl(destination.images[0].key) : null,
  priceInr: destination.priceInr,
  originalPriceInr: destination.originalPriceInr,
  discountPercent: discountPercent(destination.priceInr, destination.originalPriceInr),
  duration: { days: destination.durationDays, nights: destination.durationNights },
  ratingAvg: destination.ratingAvg,
  ratingCount: destination.ratingCount,
});

const orderBy = (sort: ListDestinationsQuery["sort"]): Prisma.DestinationOrderByWithRelationInput[] => {
  switch (sort) {
    case "price_asc":
      return [{ priceInr: "asc" }, { id: "asc" }];
    case "price_desc":
      return [{ priceInr: "desc" }, { id: "asc" }];
    case "rating":
      return [{ ratingAvg: "desc" }, { ratingCount: "desc" }, { id: "asc" }];
    case "newest":
      return [{ createdAt: "desc" }, { id: "asc" }];
    case "popular":
      return [{ ratingCount: "desc" }, { ratingAvg: "desc" }, { id: "asc" }];
  }
};

export const listDestinations = async (query: ListDestinationsQuery) => {
  const where: Prisma.DestinationWhereInput = {
    isPublished: true,
    deletedAt: null,
    ...(query.q ? { OR: [{ title: { contains: query.q } }, { city: { contains: query.q } }] } : {}),
    ...(query.category ? { category: { slug: query.category } } : {}),
    ...(query.minPrice !== undefined || query.maxPrice !== undefined
      ? { priceInr: { gte: query.minPrice, lte: query.maxPrice } }
      : {}),
    ...(query.minDays !== undefined || query.maxDays !== undefined
      ? { durationDays: { gte: query.minDays, lte: query.maxDays } }
      : {}),
    ...(query.difficulty ? { difficulty: query.difficulty } : {}),
    ...(query.featured !== undefined ? { isFeatured: query.featured } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.destination.count({ where }),
    prisma.destination.findMany({
      where,
      include: cardInclude,
      orderBy: orderBy(query.sort),
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return { data: rows.map(toCard), meta: paginationMeta(query.page, query.limit, total) };
};

export const getDestinationBySlug = async (slug: string) => {
  const destination = await prisma.destination.findFirst({
    where: { slug, isPublished: true, deletedAt: null },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      highlights: { orderBy: { sortOrder: "asc" } },
      itinerary: { orderBy: { dayNumber: "asc" } },
      inclusions: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!destination) throw notFound("Destination not found");

  const [ratingGroups, latestReviews, related] = await Promise.all([
    prisma.review.groupBy({
      by: ["rating"],
      where: { destinationId: destination.id, isHidden: false },
      _count: { _all: true },
    }),
    prisma.review.findMany({
      where: { destinationId: destination.id, isHidden: false },
      include: reviewInclude,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      take: 5,
    }),
    prisma.destination.findMany({
      where: {
        isPublished: true,
        deletedAt: null,
        id: { not: destination.id },
        OR: [{ categoryId: destination.categoryId }, { city: destination.city }],
      },
      include: cardInclude,
      orderBy: [{ ratingAvg: "desc" }, { ratingCount: "desc" }, { id: "asc" }],
      take: 6,
    }),
  ]);

  const ratingBreakdown: Record<"1" | "2" | "3" | "4" | "5", number> = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };
  for (const group of ratingGroups) {
    ratingBreakdown[String(group.rating) as keyof typeof ratingBreakdown] = group._count._all;
  }

  return {
    id: destination.id,
    slug: destination.slug,
    title: destination.title,
    tagline: destination.tagline,
    overview: destination.overview,
    city: destination.city,
    state: destination.state,
    country: destination.country,
    category: {
      id: destination.category.id,
      slug: destination.category.slug,
      name: destination.category.name,
    },
    priceInr: destination.priceInr,
    originalPriceInr: destination.originalPriceInr,
    discountPercent: discountPercent(destination.priceInr, destination.originalPriceInr),
    duration: { days: destination.durationDays, nights: destination.durationNights },
    maxGroupSize: destination.maxGroupSize,
    difficulty: destination.difficulty,
    bestTimeToVisit: destination.bestTimeToVisit,
    meetingPoint: destination.meetingPoint,
    videoUrl: destination.videoUrl ? mediaUrl(destination.videoUrl) : null,
    isFeatured: destination.isFeatured,
    ratingAvg: destination.ratingAvg,
    ratingCount: destination.ratingCount,
    ratingBreakdown,
    images: destination.images.map((image) => ({
      url: publicUrl(image.key),
      alt: image.alt,
      isCover: image.isCover,
    })),
    highlights: destination.highlights.map((highlight) => highlight.text),
    itinerary: destination.itinerary.map(({ dayNumber, title, description }) => ({
      dayNumber,
      title,
      description,
    })),
    inclusions: destination.inclusions.filter((item) => item.isIncluded).map((item) => item.text),
    exclusions: destination.inclusions.filter((item) => !item.isIncluded).map((item) => item.text),
    latestReviews: latestReviews.map(toReviewDto),
    related: related.map(toCard),
    createdAt: destination.createdAt,
    updatedAt: destination.updatedAt,
  };
};

export const listCategories = async () => {
  // Inactive categories are hidden from the public filter list (trips stay visible).
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, slug: true, name: true },
  });
  return { data: categories };
};
