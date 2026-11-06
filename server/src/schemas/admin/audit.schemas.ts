import { z } from "zod";

import { adminPageQuery, dateQuery } from "./common.schemas.js";

export const listAuditSchema = z.object({
  ...adminPageQuery,
  action: z.string().trim().min(1).max(60).optional(),
  entityType: z.string().trim().min(1).max(40).optional(),
  entityId: z.string().trim().min(1).max(64).optional(),
  adminId: z.string().trim().min(1).max(64).optional(),
  q: z.string().trim().min(1).max(100).optional(),
  from: dateQuery,
  to: dateQuery,
});

export type ListAuditQuery = z.infer<typeof listAuditSchema>;
