import type { Request, Response } from "express";

import { wishlistParamsSchema } from "../../schemas/wishlist/wishlist.schemas.js";
import * as wishlistService from "../../services/wishlist/wishlist.service.js";

export const list = async (req: Request, res: Response) => {
  res.json(await wishlistService.listWishlist(req.user!.sub));
};

export const add = async (req: Request, res: Response) => {
  const { destinationId } = wishlistParamsSchema.parse(req.params);
  await wishlistService.addToWishlist(req.user!.sub, destinationId);

  res.json({ wishlisted: true });
};

export const remove = async (req: Request, res: Response) => {
  const { destinationId } = wishlistParamsSchema.parse(req.params);
  await wishlistService.removeFromWishlist(req.user!.sub, destinationId);

  res.json({ wishlisted: false });
};
