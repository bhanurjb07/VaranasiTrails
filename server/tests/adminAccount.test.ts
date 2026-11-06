import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "../src/lib/prisma.js";
import { ensureAdmin, ensureAdminFromConfig } from "../src/services/admin/adminAccount.service.js";
import { ADMIN, api, resetDatabase, signupAndVerify } from "./helpers.js";

beforeEach(resetDatabase);

const adminRow = () => prisma.user.findUniqueOrThrow({ where: { email: ADMIN.email } });

describe("ensureAdmin", () => {
  it("creates a verified ADMIN that can log in through the normal endpoint", async () => {
    expect(await ensureAdmin(ADMIN)).toBe("created");

    const row = await adminRow();
    expect(row).toMatchObject({ role: "ADMIN", name: ADMIN.name, phone: ADMIN.phone, isBlocked: false });
    expect(row.emailVerifiedAt).not.toBeNull();

    const login = await api().post("/api/auth/login").send({ email: ADMIN.email, password: ADMIN.password }).expect(200);
    expect(login.body.user.role).toBe("ADMIN");
  });

  it("is idempotent: a second run changes nothing", async () => {
    await ensureAdmin(ADMIN);
    const before = await adminRow();

    expect(await ensureAdmin(ADMIN)).toBe("unchanged");

    const after = await adminRow();
    expect(after.passwordHash).toBe(before.passwordHash);
    expect(after.updatedAt).toEqual(before.updatedAt);
    expect(await prisma.user.count()).toBe(1);
  });

  it("promotes an existing normal user and keeps their password", async () => {
    // A normal account that already uses the admin email (with the same password).
    await signupAndVerify({ name: "Existing", email: ADMIN.email, phone: "9000000002", password: ADMIN.password });
    const before = await adminRow();
    expect(before.role).toBe("USER");

    expect(await ensureAdmin(ADMIN)).toBe("promoted");

    const after = await adminRow();
    expect(after.role).toBe("ADMIN");
    expect(after.passwordHash).toBe(before.passwordHash);
  });

  it("rotates the password when ADMIN_PASSWORD changes and revokes admin sessions", async () => {
    await ensureAdmin(ADMIN);
    const login = await api().post("/api/auth/login").send({ email: ADMIN.email, password: ADMIN.password }).expect(200);
    const cookie = (login.headers["set-cookie"] as unknown as string[])[0]!.split(";")[0]!;
    const oldHash = (await adminRow()).passwordHash;

    expect(await ensureAdmin({ ...ADMIN, password: "BrandNewAdmin9" })).toBe("password_rotated");

    expect((await adminRow()).passwordHash).not.toBe(oldHash);
    await api().post("/api/auth/login").send({ email: ADMIN.email, password: ADMIN.password }).expect(401);
    await api().post("/api/auth/login").send({ email: ADMIN.email, password: "BrandNewAdmin9" }).expect(200);
    await api().post("/api/auth/refresh").set("Cookie", cookie).expect(401);
  });

  it("unblocks and re-verifies a previously locked admin account", async () => {
    await ensureAdmin(ADMIN);
    await prisma.user.update({ where: { email: ADMIN.email }, data: { isBlocked: true, role: "USER" } });

    expect(await ensureAdmin(ADMIN)).toBe("promoted");

    expect(await adminRow()).toMatchObject({ role: "ADMIN", isBlocked: false });
  });
});

describe("ensureAdminFromConfig", () => {
  it("does nothing without ADMIN_EMAIL / ADMIN_PASSWORD", async () => {
    const log = vi.fn();

    expect(await ensureAdminFromConfig(undefined, log)).toBeNull();
    expect(log).not.toHaveBeenCalled();
    expect(await prisma.user.count()).toBe(0);
  });

  it("logs what happened without ever printing the password", async () => {
    const log = vi.fn();

    await ensureAdminFromConfig(ADMIN, log);
    await ensureAdminFromConfig(ADMIN, log);
    await ensureAdminFromConfig({ ...ADMIN, password: "AnotherAdminPass1" }, log);

    const lines = log.mock.calls.map(([line]) => String(line));
    expect(lines).toHaveLength(3);
    expect(lines[0]).toMatch(/Created/);
    expect(lines[1]).toMatch(/up to date/);
    expect(lines[2]).toMatch(/rotated/);
    for (const line of lines) {
      expect(line).not.toContain(ADMIN.password);
      expect(line).not.toContain("AnotherAdminPass1");
    }
  });

  it("never throws: a bootstrap problem is logged and the server can still start", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    // Phone already used by a different account makes the create fail.
    await signupAndVerify();
    const taken = (await prisma.user.findFirstOrThrow()).phone;

    await expect(ensureAdminFromConfig({ ...ADMIN, phone: taken }, vi.fn())).resolves.toBeNull();
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
