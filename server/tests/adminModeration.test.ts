import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "../src/lib/prisma.js";
import { escapeCsvCell, toCsv } from "../src/utils/csv.js";
import {
  PASSWORD,
  admin,
  api,
  bearer,
  createAdminSession,
  createReadyDestination,
  resetDatabase,
  resetR2Mocks,
  signupAndVerify,
} from "./helpers.js";

let token: string;
let adminId: string;
let categoryId: string;

beforeEach(async () => {
  await resetDatabase();
  resetR2Mocks();
  ({ token, userId: adminId } = await createAdminSession());
  categoryId = (await admin(token).post("/categories").send({ name: "Honeymoon" })).body.category.id;
});

const enquiry = (overrides: Record<string, unknown> = {}) =>
  api().post("/api/enquiries").send({
    name: "Asha Verma",
    email: "asha@example.com",
    phone: "9876543210",
    message: "Do you run this trip for a family of six?",
    ...overrides,
  });

describe("enquiries", () => {
  it("lists with status counts, filters, search and date range, newest first", async () => {
    const trip = await createReadyDestination(token, categoryId);
    await enquiry({ name: "First Person", destinationId: trip.id }).expect(201);
    await enquiry({ name: "Second Person", message: "Looking for a honeymoon plan please." }).expect(201);
    const [a] = await prisma.enquiry.findMany({ orderBy: { createdAt: "asc" } });
    await prisma.enquiry.update({ where: { id: a!.id }, data: { status: "CONTACTED", createdAt: new Date("2026-01-05") } });

    const all = await admin(token).get("/enquiries").expect(200);
    expect(all.body.data.map((e: { name: string }) => e.name)).toEqual(["Second Person", "First Person"]);
    expect(all.body.counts).toEqual({ NEW: 1, CONTACTED: 1, CLOSED: 0 });
    expect(all.body.data[1].destination).toMatchObject({ id: trip.id, title: "Sunrise Boat Ride" });

    const names = async (q: string) => (await admin(token).get(`/enquiries?${q}`).expect(200)).body.data.map((e: { name: string }) => e.name);
    expect(await names("status=NEW")).toEqual(["Second Person"]);
    expect(await names("q=honeymoon")).toEqual(["Second Person"]);
    expect(await names("from=2026-01-01&to=2026-02-01")).toEqual(["First Person"]);
    expect(await names(`destinationId=${trip.id}`)).toEqual(["First Person"]);
    await admin(token).get("/enquiries?status=WRONG").expect(422);
  });

  it("updates status and notes, and deletes", async () => {
    const id = (await enquiry().expect(201)).body.id;

    const updated = await admin(token).patch(`/enquiries/${id}`).send({ status: "CLOSED", adminNotes: "Called, booked for March." }).expect(200);
    expect(updated.body.enquiry).toMatchObject({ status: "CLOSED", adminNotes: "Called, booked for March." });
    expect((await admin(token).get(`/enquiries/${id}`).expect(200)).body.enquiry.status).toBe("CLOSED");
    await admin(token).patch(`/enquiries/${id}`).send({}).expect(422);

    await admin(token).delete(`/enquiries/${id}`).expect(204);
    await admin(token).get(`/enquiries/${id}`).expect(404);
  });

  it("exports the filtered rows as CSV with formula injection neutralised", async () => {
    await enquiry({ name: "=HYPERLINK(\"http://evil.test\",\"click\")", message: "+1 call me, please\nsecond line here" }).expect(201);
    await enquiry({ name: "Plain Person", email: "plain@example.com" }).expect(201);
    await prisma.enquiry.updateMany({ where: { name: "Plain Person" }, data: { status: "CLOSED" } });

    const res = await admin(token).get("/enquiries/export.csv?status=NEW").expect(200);

    expect(res.headers["content-type"]).toMatch(/text\/csv/);
    expect(res.headers["content-disposition"]).toMatch(/attachment; filename="enquiries-\d{4}-\d{2}-\d{2}\.csv"/);
    expect(res.text).toContain("Received,Name,Email,Phone,Status,Destination,Message,Admin notes");
    // Dangerous cells are prefixed so spreadsheets read them as text.
    expect(res.text).toContain(`"'=HYPERLINK(""http://evil.test"",""click"")"`);
    expect(res.text).toContain(`"'+1 call me, please\nsecond line here"`);
    // The status filter applies to the export.
    expect(res.text).not.toContain("Plain Person");
  });
});

