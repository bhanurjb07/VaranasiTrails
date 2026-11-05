import type { Request, Response } from "express";

import { changePasswordSchema, updateProfileSchema } from "../../schemas/user/user.schemas.js";
import * as userService from "../../services/user/user.service.js";
import { getRefreshCookie } from "../../utils/cookies.js";

export const getMe = async (req: Request, res: Response) => {
  res.json({ user: await userService.getProfile(req.user!.sub) });
};

export const updateMe = async (req: Request, res: Response) => {
  const input = updateProfileSchema.parse(req.body);

  res.json({ user: await userService.updateProfile(req.user!.sub, input) });
};

export const changePassword = async (req: Request, res: Response) => {
  const input = changePasswordSchema.parse(req.body);
  await userService.changePassword(req.user!.sub, input, getRefreshCookie(req));

  res.json({ message: "Password changed. Other sessions have been signed out." });
};
