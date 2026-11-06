import type { Request, Response } from "express";

import { idParamSchema } from "../../schemas/admin/common.schemas.js";
import { listUsersSchema } from "../../schemas/admin/user.schemas.js";
import * as userService from "../../services/admin/user.service.js";

const idOf = (req: Request) => idParamSchema.parse(req.params).id;

export const list = async (req: Request, res: Response) => {
  res.json(await userService.listUsers(listUsersSchema.parse(req.query)));
};

export const get = async (req: Request, res: Response) => {
  res.json({ user: await userService.getUser(idOf(req)) });
};

export const block = async (req: Request, res: Response) => {
  res.json({ user: await userService.setBlocked(req.user!.sub, idOf(req), true) });
};

export const unblock = async (req: Request, res: Response) => {
  res.json({ user: await userService.setBlocked(req.user!.sub, idOf(req), false) });
};
