import { Router } from "express";

import * as reviewController from "../../controllers/admin/review.controller.js";

export const adminReviewRouter = Router();

adminReviewRouter.get("/", reviewController.list);
adminReviewRouter.patch("/:id/hide", reviewController.hide);
adminReviewRouter.patch("/:id/unhide", reviewController.unhide);
adminReviewRouter.delete("/:id", reviewController.remove);
