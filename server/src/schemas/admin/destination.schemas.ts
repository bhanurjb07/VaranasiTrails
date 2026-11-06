import { z } from "zod";

import { SLUG_PATTERN } from "../../utils/slug.js";
import { adminPageQuery, boolQuery, idListSchema } from "./common.schemas.js";

const text = (max: number) => z.string().trim().max(max);
const listItem = z.string().trim().min(1, "Cannot be empty").max(200);

const itineraryDay = z.object({
  title: z.string().trim().min(1, "Day title is required").max(120),
  description: z.string().trim().min(1, "Day description is required").max(2000),
});

const fields = {
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  slug: z.string().trim().max(120).regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens"),
  tagline: text(200),
  overview: text(10000),
  categoryId: z.string().min(1).max(64),
  city: text(80),
  state: text(80),
  country: text(80),
  priceInr: z.number().int().min(0).max(10_000_000),
  originalPriceInr: z.number().int().min(0).max(10_000_000).nullable(),
  durationDays: z.number().int().min(1).max(60),
  durationNights: z.number().int().min(0).max(60),
  maxGroupSize: z.number().int().min(1).max(500),
  difficulty: z.enum(["EASY", "MODERATE", "HARD"]),
  bestTimeToVisit: text(200),
  meetingPoint: text(200).nullable(),
  metaTitle: text(70).nullable(),
  metaDescription: text(200).nullable(),
  isFeatured: z.boolean(),
  highlights: z.array(listItem).max(20),
  itinerary: z.array(itineraryDay).max(60),
  inclusions: z.array(listItem).max(30),
  exclusions: z.array(listItem).max(30),
};

const discountRule = (value: { priceInr?: number; originalPriceInr?: number | null }) =>
  value.originalPriceInr === undefined ||
  value.originalPriceInr === null ||
  value.priceInr === undefined ||
  value.originalPriceInr > value.priceInr;

const discountError = {
  message: "Original price must be higher than the price",
  path: ["originalPriceInr"],
};

/** New destinations are drafts. Only a title and category are required up front. */
export const createDestinationSchema = z
  .object(fields)
  .partial()
  .required({ title: true, categoryId: true })
  .refine(discountRule, discountError);

/** The editor sends the whole form; every field is optional so partial updates also work. */
export const updateDestinationSchema = z.object(fields).partial().refine(discountRule, discountError);

export const listAdminDestinationsSchema = z.object({
  ...adminPageQuery,
  q: z.string().trim().min(1).max(100).optional(),
  status: z.enum(["all", "published", "draft", "archived"]).default("all"),
  category: z.string().trim().min(1).max(80).optional(),
  featured: boolQuery,
  sort: z.enum(["updated", "newest", "title", "price_asc", "price_desc"]).default("updated"),
});

export const featuredSchema = z.object({ isFeatured: z.boolean() });

export const bulkSchema = idListSchema.extend({
  action: z.enum(["publish", "unpublish", "archive", "feature", "unfeature"]),
});

export type BulkAction = z.infer<typeof bulkSchema>["action"];
export type CreateDestinationInput = z.infer<typeof createDestinationSchema>;
export type UpdateDestinationInput = z.infer<typeof updateDestinationSchema>;
export type ListAdminDestinationsQuery = z.infer<typeof listAdminDestinationsSchema>;
