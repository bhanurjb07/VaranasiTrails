import request from "supertest";
import { expect, vi } from "vitest";

import { app } from "../src/app.js";
import { sendEmail } from "../src/lib/mailer.js";
import { prisma } from "../src/lib/prisma.js";

export const api = () => request(app);

export const PASSWORD = "Passw0rdOK";

let counter = 0;
export const uniqueUser = (prefix = "user") => {
  counter += 1;
  const n = String(counter).padStart(8, "0");
  return {
    name: `Test ${prefix} ${counter}`,
    email: `${prefix}${counter}@example.com`,
    phone: `9${n}1`.slice(0, 10).padEnd(10, "0"),
    password: PASSWORD,
  };
};

export const resetDatabase = async () => {
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.destination.deleteMany();
  await prisma.category.deleteMany();
  vi.mocked(sendEmail).mockClear();
};

/** Latest 6-digit code emailed to this address (OTP emails only). */
export const lastCodeFor = (email: string) => {
  const calls = vi.mocked(sendEmail).mock.calls;
  for (let i = calls.length - 1; i >= 0; i--) {
    const mail = calls[i]![0];
    const match = mail.to === email ? mail.text.match(/^(\d{6})$/m) : null;
    if (match) return match[1]!;
  }
  throw new Error(`No OTP email found for ${email}`);
};

export const emailsTo = (email: string) =>
  vi.mocked(sendEmail).mock.calls.filter(([mail]) => mail.to === email);

export const wrongCode = (real: string) => (real === "000000" ? "111111" : "000000");

export const refreshCookieOf = (res: request.Response) => {
  const header = res.headers["set-cookie"] as unknown as string[] | undefined;
  const cookie = header?.find((value) => value.startsWith("refresh_token="));
  return cookie ? cookie.split(";")[0]! : undefined;
};

export const signup = (user: ReturnType<typeof uniqueUser>) => api().post("/api/auth/signup").send(user);

export const signupAndVerify = async (user = uniqueUser()) => {
  await signup(user).expect(201);
  const res = await api()
    .post("/api/auth/verify-email")
    .send({ email: user.email, otp: lastCodeFor(user.email) })
    .expect(200);

  expect(res.body.accessToken).toBeTypeOf("string");
  return {
    user,
    accessToken: res.body.accessToken as string,
    userId: res.body.user.id as string,
    cookie: refreshCookieOf(res)!,
  };
};

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

export const createCategory = (slug = "spiritual", name = "Spiritual") =>
  prisma.category.create({ data: { slug, name } });

export const createDestination = async (
  categoryId: string,
  overrides: Partial<Parameters<typeof prisma.destination.create>[0]["data"]> & { slug: string },
) =>
  prisma.destination.create({
    data: {
      title: overrides.slug.replace(/-/g, " "),
      tagline: "A tagline",
      overview: "A long overview",
      city: "Varanasi",
      state: "Uttar Pradesh",
      priceInr: 1000,
      durationDays: 1,
      durationNights: 0,
      maxGroupSize: 10,
      bestTimeToVisit: "Winter",
      isPublished: true,
      categoryId,
      images: {
        create: [
          { key: `destinations/${overrides.slug}/02.webp`, alt: "second", sortOrder: 1 },
          { key: `destinations/${overrides.slug}/01.webp`, alt: "cover", sortOrder: 0, isCover: true },
        ],
      },
      ...overrides,
    } as Parameters<typeof prisma.destination.create>[0]["data"],
  });
  
