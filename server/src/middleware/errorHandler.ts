import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { config } from "../config/env.js";
import { AppError } from "../utils/errors.js";

export const notFoundHandler = (req: Request, res: Response) => {
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}`, code: "NOT_FOUND" });
};

// Errors are always shaped { message, code?, errors? }.
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(422).json({
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (err instanceof AppError) {
    if (err.headers) res.set(err.headers);
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.code ? { code: err.code } : {}),
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  // Safety net for races on unique columns (e.g. two signups with one email).
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return res.status(409).json({ message: "Resource already exists", code: "CONFLICT" });
  }

  const type = (err as { type?: string } | null)?.type;
  if (type === "entity.parse.failed") {
    return res.status(400).json({ message: "Malformed JSON body", code: "INVALID_JSON" });
  }
  if (type === "entity.too.large") {
    return res.status(413).json({ message: "Request body too large", code: "PAYLOAD_TOO_LARGE" });
  }

  if (config.nodeEnv !== "test") {
    console.error(err);
  }

  res.status(500).json({ message: "Internal server error", code: "INTERNAL_ERROR" });
};
