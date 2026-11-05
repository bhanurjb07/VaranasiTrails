import { Router } from "express";

import * as destinationController from "../../controllers/destination/destination.controller.js";
import { publicCache } from "../../middleware/publicCache.js";
import { reviewRouter } from "../review/review.routes.js";

export const destinationRouter = Router();

destinationRouter.get("/", publicCache, destinationController.list);
destinationRouter.use("/:slug/reviews", reviewRouter);
destinationRouter.get("/:slug", publicCache, destinationController.getBySlug);

export const categoryRouter = Router();

categoryRouter.get("/", publicCache, destinationController.listCategories);
