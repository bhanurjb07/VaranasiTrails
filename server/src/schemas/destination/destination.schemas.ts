import { z } from "zod";

import { limitField, pageField } from "../common/common.schemas.js";

const intParam = z.coerce.number().int().min(0).optional();

export const listDestinationsSchema = z.object({
  q: z.string().trim().min(1).max(80).optional(),
  category: z.string().trim().min(1).max(80).optional(),
  minPrice: intParam,
  maxPrice: intParam,
  minDays: intParam,
  maxDays: intParam,
  difficulty: z.enum(["EASY", "MODERATE", "HARD"]).optional(),
  featured: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  sort: z.enum(["price_asc", "price_desc", "rating", "newest", "popular"]).default("popular"),
  page: pageField,
  limit: limitField(24, 12),
});

export const slugParamSchema = z.object({
  slug: z.string().trim().min(1).max(120),
});

export type ListDestinationsQuery = z.infer<typeof listDestinationsSchema>;
