import { z } from "zod";

const fields = {
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  description: z.string().trim().max(300).nullable(),
  imageKey: z
    .string()
    .trim()
    .max(200)
    .regex(/^[A-Za-z0-9/_.-]+$/, "Invalid image key")
    .nullable(),
  isActive: z.boolean(),
};

export const createCategorySchema = z.object({
  name: fields.name,
  description: fields.description.optional(),
  imageKey: fields.imageKey.optional(),
  isActive: fields.isActive.optional(),
});

export const updateCategorySchema = z
  .object({
    name: fields.name.optional(),
    description: fields.description.optional(),
    imageKey: fields.imageKey.optional(),
    isActive: fields.isActive.optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "Provide at least one field to update",
  });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
