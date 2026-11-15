import type { Request, Response } from "express";

import { idParamSchema } from "../../schemas/admin/common.schemas.js";
import * as careerService from "../../services/career/career.service.js";

export const list = async (_req: Request, res: Response) => {
  res.json(await careerService.listCareers());
};

export const get = async (req: Request, res: Response) => {
  res.json(await careerService.getCareer(idParamSchema.parse(req.params).id));
};
