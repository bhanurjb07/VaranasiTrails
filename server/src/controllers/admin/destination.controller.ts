import type { Request, Response } from "express";

import {
  bulkSchema,
  createDestinationSchema,
  featuredSchema,
  listAdminDestinationsSchema,
  updateDestinationSchema,
} from "../../schemas/admin/destination.schemas.js";
import { idParamSchema } from "../../schemas/admin/common.schemas.js";
import * as destinationService from "../../services/admin/destination.service.js";
import * as lifecycle from "../../services/admin/destinationLifecycle.service.js";

const adminId = (req: Request) => req.user!.sub;
const idOf = (req: Request) => idParamSchema.parse(req.params).id;

export const list = async (req: Request, res: Response) => {
  res.json(await destinationService.listAdminDestinations(listAdminDestinationsSchema.parse(req.query)));
};

export const get = async (req: Request, res: Response) => {
  res.json({ destination: await destinationService.getAdminDestination(idOf(req)) });
};

export const create = async (req: Request, res: Response) => {
  const destination = await destinationService.createDestination(adminId(req), createDestinationSchema.parse(req.body));

  res.status(201).json({ destination });
};

export const update = async (req: Request, res: Response) => {
  const destination = await destinationService.updateDestination(
    adminId(req),
    idOf(req),
    updateDestinationSchema.parse(req.body),
  );

  res.json({ destination });
};

export const publish = async (req: Request, res: Response) => {
  res.json({ destination: await destinationService.publishDestination(adminId(req), idOf(req)) });
};

export const unpublish = async (req: Request, res: Response) => {
  res.json({ destination: await destinationService.unpublishDestination(adminId(req), idOf(req)) });
};

export const setFeatured = async (req: Request, res: Response) => {
  const { isFeatured } = featuredSchema.parse(req.body);

  res.json({ destination: await destinationService.setFeatured(adminId(req), idOf(req), isFeatured) });
};

export const duplicate = async (req: Request, res: Response) => {
  res.status(201).json({ destination: await lifecycle.duplicateDestination(adminId(req), idOf(req)) });
};

export const archive = async (req: Request, res: Response) => {
  res.json({ destination: await lifecycle.archiveDestination(adminId(req), idOf(req)) });
};

export const restore = async (req: Request, res: Response) => {
  res.json({ destination: await lifecycle.restoreDestination(adminId(req), idOf(req)) });
};

export const remove = async (req: Request, res: Response) => {
  await lifecycle.deleteDestination(adminId(req), idOf(req));

  res.status(204).end();
};

export const bulk = async (req: Request, res: Response) => {
  const { ids, action } = bulkSchema.parse(req.body);

  res.json(await lifecycle.bulkDestinations(adminId(req), ids, action));
};
