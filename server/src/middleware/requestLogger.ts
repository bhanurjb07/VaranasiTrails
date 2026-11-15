import type { NextFunction, Request, Response } from "express";

import logger from "../utils/loggers.js";

/** One line per finished request: method, path, status and duration. Health checks are skipped. */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  if (req.path === "/health") return next();

  const started = process.hrtime.bigint();
  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - started) / 1e6;
    const meta = { ip: req.ip, ms: Math.round(ms) };
    const line = `${req.method} ${req.originalUrl.split("?")[0]} ${res.statusCode}`;

    if (res.statusCode >= 500) logger.error(line, meta);
    else if (res.statusCode >= 400) logger.warn(line, meta);
    else logger.info(line, meta);
  });
  next();
};
