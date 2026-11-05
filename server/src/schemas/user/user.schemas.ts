import { z } from "zod";

import { passwordField, phoneField } from "../common/common.schemas.js";

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80).optional(),
    phone: phoneField.optional(),
  })
  .refine((value) => value.name !== undefined || value.phone !== undefined, {
    message: "Provide at least one field to update",
  });

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required").max(200),
  newPassword: passwordField,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
