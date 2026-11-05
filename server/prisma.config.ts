import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7: the CLI (migrate, studio) reads the URL from here; the runtime
// client gets it from the libSQL driver adapter in src/lib/prisma.ts.
// Locally this is a SQLite file (file:./dev.db). Production Turso databases
// are migrated with `prisma migrate diff` + the Turso CLI (see README).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
});
