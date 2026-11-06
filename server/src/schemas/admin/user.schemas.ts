import { z } from "zod";

import { adminPageQuery, boolQuery } from "./common.schemas.js";

export const listUsersSchema = z.object({
  ...adminPageQuery,
  q: z.string().trim().min(1).max(100).optional(),
  verified: boolQuery,
  blocked: boolQuery,
});

export type ListUsersQuery = z.infer<typeof listUsersSchema>;
