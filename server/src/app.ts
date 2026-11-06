import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { config } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { globalLimiter } from "./middleware/rateLimit.js";
import { apiRouter } from "./routes/index.js";

export const app = express();

// Hosts sit behind reverse proxies; the hop count (TRUST_PROXY_HOPS) is needed for
// correct client IPs and rate limiting.
app.set("trust proxy", config.trustProxyHops);

app.use(helmet());
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(globalLimiter);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
