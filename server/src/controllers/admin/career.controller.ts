import type { Request, Response } from "express";

import { idParamSchema } from "../../schemas/admin/common.schemas.js";
import {
  createCareerSchema,
  listAdminCareersSchema,
  updateCareerSchema,
} from "../../schemas/admin/career.schemas.js";
import * as careerService from "../../services/admin/career.service.js";

const idOf = (req: Request) => idParamSchema.parse(req.params).id;

export const list = async (req: Request, res: Response) => {
  res.json(await careerService.listAdminCareers(listAdminCareersSchema.parse(req.query)));
};

export const departments = async (_req: Request, res: Response) => {
  res.json(await careerService.listDepartments());
};

export const get = async (req: Request, res: Response) => {
  res.json({ career: await careerService.getAdminCareer(idOf(req)) });
};

export const create = async (req: Request, res: Response) => {
  const career = await careerService.createCareer(req.user!.sub, createCareerSchema.parse(req.body));

  res.status(201).json({ career });
};

export const update = async (req: Request, res: Response) => {
  const career = await careerService.updateCareer(req.user!.sub, idOf(req), updateCareerSchema.parse(req.body));

  res.json({ career });
};

export const remove = async (req: Request, res: Response) => {
  await careerService.deleteCareer(req.user!.sub, idOf(req));

  res.status(204).end();
};
