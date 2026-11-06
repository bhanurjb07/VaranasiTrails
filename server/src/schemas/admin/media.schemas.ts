import { z } from "zod";

import { idListSchema } from "./common.schemas.js";

/** Upload target: a destination (photos, video) or a category (its image). Exactly one. */
export const presignSchema = z
  .object({
    destinationId: z.string().min(1).max(64).optional(),
    categoryId: z.string().min(1).max(64).optional(),
    filename: z.string().trim().min(1).max(200),
    contentType: z.string().trim().min(1).max(100),
    sizeBytes: z.number().int().positive(),
  })
  .refine((value) => Boolean(value.destinationId) !== Boolean(value.categoryId), {
    message: "Send either destinationId or categoryId",
  });

const objectKey = z.string().trim().min(1).max(200);

export const addImageSchema = z.object({
  key: objectKey,
  alt: z.string().trim().max(200).default(""),
});

export const updateImageSchema = z
  .object({
    alt: z.string().trim().max(200).optional(),
    isCover: z.boolean().optional(),
  })
  .refine((value) => value.alt !== undefined || value.isCover !== undefined, {
    message: "Provide alt or isCover",
  });

export const reorderImagesSchema = idListSchema;

export const imageParamsSchema = z.object({
  id: z.string().min(1).max(64),
  imageId: z.string().min(1).max(64),
});

/** Exactly one of: a YouTube link, or the key of an uploaded video. */
export const setVideoSchema = z
  .object({
    youtubeUrl: z.string().trim().max(300).optional(),
    key: objectKey.optional(),
  })
  .refine((value) => Boolean(value.youtubeUrl) !== Boolean(value.key), {
    message: "Send either youtubeUrl or key",
  });

export type PresignInput = z.infer<typeof presignSchema>;
export type AddImageInput = z.infer<typeof addImageSchema>;
export type UpdateImageInput = z.infer<typeof updateImageSchema>;
export type SetVideoInput = z.infer<typeof setVideoSchema>;
