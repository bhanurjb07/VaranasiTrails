import { defineConfig } from "vitest/config";

import { testEnv } from "./tests/testEnv.js";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    globalSetup: ["./tests/globalSetup.ts"],
    setupFiles: ["./tests/setup.ts"],
    env: testEnv,
    // All files share one SQLite file, so run them one after another.
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 60_000,
  },
});
