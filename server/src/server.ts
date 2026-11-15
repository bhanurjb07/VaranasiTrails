import { app } from "./app.js";
import { config } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { ensureAdminFromConfig } from "./services/admin/adminAccount.service.js";
import logger, { errorInfo } from "./utils/loggers.js";

logger.info("Starting VaranasiTrails API", { env: config.nodeEnv, port: config.port });

// Fail fast if the database is unreachable, instead of on the first request.
try {
  // $connect() alone does not touch a libSQL/Turso database, so run a real query
  // to prove the URL and auth token actually work.
  await prisma.$queryRaw`SELECT 1`;
  logger.success("Database connected");
} catch (error) {
  logger.critical("Could not connect to the database", errorInfo(error));
  process.exit(1);
}

// Optional bootstrap admin (ADMIN_EMAIL + ADMIN_PASSWORD). Idempotent and never fatal.
await ensureAdminFromConfig(config.admin);

const server = app.listen(config.port, () => {
  logger.success(`Server listening on port ${config.port} (${config.nodeEnv})`);
});

server.on("error", (error) => {
  logger.critical("HTTP server error", errorInfo(error));
  process.exit(1);
});

let shuttingDown = false;

const shutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.warn(`${signal} received, shutting down`);

  // Force exit if open connections never drain.
  const force = setTimeout(() => {
    logger.error("Shutdown timed out, forcing exit");
    process.exit(1);
  }, 10_000);
  force.unref();

  server.close(async () => {
    logger.info("HTTP server closed");
    try {
      await prisma.$disconnect();
      logger.info("Database disconnected");
    } catch (error) {
      logger.error("Error while disconnecting the database", errorInfo(error));
    }
    process.exit(0);
  });
};

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", errorInfo(reason));
});

process.on("uncaughtException", (error) => {
  logger.critical("Uncaught exception, exiting", errorInfo(error));
  process.exit(1);
});
