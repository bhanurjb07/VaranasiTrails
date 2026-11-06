import { beforeEach, describe, expect, it, vi } from "vitest";

import { parseEnv } from "../src/config/env.js";
import { sendEmail } from "../src/lib/mailer.js";
import { prisma } from "../src/lib/prisma.js";
import { buildCookieOptions } from "../src/utils/cookies.js";
import { testEnv } from "./testEnv.js";
import {
  PASSWORD,
  api,
  emailsTo,
  lastCodeFor,
  resetDatabase,
  signup,
  signupAndVerify,
  uniqueUser,
} from "./helpers.js";

beforeEach(resetDatabase);

describe("signup replaces pending accounts (no email/phone squatting)", () => {
  it("lets a new submission take over an unverified account with the same email", async () => {
    const squatter = uniqueUser("victim");
    await signup({ ...squatter, name: "Squatter", password: "Squatter123" }).expect(201);
    const pending = await prisma.user.findUniqueOrThrow({ where: { email: squatter.email } });
    const staleCode = lastCodeFor(squatter.email);

    // The real owner signs up with the same email (and a new phone).
    const owner = { ...uniqueUser(), email: squatter.email, name: "Real Owner" };
    await signup(owner).expect(201);

    const users = await prisma.user.findMany({ where: { email: squatter.email } });
    expect(users).toHaveLength(1);
    // Same row, new details: the pending account was replaced, not duplicated.
    expect(users[0]).toMatchObject({ id: pending.id, name: "Real Owner", phone: `+91${owner.phone}` });

    // The squatter's password no longer works, the owner's does after verifying.
    const fresh = lastCodeFor(owner.email);
    expect(emailsTo(owner.email)).toHaveLength(2);
    await api().post("/api/auth/verify-email").send({ email: owner.email, otp: staleCode }).expect(
      staleCode === fresh ? 200 : 400,
    );
    if (staleCode !== fresh) {
      await api().post("/api/auth/verify-email").send({ email: owner.email, otp: fresh }).expect(200);
    }
    await api().post("/api/auth/login").send({ email: owner.email, password: "Squatter123" }).expect(401);
    await api().post("/api/auth/login").send({ email: owner.email, password: owner.password }).expect(200);
  });

  it("lets a new submission take over an unverified account with the same phone", async () => {
    const first = uniqueUser();
    await signup(first).expect(201);

    const second = { ...uniqueUser(), phone: first.phone };
    await signup(second).expect(201);

    const users = await prisma.user.findMany();
    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject({ email: second.email, phone: `+91${first.phone}` });
  });

  it("when the email is pending and the phone belongs to another pending account, keeps one account", async () => {
    const a = uniqueUser("a");
    const b = uniqueUser("b");
    await signup(a).expect(201);
    await signup(b).expect(201);

    // Email of A plus phone of B: both are pending, so they collapse into one account.
    const merged = { ...uniqueUser(), email: a.email, phone: b.phone };
    await signup(merged).expect(201);

    const users = await prisma.user.findMany();
    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject({ email: a.email, phone: `+91${b.phone}` });
  });

  it("returns 409 when the email is pending but the phone belongs to a VERIFIED account", async () => {
    const verified = await signupAndVerify();
    const pending = uniqueUser();
    await signup(pending).expect(201);

    const res = await signup({ ...uniqueUser(), email: pending.email, phone: verified.user.phone }).expect(409);

    expect(res.body.code).toBe("ACCOUNT_EXISTS");
    // The pending account was left untouched.
    const row = await prisma.user.findUniqueOrThrow({ where: { email: pending.email } });
    expect(row.phone).toBe(`+91${pending.phone}`);
  });

  it("still returns 409 ACCOUNT_EXISTS when the existing account is verified", async () => {
    const { user } = await signupAndVerify();

    const res = await signup({ ...uniqueUser(), email: user.email }).expect(409);

    expect(res.body.code).toBe("ACCOUNT_EXISTS");
    await api().post("/api/auth/login").send({ email: user.email, password: PASSWORD }).expect(200);
  });
});

