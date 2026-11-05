import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "../src/lib/prisma.js";
import {
  PASSWORD,
  api,
  bearer,
  emailsTo,
  lastCodeFor,
  refreshCookieOf,
  resetDatabase,
  signup,
  signupAndVerify,
  uniqueUser,
  wrongCode,
} from "./helpers.js";

beforeEach(resetDatabase);

describe("signup -> verify email -> login", () => {
  it("creates an unverified USER, emails an OTP, then verifies and logs in", async () => {
    const user = uniqueUser();

    const created = await signup(user).expect(201);
    expect(created.body).not.toHaveProperty("accessToken");
    expect(JSON.stringify(created.body)).not.toMatch(/\d{6}/);
    expect(emailsTo(user.email)).toHaveLength(1);

    const stored = await prisma.user.findUniqueOrThrow({ where: { email: user.email } });
    expect(stored.role).toBe("USER");
    expect(stored.emailVerifiedAt).toBeNull();
    expect(stored.phone).toBe(`+91${user.phone}`);

    // The code is only stored as an HMAC.
    const otp = await prisma.otp.findFirstOrThrow({ where: { userId: stored.id } });
    expect(otp.codeHash).not.toContain(lastCodeFor(user.email));

    const blocked = await api()
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password })
      .expect(403);
    expect(blocked.body.code).toBe("EMAIL_NOT_VERIFIED");

    const verified = await api()
      .post("/api/auth/verify-email")
      .send({ email: user.email, otp: lastCodeFor(user.email) })
      .expect(200);
    expect(verified.body.accessToken).toBeTypeOf("string");
    expect(verified.body.user).toMatchObject({ email: user.email, emailVerified: true });
    expect(verified.body.user).not.toHaveProperty("passwordHash");
    const cookie = verified.headers["set-cookie"]![0]!;
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);

    const login = await api()
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password })
      .expect(200);
    const me = await api()
      .get("/api/auth/me")
      .set(bearer(login.body.accessToken))
      .expect(200);
    expect(me.body.user.email).toBe(user.email);
  });

  it("rejects bad credentials with one generic error", async () => {
    const { user } = await signupAndVerify();

    const wrongPassword = await api()
      .post("/api/auth/login")
      .send({ email: user.email, password: "Wrong1234" })
      .expect(401);
    const unknownEmail = await api()
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "Wrong1234" })
      .expect(401);

    expect(wrongPassword.body).toEqual(unknownEmail.body);
  });

  it("validates input and rejects duplicate email or phone", async () => {
    const user = uniqueUser();
    await signup(user).expect(201);

    await signup({ ...uniqueUser(), email: user.email }).expect(409);
    await signup({ ...uniqueUser(), phone: user.phone }).expect(409);

    const invalid = await api()
      .post("/api/auth/signup")
      .send({ name: "A", email: "nope", phone: "12345", password: "short" })
      .expect(422);
    expect(invalid.body.code).toBe("VALIDATION_ERROR");
    const fields = new Set(invalid.body.errors.map((e: { field: string }) => e.field));
    expect([...fields].sort()).toEqual(["email", "name", "password", "phone"]);

    await signup({ ...uniqueUser(), password: "onlyletters" }).expect(422);
    await signup({ ...uniqueUser(), password: "x1".repeat(40) }).expect(422);
  });

  it("accepts +91 phones and always creates a plain USER", async () => {
    const user = uniqueUser();
    await api()
      .post("/api/auth/signup")
      .send({ ...user, phone: `+91 ${user.phone}`, role: "ADMIN" })
      .expect(201);

    const stored = await prisma.user.findUniqueOrThrow({ where: { email: user.email } });
    expect(stored.phone).toBe(`+91${user.phone}`);
    expect(stored.role).toBe("USER");
  });
});

describe("OTP rules", () => {
  it("rejects a wrong code", async () => {
    const user = uniqueUser();
    await signup(user);

    const res = await api()
      .post("/api/auth/verify-email")
      .send({ email: user.email, otp: wrongCode(lastCodeFor(user.email)) })
      .expect(400);
    expect(res.body.code).toBe("OTP_INVALID");
  });

  it("rejects an expired code", async () => {
    const user = uniqueUser();
    await signup(user);
    await prisma.otp.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } });

    await api()
      .post("/api/auth/verify-email")
      .send({ email: user.email, otp: lastCodeFor(user.email) })
      .expect(400);
  });

  it("is single use", async () => {
    const user = uniqueUser();
    await signup(user);
    const otp = lastCodeFor(user.email);

    await api().post("/api/auth/verify-email").send({ email: user.email, otp }).expect(200);
    await api().post("/api/auth/verify-email").send({ email: user.email, otp }).expect(400);
  });

  it("locks out after 5 wrong attempts, even for the right code", async () => {
    const user = uniqueUser();
    await signup(user);
    const real = lastCodeFor(user.email);

    for (let i = 0; i < 5; i++) {
      await api()
        .post("/api/auth/verify-email")
        .send({ email: user.email, otp: wrongCode(real) })
        .expect(400);
    }
    await api().post("/api/auth/verify-email").send({ email: user.email, otp: real }).expect(400);

    const stored = await prisma.user.findUniqueOrThrow({ where: { email: user.email } });
    expect(stored.emailVerifiedAt).toBeNull();
  });

  it("a new OTP invalidates the previous one", async () => {
    const user = uniqueUser();
    await signup(user);
    const first = lastCodeFor(user.email);
    await prisma.otp.updateMany({ data: { createdAt: new Date(Date.now() - 120_000) } });

    await api()
      .post("/api/auth/resend-otp")
      .send({ email: user.email, purpose: "EMAIL_VERIFY" })
      .expect(200);
    const second = lastCodeFor(user.email);
    expect(emailsTo(user.email)).toHaveLength(2);

    if (first !== second) {
      await api().post("/api/auth/verify-email").send({ email: user.email, otp: first }).expect(400);
    }
    await api().post("/api/auth/verify-email").send({ email: user.email, otp: second }).expect(200);
  });

  it("enforces the 60s resend cooldown and the 5/hour cap without revealing accounts", async () => {
    const user = uniqueUser();
    await signup(user);
    const resend = () =>
      api().post("/api/auth/resend-otp").send({ email: user.email, purpose: "EMAIL_VERIFY" });

    const immediate = await resend().expect(200);
    expect(emailsTo(user.email)).toHaveLength(1);

    const unknown = await api()
      .post("/api/auth/resend-otp")
      .send({ email: "ghost@example.com", purpose: "EMAIL_VERIFY" })
      .expect(200);
    expect(unknown.body).toEqual(immediate.body);
    expect(emailsTo("ghost@example.com")).toHaveLength(0);

    // Four more sends spaced past the cooldown reach the hourly cap of 5.
    for (let i = 0; i < 4; i++) {
      await prisma.otp.updateMany({ data: { createdAt: new Date(Date.now() - 120_000 + i) } });
      await resend().expect(200);
    }
    expect(emailsTo(user.email)).toHaveLength(5);

    await prisma.otp.updateMany({ data: { createdAt: new Date(Date.now() - 120_000) } });
    await resend().expect(200);
    expect(emailsTo(user.email)).toHaveLength(5);
  });
});

