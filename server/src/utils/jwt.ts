import jwt from "jsonwebtoken";

import { config } from "../config/env.js";

// Only the user id travels in the token. Role and verification state are
// always re-read from the database when they matter.
export interface JwtPayload {
  sub: string;
}

export const signAccessToken = (userId: string) =>
  jwt.sign({ sub: userId }, config.jwtSecret, {
    algorithm: "HS256",
    expiresIn: config.accessTokenTtl,
  });

export const verifyAccessToken = (token: string): JwtPayload => {
  const payload = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
  if (typeof payload === "string" || typeof payload.sub !== "string") {
    throw new Error("Malformed token");
  }
  return { sub: payload.sub };
};
