import type { Request, Response } from "express";

import { idParamSchema } from "../../schemas/admin/common.schemas.js";
import {
  addImageSchema,
  imageParamsSchema,
  presignSchema,
  reorderImagesSchema,
  setVideoSchema,
  updateImageSchema,
} from "../../schemas/admin/media.schemas.js";
import * as media from "../../services/admin/destinationMedia.service.js";

const adminId = (req: Request) => req.user!.sub;
const idOf = (req: Request) => idParamSchema.parse(req.params).id;

export const presign = async (req: Request, res: Response) => {
  res.json(await media.presignUpload(presignSchema.parse(req.body)));
};

export const addImage = async (req: Request, res: Response) => {
  const destination = await media.addImage(adminId(req), idOf(req), addImageSchema.parse(req.body));

  res.status(201).json({ destination });
};

export const reorderImages = async (req: Request, res: Response) => {
  const { ids } = reorderImagesSchema.parse(req.body);

  res.json({ destination: await media.reorderImages(adminId(req), idOf(req), ids) });
};

export const updateImage = async (req: Request, res: Response) => {
  const { id, imageId } = imageParamsSchema.parse(req.params);
  const destination = await media.updateImage(adminId(req), id, imageId, updateImageSchema.parse(req.body));

  res.json({ destination });
};

export const deleteImage = async (req: Request, res: Response) => {
  const { id, imageId } = imageParamsSchema.parse(req.params);

  res.json({ destination: await media.deleteImage(adminId(req), id, imageId) });
};

export const setVideo = async (req: Request, res: Response) => {
  res.json({ destination: await media.setVideo(adminId(req), idOf(req), setVideoSchema.parse(req.body)) });
};

export const removeVideo = async (req: Request, res: Response) => {
  res.json({ destination: await media.removeVideo(adminId(req), idOf(req)) });
};
