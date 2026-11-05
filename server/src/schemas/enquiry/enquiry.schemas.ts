import { z } from "zod";

import { emailField, phoneField } from "../common/common.schemas.js";

export const createEnquirySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: emailField,
  phone: phoneField,
  destinationId: z.string().min(1).max(64).optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