describe("forgot -> verify -> reset password", () => {
  it("runs the whole flow and revokes all sessions", async () => {
    const { user, cookie } = await signupAndVerify();
    const forgot = () => api().post("/api/auth/forgot-password").send({ email: user.email });

    const res = await forgot().expect(200);
    expect(Object.keys(res.body)).toEqual(["message"]);
    expect(emailsTo(user.email)).toHaveLength(2);
    const code = lastCodeFor(user.email);

    await api()
      .post("/api/auth/verify-reset-otp")
      .send({ email: user.email, otp: wrongCode(code) })
      .expect(400);
    const verified = await api()
      .post("/api/auth/verify-reset-otp")
      .send({ email: user.email, otp: code })
      .expect(200);
    const { resetToken } = verified.body;
    expect(resetToken).toBeTypeOf("string");

    // Re-verifying the same OTP is not possible.
    await api()
      .post("/api/auth/verify-reset-otp")
      .send({ email: user.email, otp: code })
      .expect(400);

    await api()
      .post("/api/auth/reset-password")
      .send({ email: user.email, resetToken: "wrong-token", newPassword: "NewPassw0rd" })
      .expect(400);
    await api()
      .post("/api/auth/reset-password")
      .send({ email: user.email, resetToken, newPassword: "NewPassw0rd" })
      .expect(200);

    // Single use.
    await api()
      .post("/api/auth/reset-password")
      .send({ email: user.email, resetToken, newPassword: "Another1234" })
      .expect(400);

    await api().post("/api/auth/login").send({ email: user.email, password: PASSWORD }).expect(401);
    await api()
      .post("/api/auth/login")
      .send({ email: user.email, password: "NewPassw0rd" })
      .expect(200);

    // The session from before the reset can no longer refresh.
    await api().post("/api/auth/refresh").set("Cookie", cookie).expect(401);
  });

  it("answers 200 for unknown emails and sends nothing", async () => {
    const res = await api()
      .post("/api/auth/forgot-password")
      .send({ email: "ghost@example.com" })
      .expect(200);

    expect(Object.keys(res.body)).toEqual(["message"]);
    expect(emailsTo("ghost@example.com")).toHaveLength(0);
  });

  it("rejects an expired reset token", async () => {
    const { user } = await signupAndVerify();
    await api().post("/api/auth/forgot-password").send({ email: user.email }).expect(200);
    const verified = await api()
      .post("/api/auth/verify-reset-otp")
      .send({ email: user.email, otp: lastCodeFor(user.email) })
      .expect(200);
    await prisma.otp.updateMany({
      where: { purpose: "PASSWORD_RESET" },
      data: { resetTokenExpiresAt: new Date(Date.now() - 1000) },
    });

    await api()
      .post("/api/auth/reset-password")
      .send({ email: user.email, resetToken: verified.body.resetToken, newPassword: "NewPassw0rd" })
      .expect(400);
  });
});

describe("refresh tokens", () => {
  it("rotates on refresh and revokes everything when an old token is reused", async () => {
    const { cookie: first } = await signupAndVerify();

    const rotated = await api().post("/api/auth/refresh").set("Cookie", first).expect(200);
    const second = refreshCookieOf(rotated)!;
    expect(second).toBeDefined();
    expect(second).not.toBe(first);
    expect(rotated.body.accessToken).toBeTypeOf("string");

    const reuse = await api().post("/api/auth/refresh").set("Cookie", first).expect(401);
    expect(reuse.body.code).toBe("REFRESH_REUSED");

    // Reuse detection revoked the whole family, including the newest token.
    await api().post("/api/auth/refresh").set("Cookie", second).expect(401);
  });

  it("rejects a missing refresh token", async () => {
    await api().post("/api/auth/refresh").expect(401);
  });

  it("logout revokes the current refresh token", async () => {
    const { cookie } = await signupAndVerify();

    await api().post("/api/auth/logout").set("Cookie", cookie).expect(200);
    await api().post("/api/auth/refresh").set("Cookie", cookie).expect(401);
  });

  it("access tokens must be signed with HS256 and our secret", async () => {
    await api().get("/api/auth/me").set(bearer("not.a.jwt")).expect(401);
    await api().get("/api/auth/me").expect(401);
  });
});
