import { z } from "zod";

import { adminPageQuery, boolQuery } from "./common.schemas.js";

const text = (max: number) => z.string().trim().max(max);
const listItem = z.string().trim().min(1, "Cannot be empty").max(300);

/** Where candidates apply: a web page or a mailto link. Anything else (javascript:, data:, ...) is refused. */
const applyUrl = z
  .string()
  .trim()
  .min(1, "Add a link where people can apply")
  .max(500)
  .refine((value) => {
    if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value)) return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "Use a web link starting with https:// or an email link like mailto:jobs@example.com");

/** The last day applications are accepted, as YYYY-MM-DD. */
const closingDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD")
  .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime()), "That is not a real date");

const fields = {
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  department: z.string().trim().min(2, "Add a department, for example Backend").max(80),
  location: z.string().trim().min(2, "Add a location, or Remote").max(120),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"]),
  workMode: z.enum(["ONSITE", "REMOTE", "HYBRID"]),
  experience: text(80).nullable(),
  salary: text(80).nullable(),
  aboutRole: z.string().trim().min(20, "Describe the role in at least 20 characters").max(5000),
  responsibilities: z.array(listItem).max(30),
  requirements: z.array(listItem).min(1, "Add at least one requirement").max(30),
  applyUrl,
  closesAt: closingDate.nullable(),
  isPublished: z.boolean(),
};

const requiredOnCreate = {
  title: true,
  department: true,
  location: true,
  aboutRole: true,
  requirements: true,
  applyUrl: true,
} as const;

export const createCareerSchema = z.object(fields).partial().required(requiredOnCreate);

export const updateCareerSchema = z
  .object(fields)
  .partial()
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "Provide at least one field to update",
  });

export const listAdminCareersSchema = z.object({
  ...adminPageQuery,
  q: z.string().trim().min(1).max(100).optional(),
  published: boolQuery,
  department: z.string().trim().min(1).max(80).optional(),
});

export type CreateCareerInput = z.infer<typeof createCareerSchema>;
export type UpdateCareerInput = z.infer<typeof updateCareerSchema>;
export type ListAdminCareersQuery = z.infer<typeof listAdminCareersSchema>;
