import http from "node:http";

import { app } from "../src/app.js";

// One long-lived HTTP server per test file. supertest creates (and tears down) a new
// server for EVERY request when it is handed the bare Express app; thousands of those
// per run made the worker die with a native crash on Windows (exit code 3221226505).
export const httpServer = http.createServer(app);

export const startHttpServer = () =>
  new Promise<void>((resolve) => {
    if (httpServer.listening) return resolve();
    httpServer.listen(0, "127.0.0.1", () => resolve());
  });

export const stopHttpServer = () =>
  new Promise<void>((resolve) => {
    if (!httpServer.listening) return resolve();
    httpServer.closeAllConnections();
    httpServer.close(() => resolve());
  });
