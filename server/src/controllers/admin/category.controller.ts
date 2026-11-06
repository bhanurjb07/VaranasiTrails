import type { Request, Response } from "express";

import { idListSchema, idParamSchema } from "../../schemas/admin/common.schemas.js";
import { createCategorySchema, updateCategorySchema } from "../../schemas/admin/category.schemas.js";
import * as categoryService from "../../services/admin/category.service.js";

export const list = async (_req: Request, res: Response) => {
  res.json(await categoryService.listCategories());
};

export const create = async (req: Request, res: Response) => {
  const category = await categoryService.createCategory(req.user!.sub, createCategorySchema.parse(req.body));

  res.status(201).json({ category });
};

export const update = async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const category = await categoryService.updateCategory(req.user!.sub, id, updateCategorySchema.parse(req.body));

  res.json({ category });
};

export const remove = async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  await categoryService.deleteCategory(req.user!.sub, id);

  res.status(204).end();
};

export const reorder = async (req: Request, res: Response) => {
  const { ids } = idListSchema.parse(req.body);

  res.json(await categoryService.reorderCategories(req.user!.sub, ids));
};