describe("csv helpers", () => {
  it.each([
    ["=SUM(1+1)", "'=SUM(1+1)"],
    ["+91 98765", "'+91 98765"],
    ["-5", "'-5"],
    ["@cmd", "'@cmd"],
    ["\tTabbed", "'\tTabbed"],
    ["normal text", "normal text"],
    ["has,comma", '"has,comma"'],
    ['say "hi"', '"say ""hi"""'],
    [null, ""],
    [undefined, ""],
    [42, "42"],
  ])("escapes %j", (input, expected) => {
    expect(escapeCsvCell(input)).toBe(expected);
  });

  it("writes CRLF rows with a header", () => {
    expect(toCsv(["a", "b"], [[1, "x,y"]])).toBe('a,b\r\n1,"x,y"\r\n');
  });
});

describe("users", () => {
  it("lists and filters users, and shows counts", async () => {
    const verified = await signupAndVerify();
    await api().post("/api/auth/signup").send({ name: "Pending Person", email: "pending@example.com", phone: "9811111111", password: PASSWORD }).expect(201);
    await prisma.user.update({ where: { id: verified.userId }, data: { isBlocked: true } });

    const names = async (q: string) => (await admin(token).get(`/users?${q}&limit=50`).expect(200)).body.data.map((u: { name: string }) => u.name);
    expect(await names("")).toHaveLength(3);
    expect(await names("verified=false")).toEqual(["Pending Person"]);
    expect(await names("blocked=true")).toEqual([verified.user.name]);
    expect(await names("q=pending@")).toEqual(["Pending Person"]);

    const detail = await admin(token).get(`/users/${verified.userId}`).expect(200);
    expect(detail.body.user).toMatchObject({ email: verified.user.email, isBlocked: true, reviewCount: 0, wishlistCount: 0, emailVerified: true });
    expect(detail.body.user).not.toHaveProperty("passwordHash");
    await admin(token).get("/users/missing").expect(404);
  });

  it("blocking revokes sessions and stops login; unblocking restores access", async () => {
    const user = await signupAndVerify();

    const blocked = await admin(token).patch(`/users/${user.userId}/block`).expect(200);
    expect(blocked.body.user.isBlocked).toBe(true);

    await api().get("/api/users/me").set(bearer(user.accessToken)).expect(403);
    await api().post("/api/auth/refresh").set("Cookie", user.cookie).expect(403);
    expect((await api().post("/api/auth/login").send({ email: user.user.email, password: PASSWORD }).expect(403)).body.code).toBe("ACCOUNT_BLOCKED");
    expect(await prisma.refreshToken.count({ where: { userId: user.userId, revokedAt: null } })).toBe(0);

    await admin(token).patch(`/users/${user.userId}/unblock`).expect(200);
    await api().post("/api/auth/login").send({ email: user.user.email, password: PASSWORD }).expect(200);
  });

  it("cannot block yourself or another admin", async () => {
    const self = await admin(token).patch(`/users/${adminId}/block`).expect(409);
    expect(self.body.code).toBe("CANNOT_BLOCK_SELF");

    const other = await signupAndVerify();
    await prisma.user.update({ where: { id: other.userId }, data: { role: "ADMIN" } });
    expect((await admin(token).patch(`/users/${other.userId}/block`).expect(409)).body.code).toBe("CANNOT_BLOCK_ADMIN");
  });
});

describe("reviews", () => {
  const review = { rating: 5, title: "Wonderful", comment: "An unforgettable evening on the river." };

  it("hides and unhides reviews, recomputing the rating each time", async () => {
    const trip = await createReadyDestination(token, categoryId);
    await admin(token).post(`/destinations/${trip.id}/publish`).expect(200);
    const a = await signupAndVerify();
    const b = await signupAndVerify();
    const url = `/api/destinations/${trip.slug}/reviews`;
    await api().post(url).set(bearer(a.accessToken)).send(review).expect(201);
    await api().post(url).set(bearer(b.accessToken)).send({ ...review, rating: 1, title: "Terrible", comment: "This was not a good experience at all." }).expect(201);
    const rating = async () => (await prisma.destination.findUniqueOrThrow({ where: { id: trip.id } }));

    expect(await rating()).toMatchObject({ ratingAvg: 3, ratingCount: 2 });

    const list = await admin(token).get("/reviews").expect(200);
    const bad = list.body.data.find((r: { title: string }) => r.title === "Terrible");
    expect(bad).toMatchObject({ isHidden: false, user: { email: b.user.email }, destination: { title: "Sunrise Boat Ride" } });

    await admin(token).patch(`/reviews/${bad.id}/hide`).expect(200);
    expect(await rating()).toMatchObject({ ratingAvg: 5, ratingCount: 1 });

    const publicList = await api().get(url).expect(200);
    expect(publicList.body.data.map((r: { title: string }) => r.title)).toEqual(["Wonderful"]);
    const detail = await api().get(`/api/destinations/${trip.slug}`).expect(200);
    expect(detail.body.destination.ratingBreakdown).toEqual({ "1": 0, "2": 0, "3": 0, "4": 0, "5": 1 });
    expect(detail.body.destination.latestReviews).toHaveLength(1);

    await admin(token).patch(`/reviews/${bad.id}/unhide`).expect(200);
    expect(await rating()).toMatchObject({ ratingAvg: 3, ratingCount: 2 });
  });

  it("filters by hidden, rating, destination and text, and deletes with a recompute", async () => {
    const trip = await createReadyDestination(token, categoryId);
    await admin(token).post(`/destinations/${trip.id}/publish`).expect(200);
    const user = await signupAndVerify();
    const created = await api().post(`/api/destinations/${trip.slug}/reviews`).set(bearer(user.accessToken)).send(review).expect(201);

    const count = async (q: string) => (await admin(token).get(`/reviews?${q}`).expect(200)).body.data.length;
    expect(await count("hidden=false")).toBe(1);
    expect(await count("hidden=true")).toBe(0);
    expect(await count("rating=5")).toBe(1);
    expect(await count("rating=4")).toBe(0);
    expect(await count(`destinationId=${trip.id}`)).toBe(1);
    expect(await count("q=unforgettable")).toBe(1);

    await admin(token).delete(`/reviews/${created.body.review.id}`).expect(204);
    expect(await prisma.destination.findUniqueOrThrow({ where: { id: trip.id } })).toMatchObject({ ratingAvg: 0, ratingCount: 0 });
    await admin(token).patch("/reviews/missing/hide").expect(404);
  });
});

