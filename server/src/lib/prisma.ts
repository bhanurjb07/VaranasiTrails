import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

import { config } from "../config/env.js";

// Prisma 7 connects through a driver adapter. libSQL covers both a local SQLite file
// (file:./dev.db) and Turso (libsql://..., with an auth token).
const adapter = new PrismaLibSql({
  url: config.databaseUrl,
  authToken: config.databaseAuthToken,
});

export const prisma = new PrismaClient({
  adapter,
  log: config.nodeEnv === "development" ? ["warn", "error"] : ["error"],
});
