import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { httpServer } from "./httpServer.js";
import { prisma } from "../src/lib/prisma.js";
import { bearer, createAdminSession, resetDatabase, signupAndVerify } from "./helpers.js";

type Method = "get" | "post" | "patch" | "put" | "delete";

// Every admin route, grouped by router. Anonymous callers must get 401 and normal
// users 403 on all of them.
const routes: Record<string, [Method, string][]> = {
  dashboard: [["get", "/dashboard"]],
  auditLog: [["get", "/audit-log"]],
  categories: [
    ["get", "/categories"],
    ["post", "/categories"],
    ["patch", "/categories/reorder"],
    ["patch", "/categories/x"],
    ["delete", "/categories/x"],
  ],
  destinations: [
    ["get", "/destinations"],
    ["post", "/destinations"],
    ["post", "/destinations/bulk"],
    ["get", "/destinations/x"],
    ["patch", "/destinations/x"],
    ["delete", "/destinations/x"],
    ["post", "/destinations/x/publish"],
    ["post", "/destinations/x/unpublish"],
    ["patch", "/destinations/x/featured"],
    ["post", "/destinations/x/duplicate"],
    ["post", "/destinations/x/archive"],
    ["post", "/destinations/x/restore"],
  ],
  media: [
    ["post", "/uploads/presign"],
    ["post", "/destinations/x/images"],
    ["patch", "/destinations/x/images/reorder"],
    ["patch", "/destinations/x/images/y"],
    ["delete", "/destinations/x/images/y"],
    ["put", "/destinations/x/video"],
    ["delete", "/destinations/x/video"],
  ],
  enquiries: [
    ["get", "/enquiries"],
    ["get", "/enquiries/export.csv"],
    ["get", "/enquiries/x"],
    ["patch", "/enquiries/x"],
    ["delete", "/enquiries/x"],
  ],
  users: [
    ["get", "/users"],
    ["get", "/users/x"],
    ["patch", "/users/x/block"],
    ["patch", "/users/x/unblock"],
  ],
  reviews: [
    ["get", "/reviews"],
    ["patch", "/reviews/x/hide"],
    ["patch", "/reviews/x/unhide"],
    ["delete", "/reviews/x"],
  ],
};

beforeEach(resetDatabase);

describe.each(Object.entries(routes))("admin %s router", (_name, endpoints) => {
  it.each(endpoints)("%s %s rejects anonymous callers with 401", async (method, path) => {
    const res = await request(httpServer)[method](`/api/admin${path}`).send({});

    expect(res.status).toBe(401);
  });

  it("rejects a normal verified user with 403 on every route", async () => {
    const { accessToken } = await signupAndVerify();

    for (const [method, path] of endpoints) {
      const res = await request(httpServer)[method](`/api/admin${path}`).set(bearer(accessToken)).send({});
      expect(res.status, `${method.toUpperCase()} ${path}`).toBe(403);
      expect(res.body.message).toBe("Admin access required");
    }
  });
});

describe("admin access details", () => {
  it("lets the admin in", async () => {
    const { token } = await createAdminSession();

    await request(httpServer).get("/api/admin/dashboard").set(bearer(token)).expect(200);
  });

  it("re-checks the role in the database, so a demoted admin loses access immediately", async () => {
    const { token, userId } = await createAdminSession();
    await prisma.user.update({ where: { id: userId }, data: { role: "USER" } });

    await request(httpServer).get("/api/admin/dashboard").set(bearer(token)).expect(403);
  });

  it("cuts off a blocked admin account", async () => {
    const { token, userId } = await createAdminSession();
    await prisma.user.update({ where: { id: userId }, data: { isBlocked: true } });

    const res = await request(httpServer).get("/api/admin/dashboard").set(bearer(token)).expect(403);
    expect(res.body.code).toBe("ACCOUNT_BLOCKED");
  });
});
