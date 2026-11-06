import { Router } from "express";

import * as userController from "../../controllers/admin/user.controller.js";

export const adminUserRouter = Router();

adminUserRouter.get("/", userController.list);
adminUserRouter.get("/:id", userController.get);
adminUserRouter.patch("/:id/block", userController.block);
adminUserRouter.patch("/:id/unblock", userController.unblock);
