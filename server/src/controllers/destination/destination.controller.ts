import type { Request, Response } from "express";

import { listDestinationsSchema, slugParamSchema } from "../../schemas/destination/destination.schemas.js";
import * as destinationService from "../../services/destination/destination.service.js";

export const list = async (req: Request, res: Response) => {
  res.json(await destinationService.listDestinations(listDestinationsSchema.parse(req.query)));
};

export const getBySlug = async (req: Request, res: Response) => {
  const { slug } = slugParamSchema.parse(req.params);

  res.json({ destination: await destinationService.getDestinationBySlug(slug) });
};

export const listCategories = async (_req: Request, res: Response) => {
  res.json(await destinationService.listCategories());
};
