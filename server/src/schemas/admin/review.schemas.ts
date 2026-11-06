import { z } from "zod";

import { adminPageQuery, boolQuery } from "./common.schemas.js";

export const listAdminReviewsSchema = z.object({
  ...adminPageQuery,
  hidden: boolQuery,
  rating: z.coerce.number().int().min(1).max(5).optional(),
  destinationId: z.string().trim().min(1).max(64).optional(),
  q: z.string().trim().min(1).max(100).optional(),
});

export type ListAdminReviewsQuery = z.infer<typeof listAdminReviewsSchema>;