describe("signup is retryable when the OTP email fails", () => {
  it("fails once, then the same request succeeds with no stuck 409", async () => {
    const user = uniqueUser();
    vi.mocked(sendEmail).mockRejectedValueOnce(new Error("Brevo is down"));

    const failed = await signup(user);
    expect(failed.status).toBeGreaterThanOrEqual(500);

    const retry = await signup(user).expect(201);
    expect(retry.body.message).toMatch(/code/i);
    expect(emailsTo(user.email)).toHaveLength(2);

    const code = lastCodeFor(user.email);
    await api().post("/api/auth/verify-email").send({ email: user.email, otp: code }).expect(200);
    expect(await prisma.user.count({ where: { email: user.email } })).toBe(1);
  });

  it("does not count a failed send toward the cooldown", async () => {
    const user = uniqueUser();
    vi.mocked(sendEmail).mockRejectedValueOnce(new Error("Brevo is down"));
    await signup(user);

    expect(await prisma.otp.count()).toBe(0);
  });
});

describe("blocked users", () => {
  it("cannot log in, refresh or use authenticated routes", async () => {
    const session = await signupAndVerify();
    await prisma.user.update({ where: { id: session.userId }, data: { isBlocked: true } });

    const me = await api().get("/api/users/me").set({ Authorization: `Bearer ${session.accessToken}` }).expect(403);
    expect(me.body.code).toBe("ACCOUNT_BLOCKED");

    const login = await api()
      .post("/api/auth/login")
      .send({ email: session.user.email, password: PASSWORD })
      .expect(403);
    expect(login.body.code).toBe("ACCOUNT_BLOCKED");

    await api().post("/api/auth/refresh").set("Cookie", session.cookie).expect(403);
  });

  it("records the last login time", async () => {
    const session = await signupAndVerify();
    const first = await prisma.user.findUniqueOrThrow({ where: { id: session.userId } });
    expect(first.lastLoginAt).not.toBeNull();
  });
});

describe("configuration", () => {
  const base = { ...testEnv } as Record<string, string | undefined>;

  it("TRUST_PROXY_HOPS defaults to 1 and accepts an integer", () => {
    expect(parseEnv(base).TRUST_PROXY_HOPS).toBe(1);
    expect(parseEnv({ ...base, TRUST_PROXY_HOPS: "2" }).TRUST_PROXY_HOPS).toBe(2);
    expect(() => parseEnv({ ...base, TRUST_PROXY_HOPS: "many" })).toThrow(/TRUST_PROXY_HOPS/);
  });

  it("COOKIE_SAMESITE defaults to lax and only accepts lax or none", () => {
    expect(parseEnv(base).COOKIE_SAMESITE).toBe("lax");
    expect(parseEnv({ ...base, COOKIE_SAMESITE: "none" }).COOKIE_SAMESITE).toBe("none");
    expect(() => parseEnv({ ...base, COOKIE_SAMESITE: "strict" })).toThrow(/COOKIE_SAMESITE/);
  });

  it("builds refresh cookie options for subdomain setups", () => {
    const lax = buildCookieOptions({ nodeEnv: "production", sameSite: "lax", domain: ".example.com" });
    expect(lax).toMatchObject({ httpOnly: true, secure: true, sameSite: "lax", domain: ".example.com", path: "/api" });

    // SameSite=None must be Secure, even on plain-http local development.
    const none = buildCookieOptions({ nodeEnv: "development", sameSite: "none" });
    expect(none).toMatchObject({ sameSite: "none", secure: true });
    expect(none).not.toHaveProperty("domain");

    expect(buildCookieOptions({ nodeEnv: "development", sameSite: "lax" }).secure).toBe(false);
  });

  it("ADMIN_* are optional but validated together and strongly", () => {
    expect(parseEnv(base).ADMIN_EMAIL).toBeUndefined();
    expect(() => parseEnv({ ...base, ADMIN_EMAIL: "boss@example.com" })).toThrow(/set together/);
    expect(() => parseEnv({ ...base, ADMIN_EMAIL: "boss@example.com", ADMIN_PASSWORD: "weakpass1" })).toThrow(
      /ADMIN_PASSWORD/,
    );

    const ok = parseEnv({ ...base, ADMIN_EMAIL: "Boss@Example.com", ADMIN_PASSWORD: "StrongPassw0rd" });
    expect(ok.ADMIN_EMAIL).toBe("boss@example.com");
  });
});
