import { Router } from "express";

import * as reviewController from "../../controllers/review/review.controller.js";
import { publicCache } from "../../middleware/publicCache.js";
import { requireAuth, requireVerifiedEmail } from "../../middleware/requireAuth.js";

// Mounted at /destinations/:slug/reviews
export const reviewRouter = Router({ mergeParams: true });

reviewRouter.get("/", publicCache, reviewController.list);
reviewRouter.post("/", requireAuth, requireVerifiedEmail, reviewController.create);
reviewRouter.patch("/:reviewId", requireAuth, reviewController.update);
reviewRouter.delete("/:reviewId", requireAuth, reviewController.remove);
