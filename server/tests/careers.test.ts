import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "../src/lib/prisma.js";
import { admin, api, bearer, createAdminSession, resetDatabase, signupAndVerify } from "./helpers.js";

let token: string;

beforeEach(async () => {
  await resetDatabase();
  await prisma.jobListing.deleteMany();
  ({ token } = await createAdminSession());
});

const body = (overrides: Record<string, unknown> = {}) => ({
  title: "Backend Developer",
  department: "Backend",
  location: "Varanasi",
  employmentType: "FULL_TIME",
  workMode: "HYBRID",
  experience: "2+ years",
  aboutRole: "You will build and run the APIs behind the VaranasiTrails website and admin panel.",
  responsibilities: ["Design REST endpoints", "Write tests"],
  requirements: ["Node.js and TypeScript", "SQL basics"],
  applyUrl: "https://forms.example.com/backend",
  ...overrides,
});

const create = (overrides: Record<string, unknown> = {}) =>
  admin(token).post("/careers").send(body(overrides));

describe("public careers", () => {
  it("returns an empty list when nothing is posted", async () => {
    const res = await api().get("/api/careers").expect(200);

    expect(res.body).toEqual({ data: [] });
  });

  it("is never cached by the browser, so a hidden listing disappears at once", async () => {
    const { id } = (await create({ isPublished: true }).expect(201)).body.career;

    expect((await api().get("/api/careers")).headers["cache-control"]).toBe("no-cache");
    expect((await api().get(`/api/careers/${id}`)).headers["cache-control"]).toBe("no-cache");
  });

  it("hides drafts and shows a listing once it is published", async () => {
    const draft = (await create().expect(201)).body.career;
    expect(draft.status).toBe("draft");

    expect((await api().get("/api/careers").expect(200)).body.data).toHaveLength(0);
    await api().get(`/api/careers/${draft.id}`).expect(404);

    await admin(token).patch(`/careers/${draft.id}`).send({ isPublished: true }).expect(200);

    const list = (await api().get("/api/careers").expect(200)).body.data;
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      id: draft.id,
      title: "Backend Developer",
      department: "Backend",
      employmentType: "FULL_TIME",
      workMode: "HYBRID",
      requirements: ["Node.js and TypeScript", "SQL basics"],
      responsibilities: ["Design REST endpoints", "Write tests"],
      applyUrl: "https://forms.example.com/backend",
    });
    expect(list[0]).not.toHaveProperty("isPublished");

    const detail = (await api().get(`/api/careers/${draft.id}`).expect(200)).body.career;
    expect(detail.aboutRole).toContain("APIs behind");
  });

  it("hides a listing again when it is unpublished", async () => {
    const { id } = (await create({ isPublished: true }).expect(201)).body.career;
    expect((await api().get("/api/careers")).body.data).toHaveLength(1);

    await admin(token).patch(`/careers/${id}`).send({ isPublished: false }).expect(200);

    expect((await api().get("/api/careers")).body.data).toHaveLength(0);
    await api().get(`/api/careers/${id}`).expect(404);
  });

  it("hides a listing after its closing date but keeps it open on the closing day", async () => {
    const past = (await create({ isPublished: true }).expect(201)).body.career;
    // A listing that was open when posted and has since passed its closing date.
    await prisma.jobListing.update({ where: { id: past.id }, data: { closesAt: new Date("2020-01-01T23:59:59.999+05:30") } });
    const future = (await create({ title: "AI Engineer", department: "AI / ML", isPublished: true, closesAt: "2099-12-31" }).expect(201)).body.career;

    const list = (await api().get("/api/careers").expect(200)).body.data;
    expect(list.map((item: { id: string }) => item.id)).toEqual([future.id]);
    await api().get(`/api/careers/${past.id}`).expect(404);

    const admins = (await admin(token).get("/careers").expect(200)).body.data;
    expect(admins.find((item: { id: string }) => item.id === past.id).status).toBe("closed");
    expect(admins.find((item: { id: string }) => item.id === future.id).status).toBe("live");
  });

  it("orders listings by department", async () => {
    await create({ title: "Security Engineer", department: "Cybersecurity", isPublished: true }).expect(201);
    await create({ title: "Frontend Developer", department: "Frontend", isPublished: true }).expect(201);
    await create({ title: "API Developer", department: "Backend", isPublished: true }).expect(201);

    const departments = (await api().get("/api/careers")).body.data.map((item: { department: string }) => item.department);
    expect(departments).toEqual(["Backend", "Cybersecurity", "Frontend"]);
  });
});

