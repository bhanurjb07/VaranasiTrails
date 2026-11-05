import { execSync } from "node:child_process";
import fs from "node:fs";

import { testDbFile, testEnv } from "./testEnv.js";

export const setup = () => {
  // Build the schema from the real migrations in a fresh temp database.
  execSync("npx prisma migrate deploy", {
    stdio: "pipe",
    env: { ...process.env, DATABASE_URL: testEnv.DATABASE_URL },
  });
};

export const teardown = () => {
  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    fs.rmSync(`${testDbFile}${suffix}`, { force: true });
  }
};
