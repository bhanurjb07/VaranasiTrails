import { z } from "zod";

import { adminPageQuery, dateQuery } from "./common.schemas.js";

const status = z.enum(["NEW", "CONTACTED", "CLOSED"]);

const filters = {
  q: z.string().trim().min(1).max(100).optional(),
  status: status.optional(),
  destinationId: z.string().trim().min(1).max(64).optional(),
  from: dateQuery,
  to: dateQuery,
};

export const listEnquiriesSchema = z.object({ ...adminPageQuery, ...filters });

export const exportEnquiriesSchema = z.object(filters);

export const updateEnquirySchema = z
  .object({
    status: status.optional(),
    adminNotes: z.string().trim().max(2000).nullable().optional(),
  })
  .refine((value) => value.status !== undefined || value.adminNotes !== undefined, {
    message: "Provide status or adminNotes",
  });

export type ListEnquiriesQuery = z.infer<typeof listEnquiriesSchema>;
export type ExportEnquiriesQuery = z.infer<typeof exportEnquiriesSchema>;
export type UpdateEnquiryInput = z.infer<typeof updateEnquirySchema>;
