import { z } from "zod";

import { limitField, pageField } from "../common/common.schemas.js";

const rating = z.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5");
const title = z.string().trim().min(3, "Title must be at least 3 characters").max(100);
const comment = z.string().trim().min(10, "Comment must be at least 10 characters").max(2000);

export const listReviewsSchema = z.object({
  page: pageField,
  limit: limitField(50, 10),
});

export const createReviewSchema = z.object({ rating, title, comment });

export const updateReviewSchema = z
  .object({ rating: rating.optional(), title: title.optional(), comment: comment.optional() })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "Provide at least one field to update",
  });

export const reviewParamsSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  reviewId: z.string().min(1).max(64),
});

export type ListReviewsQuery = z.infer<typeof listReviewsSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
