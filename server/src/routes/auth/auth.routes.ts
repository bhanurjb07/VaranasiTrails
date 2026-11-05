import { Router } from "express";

import * as authController from "../../controllers/auth/auth.controller.js";
import {
  loginLimiter,
  otpLimiter,
  passwordResetLimiter,
  signupLimiter,
} from "../../middleware/rateLimit.js";
import { requireAuth } from "../../middleware/requireAuth.js";

export const authRouter = Router();

authRouter.post("/signup", signupLimiter, authController.signup);
authRouter.post("/verify-email", otpLimiter, authController.verifyEmail);
authRouter.post("/resend-otp", otpLimiter, authController.resendOtp);
authRouter.post("/login", loginLimiter, authController.login);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.post("/forgot-password", passwordResetLimiter, authController.forgotPassword);
authRouter.post("/verify-reset-otp", passwordResetLimiter, authController.verifyResetOtp);
authRouter.post("/reset-password", passwordResetLimiter, authController.resetPassword);
authRouter.get("/me", requireAuth, authController.me);
