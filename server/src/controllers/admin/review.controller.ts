import type { Request, Response } from "express";

import { idParamSchema } from "../../schemas/admin/common.schemas.js";
import { listAdminReviewsSchema } from "../../schemas/admin/review.schemas.js";
import * as reviewService from "../../services/admin/review.service.js";

const idOf = (req: Request) => idParamSchema.parse(req.params).id;

export const list = async (req: Request, res: Response) => {
  res.json(await reviewService.listAdminReviews(listAdminReviewsSchema.parse(req.query)));
};

export const hide = async (req: Request, res: Response) => {
  res.json({ review: await reviewService.setHidden(req.user!.sub, idOf(req), true) });
};

export const unhide = async (req: Request, res: Response) => {
  res.json({ review: await reviewService.setHidden(req.user!.sub, idOf(req), false) });
};

export const remove = async (req: Request, res: Response) => {
  await reviewService.deleteReview(req.user!.sub, idOf(req));

  res.status(204).end();
};
