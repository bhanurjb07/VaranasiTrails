import { z } from "zod";

export const wishlistParamsSchema = z.object({
  destinationId: z.string().min(1).max(64),
});
