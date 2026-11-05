import { Router } from "express";

import * as userController from "../../controllers/user/user.controller.js";
import { passwordResetLimiter } from "../../middleware/rateLimit.js";
import { requireAuth } from "../../middleware/requireAuth.js";

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get("/me", userController.getMe);
userRouter.patch("/me", userController.updateMe);
userRouter.post("/me/change-password", passwordResetLimiter, userController.changePassword);
