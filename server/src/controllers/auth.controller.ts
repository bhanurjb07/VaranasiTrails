import type { Request, Response } from "express";

import {
  forgotPasswordSchema,
  loginSchema,
  resendOtpSchema,
  resetPasswordSchema,
  signupSchema,
  verifyEmailSchema,
  verifyResetOtpSchema,
} from "../schemas/auth.schemas.js";
import * as authService from "../services/auth.service.js";
import * as tokenService from "../services/token.service.js";
import {
  clearRefreshCookie,
  getRefreshCookie,
  sessionMeta,
  setRefreshCookie,
} from "../utils/cookies.js";
import { notFound, unauthorized } from "../utils/errors.js";

const GENERIC_OTP_MESSAGE = "If an account exists for that email, a code has been sent";

const sendSession = (
  res: Response,
  session: { user: unknown; accessToken: string; refreshToken: string },
  status = 200,
) => {
  setRefreshCookie(res, session.refreshToken);
  res.status(status).json({ user: session.user, accessToken: session.accessToken });
};

export const signup = async (req: Request, res: Response) => {
  await authService.signup(signupSchema.parse(req.body));

  res.status(201).json({ message: "Account created. We emailed you a 6-digit code to verify your email." });
};

export const verifyEmail = async (req: Request, res: Response) => {
  const session = await authService.verifyEmail(verifyEmailSchema.parse(req.body), sessionMeta(req));
  sendSession(res, session);
};

export const resendOtp = async (req: Request, res: Response) => {
  await authService.resendOtp(resendOtpSchema.parse(req.body));

  res.json({ message: GENERIC_OTP_MESSAGE });
};

export const login = async (req: Request, res: Response) => {
  const session = await authService.login(loginSchema.parse(req.body), sessionMeta(req));
  sendSession(res, session);
};

export const refresh = async (req: Request, res: Response) => {
  const token = getRefreshCookie(req);
  if (!token) throw unauthorized("Missing refresh token", "REFRESH_INVALID");

  try {
    const { user, accessToken, refreshToken } = await tokenService.rotateSession(token, sessionMeta(req));
    sendSession(res, { user: authService.publicUser(user), accessToken, refreshToken });
  } catch (error) {
    clearRefreshCookie(res);
    throw error;
  }
};

export const logout = async (req: Request, res: Response) => {
  const token = getRefreshCookie(req);
  if (token) await tokenService.revokeSession(token);

  clearRefreshCookie(res);
  res.json({ message: "Logged out" });
};

export const forgotPassword = async (req: Request, res: Response) => {
  await authService.forgotPassword(forgotPasswordSchema.parse(req.body));

  res.json({ message: GENERIC_OTP_MESSAGE });
};


export const verifyResetOtp = async (req: Request, res: Response) => {
  res.json(await authService.verifyResetOtpCode(verifyResetOtpSchema.parse(req.body)));
};

export const resetPassword = async (req: Request, res: Response) => {
  await authService.resetPassword(resetPasswordSchema.parse(req.body));

  res.json({ message: "Password has been reset. Please log in again." });
};

export const me = async (req: Request, res: Response) => {
  const user = await authService.getUserById(req.user!.sub);
  if (!user) throw notFound("User not found");

  res.json({ user: authService.publicUser(user) });
};