describe("dashboard", () => {
  it("summarises the site", async () => {
    const live = await createReadyDestination(token, categoryId, { title: "Live Trip" });
    await admin(token).post(`/destinations/${live.id}/publish`).expect(200);
    await admin(token).post("/destinations").send({ title: "Half Done", categoryId }).expect(201);
    const user = await signupAndVerify();
    await enquiry({ destinationId: live.id }).expect(201);
    await enquiry({ name: "Second Person" }).expect(201);
    await prisma.enquiry.updateMany({ where: { name: "Second Person" }, data: { status: "CLOSED" } });
    await api().put(`/api/wishlist/${live.id}`).set(bearer(user.accessToken)).expect(200);

    const res = await admin(token).get("/dashboard").expect(200);

    expect(res.body.destinations).toEqual({ published: 1, draft: 1, archived: 0, total: 2 });
    expect(res.body.users).toMatchObject({ total: 2, verified: 2, blocked: 0, newLast30Days: 2 });
    expect(res.body.enquiries).toEqual({ NEW: 1, CONTACTED: 0, CLOSED: 1, total: 2 });
    expect(res.body.enquiriesPerDay).toHaveLength(30);
    expect(res.body.enquiriesPerDay.at(-1)).toEqual({ date: new Date().toISOString().slice(0, 10), count: 2 });
    expect(res.body.latestEnquiries).toHaveLength(2);
    expect(res.body.topWishlisted).toEqual([expect.objectContaining({ title: "Live Trip", wishlistCount: 1 })]);
    expect(res.body.needsAttention).toEqual([
      expect.objectContaining({ title: "Half Done", status: "draft", issues: expect.arrayContaining(["Add at least one image"]) }),
    ]);
  });
});

describe("audit log", () => {
  it("records admin actions with the admin and a short summary, and filters them", async () => {
    const trip = await createReadyDestination(token, categoryId);
    await admin(token).post(`/destinations/${trip.id}/publish`).expect(200);
    const user = await signupAndVerify();
    await admin(token).patch(`/users/${user.userId}/block`).expect(200);

    const all = await admin(token).get("/audit-log").expect(200);
    expect(all.body.data[0]).toMatchObject({
      action: "user.block",
      entityType: "user",
      entityId: user.userId,
      admin: { id: adminId, email: "admin@example.com" },
    });
    expect(all.body.data[0].summary).toContain(user.user.email);
    expect(all.body.meta.total).toBeGreaterThanOrEqual(5);

    const actions = async (q: string) => (await admin(token).get(`/audit-log?${q}`).expect(200)).body.data.map((r: { action: string }) => r.action);
    expect(await actions("entityType=user")).toEqual(["user.block"]);
    expect(await actions("action=destination.")).toEqual(["destination.publish", "destination.image.add", "destination.create"]);
    expect(await actions(`entityId=${trip.id}&action=destination.publish`)).toEqual(["destination.publish"]);
    expect(await actions("q=blocked")).toEqual(["user.block"]);
    expect(await actions("limit=2")).toHaveLength(2);
  });

  it("never stores secrets in summaries", async () => {
    await admin(token).post("/categories").send({ name: "Safe" }).expect(201);
    await admin(token).patch(`/users/${adminId}/block`).expect(409);

    const rows = await prisma.auditLog.findMany();
    const text = JSON.stringify(rows);
    expect(text).not.toMatch(/password|token|secret/i);
  });
});
