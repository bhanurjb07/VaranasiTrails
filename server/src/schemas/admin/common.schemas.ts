import { z } from "zod";

import { limitField, pageField } from "../common/common.schemas.js";

export const idParamSchema = z.object({ id: z.string().min(1).max(64) });

export const adminPageQuery = {
  page: pageField,
  limit: limitField(100, 20),
};

/** "true" / "false" query strings to booleans. */
export const boolQuery = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .optional();

/** ISO date or datetime query value. */
export const dateQuery = z.coerce.date().optional();

export const idListSchema = z.object({
  ids: z
    .array(z.string().min(1).max(64))
    .min(1, "Provide at least one id")
    .max(200)
    .refine((ids) => new Set(ids).size === ids.length, "Ids must be unique"),
});
