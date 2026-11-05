import type { NextFunction, Request, Response } from "express";

/** Marks a public GET response as cacheable for 60 seconds. */
export const publicCache = (_req: Request, res: Response, next: NextFunction) => {
  res.set("Cache-Control", "public, max-age=60");
  next();
};
