import request from "supertest";
import { expect, vi } from "vitest";

import { httpServer } from "./httpServer.js";
import { sendEmail } from "../src/lib/mailer.js";
import { prisma } from "../src/lib/prisma.js";

export const api = () => request(httpServer);

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
  await prisma.auditLog.deleteMany();
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
  

// ---------------------------------------------------------------------------
// Admin helpers
// ---------------------------------------------------------------------------
import { vi as viAdmin } from "vitest";
import { createUploadUrl, deleteObject, headObject } from "../src/lib/r2.js";
import { ensureAdmin } from "../src/services/admin/adminAccount.service.js";

export const ADMIN = {
  name: "Site Admin",
  email: "admin@example.com",
  phone: "+919000000001",
  password: "AdminPassw0rd",
};

export const createAdminSession = async () => {
  await ensureAdmin(ADMIN);
  const res = await api().post("/api/auth/login").send({ email: ADMIN.email, password: ADMIN.password }).expect(200);

  return { token: res.body.accessToken as string, userId: res.body.user.id as string };
};

export const resetR2Mocks = () => {
  viAdmin.mocked(createUploadUrl).mockClear();
  viAdmin.mocked(headObject).mockReset().mockResolvedValue(null);
  viAdmin.mocked(deleteObject).mockReset().mockResolvedValue(undefined);
};

/** Tells the R2 mock that an object exists with this type and size. */
export const fakeUploadedObject = (contentType = "image/webp", contentLength = 120_000) =>
  viAdmin.mocked(headObject).mockResolvedValue({ contentType, contentLength });

export const admin = (token: string) => ({
  get: (path: string) => api().get(`/api/admin${path}`).set(bearer(token)),
  post: (path: string) => api().post(`/api/admin${path}`).set(bearer(token)),
  patch: (path: string) => api().patch(`/api/admin${path}`).set(bearer(token)),
  put: (path: string) => api().put(`/api/admin${path}`).set(bearer(token)),
  delete: (path: string) => api().delete(`/api/admin${path}`).set(bearer(token)),
});

export const readyBody = (categoryId: string, overrides: Record<string, unknown> = {}) => ({
  title: "Sunrise Boat Ride",
  categoryId,
  tagline: "Watch the sun rise over the ghats",
  overview: "A slow boat ride along the ghats of Varanasi at dawn, with a guide who explains every temple and ritual you pass.",
  city: "Varanasi",
  priceInr: 1500,
  originalPriceInr: 2000,
  durationDays: 1,
  highlights: ["Sunrise from the river"],
  itinerary: [{ title: "Dawn cruise", description: "Meet at the ghat and cruise for two hours." }],
  inclusions: ["Boat", "Guide"],
  exclusions: ["Meals"],
  ...overrides,
});

/** Creates a draft through the API and attaches one uploaded cover image. */
export const createReadyDestination = async (token: string, categoryId: string, overrides: Record<string, unknown> = {}) => {
  const created = await admin(token).post("/destinations").send(readyBody(categoryId, overrides)).expect(201);
  const id = created.body.destination.id as string;

  const presign = await admin(token)
    .post("/uploads/presign")
    .send({ destinationId: id, filename: "cover.webp", contentType: "image/webp", sizeBytes: 120_000 })
    .expect(200);

  fakeUploadedObject();
  const withImage = await admin(token)
    .post(`/destinations/${id}/images`)
    .send({ key: presign.body.key, alt: "Boats at sunrise" })
    .expect(201);

  return withImage.body.destination as { id: string; slug: string; images: { id: string; key: string; isCover: boolean }[] };
};
