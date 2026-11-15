import { Router } from "express";

import * as careerController from "../../controllers/career/career.controller.js";
import type { NextFunction, Request, Response } from "express";

export const careerRouter = Router();

// Listings change when an admin publishes or hides one, so browsers must re-check each time
// (the 60 second cache used for trips would show a closed role for up to a minute).
const revalidate = (_req: Request, res: Response, next: NextFunction) => {
  res.set("Cache-Control", "no-cache");
  next();
};

careerRouter.get("/", revalidate, careerController.list);
careerRouter.get("/:id", revalidate, careerController.get);
