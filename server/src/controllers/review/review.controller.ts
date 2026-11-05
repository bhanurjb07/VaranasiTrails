import type { Request, Response } from "express";

import { slugParamSchema } from "../../schemas/destination/destination.schemas.js";
import {
  createReviewSchema,
  listReviewsSchema,
  reviewParamsSchema,
  updateReviewSchema,
} from "../../schemas/review/review.schemas.js";
import * as reviewService from "../../services/review/review.service.js";

export const list = async (req: Request, res: Response) => {
  const { slug } = slugParamSchema.parse(req.params);

  res.json(await reviewService.listReviews(slug, listReviewsSchema.parse(req.query)));
};

export const create = async (req: Request, res: Response) => {
  const { slug } = slugParamSchema.parse(req.params);
  const review = await reviewService.createReview(
    req.user!.sub,
    slug,
    createReviewSchema.parse(req.body),
  );

  res.status(201).json({ review });
};

export const update = async (req: Request, res: Response) => {
  const { slug, reviewId } = reviewParamsSchema.parse(req.params);
  const review = await reviewService.updateReview(
    req.user!.sub,
    slug,
    reviewId,
    updateReviewSchema.parse(req.body),
  );

  res.json({ review });
};

export const remove = async (req: Request, res: Response) => {
  const { slug, reviewId } = reviewParamsSchema.parse(req.params);
  await reviewService.deleteReview(req.user!.sub, slug, reviewId);

  res.status(204).end();
};
