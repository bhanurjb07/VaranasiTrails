import type { Prisma } from "@prisma/client";

import { publicUrl } from "../../lib/r2.js";
import type { FieldError } from "../../utils/errors.js";

export const adminInclude = {
  category: true,
  images: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
  highlights: { orderBy: { sortOrder: "asc" } },
  itinerary: { orderBy: { dayNumber: "asc" } },
  inclusions: { orderBy: { sortOrder: "asc" } },
} satisfies Prisma.DestinationInclude;

export type AdminDestination = Prisma.DestinationGetPayload<{ include: typeof adminInclude }>;

export type DestinationStatus = "published" | "draft" | "archived";

export const statusOf = (d: { deletedAt: Date | null; isPublished: boolean }): DestinationStatus =>
  d.deletedAt ? "archived" : d.isPublished ? "published" : "draft";

const discountPercent = (price: number, original: number | null) =>
  original && original > price ? Math.round(((original - price) / original) * 100) : 0;

interface ReadinessInput {
  title: string;
  tagline: string;
  overview: string;
  priceInr: number;
  originalPriceInr: number | null;
  durationDays: number;
  categoryId: string | null;
  images: { isCover: boolean }[];
  itinerary: unknown[];
  highlights: unknown[];
}

/**
 * What a destination needs before it can go live. The admin panel shows the same
 * checklist; this is the source of truth and is enforced on publish.
 */
export const checkReadiness = (d: ReadinessInput): FieldError[] => {
  const errors: FieldError[] = [];
  const need = (ok: boolean, field: string, message: string) => {
    if (!ok) errors.push({ field, message });
  };

  need(d.title.trim().length >= 3, "title", "Add a title (at least 3 characters)");
  need(d.tagline.trim().length >= 10, "tagline", "Add a tagline (at least 10 characters)");
  need(d.overview.trim().length >= 50, "overview", "Write an overview (at least 50 characters)");
  need(Boolean(d.categoryId), "categoryId", "Choose a category");
  need(d.priceInr > 0, "priceInr", "Set a price above zero");
  need(
    d.originalPriceInr === null || d.originalPriceInr > d.priceInr,
    "originalPriceInr",
    "Original price must be higher than the price",
  );
  need(d.durationDays >= 1, "durationDays", "Set the trip duration");
  need(d.images.length >= 1, "images", "Add at least one image");
  need(d.images.length === 0 || d.images.some((image) => image.isCover), "images", "Choose a cover image");
  need(d.itinerary.length >= 1, "itinerary", "Add at least one itinerary day");
  need(d.highlights.length >= 1, "highlights", "Add at least one highlight");

  return errors;
};

export const videoOf = (videoUrl: string | null) => {
  if (!videoUrl) return null;
  const external = /^https?:\/\//i.test(videoUrl);
  return external
    ? { type: "YOUTUBE" as const, url: videoUrl, key: null }
    : { type: "UPLOAD" as const, url: publicUrl(videoUrl), key: videoUrl };
};

export const toAdminDetail = (d: AdminDestination) => {
  const errors = checkReadiness(d);

  return {
    id: d.id,
    slug: d.slug,
    title: d.title,
    tagline: d.tagline,
    overview: d.overview,
    categoryId: d.categoryId,
    category: { id: d.category.id, slug: d.category.slug, name: d.category.name },
    city: d.city,
    state: d.state,
    country: d.country,
    priceInr: d.priceInr,
    originalPriceInr: d.originalPriceInr,
    discountPercent: discountPercent(d.priceInr, d.originalPriceInr),
    durationDays: d.durationDays,
    durationNights: d.durationNights,
    maxGroupSize: d.maxGroupSize,
    difficulty: d.difficulty,
    bestTimeToVisit: d.bestTimeToVisit,
    meetingPoint: d.meetingPoint,
    metaTitle: d.metaTitle,
    metaDescription: d.metaDescription,
    isFeatured: d.isFeatured,
    isPublished: d.isPublished,
    status: statusOf(d),
    publishedAt: d.publishedAt,
    deletedAt: d.deletedAt,
    ratingAvg: d.ratingAvg,
    ratingCount: d.ratingCount,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    video: videoOf(d.videoUrl),
    images: d.images.map((image) => ({
      id: image.id,
      key: image.key,
      url: publicUrl(image.key),
      alt: image.alt,
      sortOrder: image.sortOrder,
      isCover: image.isCover,
      contentType: image.contentType,
      sizeBytes: image.sizeBytes,
    })),
    highlights: d.highlights.map((highlight) => highlight.text),
    itinerary: d.itinerary.map(({ dayNumber, title, description }) => ({ dayNumber, title, description })),
    inclusions: d.inclusions.filter((item) => item.isIncluded).map((item) => item.text),
    exclusions: d.inclusions.filter((item) => !item.isIncluded).map((item) => item.text),
    readiness: { ready: errors.length === 0, errors },
  };
};

export const rowInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }], take: 1 },
  _count: { select: { enquiries: true, wishlisted: true } },
} satisfies Prisma.DestinationInclude;

export type AdminRow = Prisma.DestinationGetPayload<{ include: typeof rowInclude }>;

/** Table-ready list row. */
export const toRow = (d: AdminRow) => ({
  id: d.id,
  slug: d.slug,
  title: d.title,
  status: statusOf(d),
  isFeatured: d.isFeatured,
  priceInr: d.priceInr,
  originalPriceInr: d.originalPriceInr,
  category: d.category,
  city: d.city,
  coverImage: d.images[0] ? publicUrl(d.images[0].key) : null,
  updatedAt: d.updatedAt,
  publishedAt: d.publishedAt,
  enquiryCount: d._count.enquiries,
  wishlistCount: d._count.wishlisted,
});