describe("admin careers", () => {
  it("is for administrators only", async () => {
    await api().get("/api/admin/careers").expect(401);
    const { accessToken } = await signupAndVerify();
    await api().get("/api/admin/careers").set(bearer(accessToken)).expect(403);
    await api().post("/api/admin/careers").set(bearer(accessToken)).send(body()).expect(403);
  });

  it("creates a draft with all the details", async () => {
    const res = await create().expect(201);

    expect(res.body.career).toMatchObject({
      title: "Backend Developer",
      status: "draft",
      isPublished: false,
      experience: "2+ years",
      salary: null,
      closesAt: null,
      publishedAt: null,
    });
  });

  it("validates the fields", async () => {
    const missing = await admin(token).post("/careers").send({ title: "Backend Developer" }).expect(422);
    expect(missing.body.errors.map((e: { field: string }) => e.field)).toEqual(
      expect.arrayContaining(["department", "location", "aboutRole", "requirements", "applyUrl"]),
    );

    const noRequirements = await create({ requirements: [] }).expect(422);
    expect(noRequirements.body.errors[0].field).toBe("requirements");

    const badDate = await create({ closesAt: "31/12/2026" }).expect(422);
    expect(badDate.body.errors[0].field).toBe("closesAt");
  });

  it("refuses a closing date in the past but allows today", async () => {
    const yesterday = new Date(Date.now() + 5.5 * 3600_000 - 24 * 3600_000).toISOString().slice(0, 10);
    const today = new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);

    const res = await create({ closesAt: yesterday }).expect(422);
    expect(res.body.errors[0]).toMatchObject({ field: "closesAt" });

    const ok = await create({ isPublished: true, closesAt: today }).expect(201);
    expect(ok.body.career.status).toBe("live");
    expect((await api().get("/api/careers")).body.data).toHaveLength(1);

    const { id } = ok.body.career;
    await admin(token).patch(`/careers/${id}`).send({ closesAt: yesterday }).expect(422);
  });

  it("lets an already closed listing be edited, and reopened with a new date", async () => {
    const { id } = (await create({ isPublished: true }).expect(201)).body.career;
    await prisma.jobListing.update({ where: { id }, data: { closesAt: new Date("2020-01-01T23:59:59.999+05:30") } });
    const current = (await admin(token).get(`/careers/${id}`).expect(200)).body.career;
    expect(current.status).toBe("closed");

    // The panel sends the whole form, including the unchanged old date.
    await admin(token).patch(`/careers/${id}`).send({ title: "Senior Backend Developer", closesAt: current.closesAt.slice(0, 10) }).expect(200);

    const reopened = await admin(token).patch(`/careers/${id}`).send({ closesAt: "2099-06-30" }).expect(200);
    expect(reopened.body.career.status).toBe("live");
  });

  it("only accepts web or mailto apply links", async () => {
    for (const applyUrl of ["javascript:alert(1)", "data:text/html,hi", "ftp://example.com/x", "not a link", "jobs@example.com"]) {
      const res = await create({ applyUrl }).expect(422);
      expect(res.body.errors[0].field).toBe("applyUrl");
    }
    await create({ applyUrl: "mailto:jobs@example.com" }).expect(201);
    await create({ applyUrl: "http://forms.example.com/x" }).expect(201);
  });

  it("edits a listing and keeps the first publish date", async () => {
    const { id } = (await create({ isPublished: true }).expect(201)).body.career;
    const first = (await admin(token).get(`/careers/${id}`).expect(200)).body.career.publishedAt;
    expect(first).toBeTypeOf("string");

    await admin(token).patch(`/careers/${id}`).send({ isPublished: false }).expect(200);
    const edited = await admin(token)
      .patch(`/careers/${id}`)
      .send({ title: "Senior Backend Developer", salary: "Negotiable", requirements: ["Five years of Node.js"], isPublished: true })
      .expect(200);

    expect(edited.body.career).toMatchObject({
      title: "Senior Backend Developer",
      salary: "Negotiable",
      requirements: ["Five years of Node.js"],
      publishedAt: first,
      status: "live",
    });

    const cleared = await admin(token).patch(`/careers/${id}`).send({ salary: null, closesAt: "2099-01-01" }).expect(200);
    expect(cleared.body.career.salary).toBeNull();
    expect(cleared.body.career.closesAt).toBe("2099-01-01T18:29:59.999Z");
  });

  it("lists with filters and suggests departments", async () => {
    await create({ title: "API Developer", department: "Backend" }).expect(201);
    await create({ title: "React Developer", department: "Frontend", isPublished: true }).expect(201);

    expect((await admin(token).get("/careers").expect(200)).body.meta.total).toBe(2);
    expect((await admin(token).get("/careers?published=true").expect(200)).body.data.map((c: { title: string }) => c.title)).toEqual(["React Developer"]);
    expect((await admin(token).get("/careers?q=API").expect(200)).body.data).toHaveLength(1);
    expect((await admin(token).get("/careers?department=Frontend").expect(200)).body.data).toHaveLength(1);
    expect((await admin(token).get("/careers/departments").expect(200)).body.data).toEqual(["Backend", "Frontend"]);
  });

  it("deletes a listing", async () => {
    const { id } = (await create({ isPublished: true }).expect(201)).body.career;

    await admin(token).delete(`/careers/${id}`).expect(204);

    await admin(token).get(`/careers/${id}`).expect(404);
    expect((await api().get("/api/careers")).body.data).toHaveLength(0);
    await admin(token).delete(`/careers/${id}`).expect(404);
  });

  it("records every change in the audit log", async () => {
    const { id } = (await create().expect(201)).body.career;
    await admin(token).patch(`/careers/${id}`).send({ isPublished: true }).expect(200);
    await admin(token).patch(`/careers/${id}`).send({ title: "Backend Engineer" }).expect(200);
    await admin(token).patch(`/careers/${id}`).send({ isPublished: false }).expect(200);
    await admin(token).delete(`/careers/${id}`).expect(204);

    const log = (await admin(token).get("/audit-log?entityType=career").expect(200)).body.data;
    expect(log.map((entry: { action: string }) => entry.action).sort()).toEqual(
      ["career.create", "career.delete", "career.publish", "career.unpublish", "career.update"].sort(),
    );
  });
});
