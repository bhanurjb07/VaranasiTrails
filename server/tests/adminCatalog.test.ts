import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "../src/lib/prisma.js";
import {
  admin,
  api,
  createAdminSession,
  createReadyDestination,
  fakeUploadedObject,
  readyBody,
  resetDatabase,
  resetR2Mocks,
} from "./helpers.js";

let token: string;
let categoryId: string;

beforeEach(async () => {
  await resetDatabase();
  resetR2Mocks();
  ({ token } = await createAdminSession());
  const category = await admin(token).post("/categories").send({ name: "Honeymoon" }).expect(201);
  categoryId = category.body.category.id;
});

const auditActions = async () => (await prisma.auditLog.findMany({ orderBy: { createdAt: "asc" } })).map((row) => row.action);

describe("categories", () => {
  it("creates with an auto slug, keeps slugs unique and appends to the order", async () => {
    const second = await admin(token).post("/categories").send({ name: "Honeymoon", description: "For two" }).expect(201);
    const third = await admin(token).post("/categories").send({ name: "Family Tour" }).expect(201);

    expect(second.body.category).toMatchObject({ slug: "honeymoon-2", description: "For two", isActive: true });
    expect(third.body.category.slug).toBe("family-tour");

    const list = await admin(token).get("/categories").expect(200);
    expect(list.body.data.map((c: { name: string }) => c.name)).toEqual(["Honeymoon", "Honeymoon", "Family Tour"]);
    expect(list.body.data[0]).toMatchObject({ slug: "honeymoon", destinationCount: 0, sortOrder: 0 });
  });

  it("validates input", async () => {
    const res = await admin(token).post("/categories").send({ name: "A" }).expect(422);

    expect(res.body.code).toBe("VALIDATION_ERROR");
    await admin(token).patch(`/categories/${categoryId}`).send({}).expect(422);
  });

  it("updates without changing the slug, and can deactivate", async () => {
    const res = await admin(token)
      .patch(`/categories/${categoryId}`)
      .send({ name: "Honeymoon Trips", isActive: false })
      .expect(200);

    expect(res.body.category).toMatchObject({ name: "Honeymoon Trips", slug: "honeymoon", isActive: false });
  });

  it("reorders, and rejects an incomplete id list", async () => {
    const family = (await admin(token).post("/categories").send({ name: "Family Tour" }).expect(201)).body.category.id;

    await admin(token).patch("/categories/reorder").send({ ids: [categoryId] }).expect(409);
    const res = await admin(token).patch("/categories/reorder").send({ ids: [family, categoryId] }).expect(200);

    expect(res.body.data.map((c: { id: string }) => c.id)).toEqual([family, categoryId]);
  });

  it("refuses to delete a category that has destinations, but deletes an empty one", async () => {
    await createReadyDestination(token, categoryId);

    const blocked = await admin(token).delete(`/categories/${categoryId}`).expect(409);
    expect(blocked.body.code).toBe("CATEGORY_IN_USE");
    expect(blocked.body.message).toMatch(/deactivate/i);

    const empty = (await admin(token).post("/categories").send({ name: "Adventure" }).expect(201)).body.category.id;
    await admin(token).delete(`/categories/${empty}`).expect(204);
    expect(await prisma.category.count({ where: { id: empty } })).toBe(0);
  });

  it("hides inactive categories from the public list", async () => {
    await admin(token).post("/categories").send({ name: "Adventure" }).expect(201);
    await admin(token).patch(`/categories/${categoryId}`).send({ isActive: false }).expect(200);

    const pub = await api().get("/api/categories").expect(200);

    expect(pub.body.data.map((c: { slug: string }) => c.slug)).toEqual(["adventure"]);
  });
});

describe("destinations: create and edit", () => {
  it("creates a draft with defaults and a unique slug", async () => {
    const first = await admin(token).post("/destinations").send({ title: "Ganga Aarti", categoryId }).expect(201);
    const second = await admin(token).post("/destinations").send({ title: "Ganga Aarti", categoryId }).expect(201);

    expect(first.body.destination).toMatchObject({
      slug: "ganga-aarti",
      status: "draft",
      isPublished: false,
      priceInr: 0,
      readiness: { ready: false },
    });
    expect(second.body.destination.slug).toBe("ganga-aarti-2");
  });

  it("requires a title and a real category", async () => {
    await admin(token).post("/destinations").send({ title: "No category" }).expect(422);
    const res = await admin(token).post("/destinations").send({ title: "Bad category", categoryId: "nope" }).expect(422);

    expect(res.body.errors[0].field).toBe("categoryId");
  });

  it("validates that the original price is higher than the price", async () => {
    const res = await admin(token)
      .post("/destinations")
      .send({ title: "Cheap", categoryId, priceInr: 2000, originalPriceInr: 1500 })
      .expect(422);

    expect(res.body.errors[0].field).toBe("originalPriceInr");
  });

  it("replaces highlights, itinerary and inclusions in one update", async () => {
    const created = await admin(token).post("/destinations").send(readyBody(categoryId)).expect(201);
    const id = created.body.destination.id;

    const updated = await admin(token)
      .patch(`/destinations/${id}`)
      .send({
        title: "Sunrise Boat Ride & Aarti",
        priceInr: 1800,
        originalPriceInr: null,
        highlights: ["A", "B"],
        itinerary: [
          { title: "Day one", description: "First day" },
          { title: "Day two", description: "Second day" },
        ],
        inclusions: ["Boat"],
        exclusions: [],
      })
      .expect(200);

    expect(updated.body.destination).toMatchObject({
      title: "Sunrise Boat Ride & Aarti",
      priceInr: 1800,
      originalPriceInr: null,
      discountPercent: 0,
      highlights: ["A", "B"],
      inclusions: ["Boat"],
      exclusions: [],
    });
    expect(updated.body.destination.itinerary.map((d: { dayNumber: number }) => d.dayNumber)).toEqual([1, 2]);
    expect(await prisma.itineraryDay.count({ where: { destinationId: id } })).toBe(2);
  });

  it("checks a partial price update against the stored one and edits the slug safely", async () => {
    const first = (await admin(token).post("/destinations").send(readyBody(categoryId)).expect(201)).body.destination;
    const other = (await admin(token).post("/destinations").send({ title: "Other", categoryId }).expect(201)).body.destination;

    // original is 2000, so a price of 2500 would invert the discount.
    await admin(token).patch(`/destinations/${first.id}`).send({ priceInr: 2500 }).expect(422);

    await admin(token).patch(`/destinations/${first.id}`).send({ slug: other.slug }).expect(409);
    await admin(token).patch(`/destinations/${first.id}`).send({ slug: "Bad Slug" }).expect(422);
    const ok = await admin(token).patch(`/destinations/${first.id}`).send({ slug: "my-new-slug" }).expect(200);
    expect(ok.body.destination.slug).toBe("my-new-slug");
  });

  it("lists with status tabs, search, category and featured filters", async () => {
    const live = await createReadyDestination(token, categoryId, { title: "Live Trip" });
    await admin(token).post(`/destinations/${live.id}/publish`).expect(200);
    await admin(token).patch(`/destinations/${live.id}/featured`).send({ isFeatured: true }).expect(200);
    await admin(token).post("/destinations").send({ title: "Draft Trip", categoryId }).expect(201);
    const old = await admin(token).post("/destinations").send({ title: "Old Trip", categoryId }).expect(201);
    await admin(token).post(`/destinations/${old.body.destination.id}/archive`).expect(200);

    const titles = async (query: string) =>
      (await admin(token).get(`/destinations?${query}&sort=title`).expect(200)).body.data.map((d: { title: string }) => d.title);

    expect(await titles("status=all")).toEqual(["Draft Trip", "Live Trip"]);
    expect(await titles("status=published")).toEqual(["Live Trip"]);
    expect(await titles("status=draft")).toEqual(["Draft Trip"]);
    expect(await titles("status=archived")).toEqual(["Old Trip"]);
    expect(await titles("q=live")).toEqual(["Live Trip"]);
    expect(await titles("featured=true")).toEqual(["Live Trip"]);
    expect(await titles("category=honeymoon")).toEqual(["Draft Trip", "Live Trip"]);

    const row = (await admin(token).get("/destinations?status=published").expect(200)).body.data[0];
    expect(row).toMatchObject({
      title: "Live Trip",
      status: "published",
      isFeatured: true,
      category: { slug: "honeymoon" },
      enquiryCount: 0,
      wishlistCount: 0,
    });
    expect(row.coverImage).toMatch(/^https:\/\/media\.test\/destinations\/live-trip\//);
  });
});

describe("destinations: publish rules", () => {
  it("lists every missing field when a draft is not ready", async () => {
    const draft = await admin(token).post("/destinations").send({ title: "Barely started", categoryId }).expect(201);

    const res = await admin(token).post(`/destinations/${draft.body.destination.id}/publish`).expect(422);

    expect(res.body.code).toBe("NOT_READY");
    const fields = res.body.errors.map((e: { field: string }) => e.field);
    expect(fields).toEqual(expect.arrayContaining(["tagline", "overview", "priceInr", "images", "itinerary", "highlights"]));
    expect(draft.body.destination.readiness.errors.length).toBe(res.body.errors.length);
  });

  it("publishes a ready trip, makes it appear publicly, and unpublishes it again", async () => {
    const trip = await createReadyDestination(token, categoryId);
    expect((await api().get("/api/destinations").expect(200)).body.data).toHaveLength(0);
    await api().get(`/api/destinations/${trip.slug}`).expect(404);

    const published = await admin(token).post(`/destinations/${trip.id}/publish`).expect(200);
    expect(published.body.destination).toMatchObject({ status: "published", readiness: { ready: true } });
    expect(published.body.destination.publishedAt).not.toBeNull();

    const list = await api().get("/api/destinations").expect(200);
    expect(list.body.data.map((d: { slug: string }) => d.slug)).toEqual([trip.slug]);
    const detail = await api().get(`/api/destinations/${trip.slug}`).expect(200);
    expect(detail.body.destination.images).toHaveLength(1);

    await admin(token).post(`/destinations/${trip.id}/unpublish`).expect(200);
    await api().get(`/api/destinations/${trip.slug}`).expect(404);
  });

  it("refuses an edit that would leave a live trip unpublishable", async () => {
    const trip = await createReadyDestination(token, categoryId);
    await admin(token).post(`/destinations/${trip.id}/publish`).expect(200);

    const res = await admin(token).patch(`/destinations/${trip.id}`).send({ highlights: [] }).expect(422);

    expect(res.body.code).toBe("NOT_READY");
    expect((await admin(token).get(`/destinations/${trip.id}`).expect(200)).body.destination.highlights).toHaveLength(1);
  });
});

describe("destinations: duplicate, archive, restore, delete, bulk", () => {
  it("duplicates into a draft that shares image files", async () => {
    const trip = await createReadyDestination(token, categoryId);
    await admin(token).post(`/destinations/${trip.id}/publish`).expect(200);
    await admin(token).patch(`/destinations/${trip.id}/featured`).send({ isFeatured: true }).expect(200);

    const copy = (await admin(token).post(`/destinations/${trip.id}/duplicate`).expect(201)).body.destination;

    expect(copy).toMatchObject({ title: "Sunrise Boat Ride (Copy)", status: "draft", isFeatured: false, slug: "sunrise-boat-ride-copy" });
    expect(copy.images.map((i: { key: string }) => i.key)).toEqual(trip.images.map((i) => i.key));
    expect(copy.highlights).toEqual(["Sunrise from the river"]);
    expect(copy.readiness.ready).toBe(true);
    expect(copy.id).not.toBe(trip.id);
  });

  it("archives (hidden everywhere public) and restores as a draft", async () => {
    const trip = await createReadyDestination(token, categoryId);
    await admin(token).post(`/destinations/${trip.id}/publish`).expect(200);

    const archived = await admin(token).post(`/destinations/${trip.id}/archive`).expect(200);
    expect(archived.body.destination).toMatchObject({ status: "archived", isPublished: false });
    await api().get(`/api/destinations/${trip.slug}`).expect(404);
    await admin(token).patch(`/destinations/${trip.id}`).send({ title: "Edit while archived" }).expect(409);
    await admin(token).post(`/destinations/${trip.id}/publish`).expect(409);

    const restored = await admin(token).post(`/destinations/${trip.id}/restore`).expect(200);
    expect(restored.body.destination.status).toBe("draft");
    await admin(token).post(`/destinations/${trip.id}/restore`).expect(409);
  });

  it("deletes permanently only when archived, removing unused files from R2", async () => {
    const { deleteObject } = await import("../src/lib/r2.js");
    const trip = await createReadyDestination(token, categoryId);

    const early = await admin(token).delete(`/destinations/${trip.id}`).expect(409);
    expect(early.body.code).toBe("NOT_ARCHIVED");

    await admin(token).post(`/destinations/${trip.id}/archive`).expect(200);
    await admin(token).delete(`/destinations/${trip.id}`).expect(204);

    expect(await prisma.destination.count({ where: { id: trip.id } })).toBe(0);
    expect(deleteObject).toHaveBeenCalledWith(trip.images[0]!.key);
  });

  it("applies bulk actions and reports trips that could not change", async () => {
    const ready = await createReadyDestination(token, categoryId, { title: "Ready One" });
    const draft = (await admin(token).post("/destinations").send({ title: "Not Ready", categoryId }).expect(201)).body.destination;

    const published = await admin(token).post("/destinations/bulk").send({ ids: [ready.id, draft.id], action: "publish" }).expect(200);
    expect(published.body.updated).toBe(1);
    expect(published.body.failed).toEqual([expect.objectContaining({ id: draft.id, message: expect.stringMatching(/not ready/i) })]);
    expect(published.body.failed[0].errors.length).toBeGreaterThan(0);

    await admin(token).post("/destinations/bulk").send({ ids: [ready.id], action: "feature" }).expect(200);
    expect((await admin(token).get(`/destinations/${ready.id}`)).body.destination.isFeatured).toBe(true);
    await admin(token).post("/destinations/bulk").send({ ids: [ready.id], action: "unfeature" }).expect(200);
    await admin(token).post("/destinations/bulk").send({ ids: [ready.id], action: "unpublish" }).expect(200);
    await admin(token).post("/destinations/bulk").send({ ids: [ready.id, draft.id], action: "archive" }).expect(200);

    expect((await admin(token).get("/destinations?status=archived")).body.data).toHaveLength(2);
    await admin(token).post("/destinations/bulk").send({ ids: [], action: "publish" }).expect(422);
    await admin(token).post("/destinations/bulk").send({ ids: [ready.id], action: "explode" }).expect(422);
  });

  it("writes an audit row for each action", async () => {
    const trip = await createReadyDestination(token, categoryId);
    await admin(token).post(`/destinations/${trip.id}/publish`).expect(200);
    await admin(token).post(`/destinations/${trip.id}/archive`).expect(200);

    expect(await auditActions()).toEqual([
      "category.create",
      "destination.create",
      "destination.image.add",
      "destination.publish",
      "destination.archive",
    ]);
    const publishRow = await prisma.auditLog.findFirstOrThrow({ where: { action: "destination.publish" } });
    expect(publishRow).toMatchObject({ entityType: "destination", entityId: trip.id });
    expect(publishRow.summary).toContain("Sunrise Boat Ride");
    fakeUploadedObject();
  });
});

describe("category images", () => {
  const presignCategory = (body: Record<string, unknown> = {}) =>
    admin(token).post("/uploads/presign").send({ categoryId, filename: "c.webp", contentType: "image/webp", sizeBytes: 80_000, ...body });

  it("signs uploads into the categories folder and accepts exactly one target", async () => {
    const res = await presignCategory().expect(200);
    expect(res.body.key).toMatch(/^categories\/honeymoon\/[a-f0-9]{24}\.webp$/);

    await presignCategory({ categoryId: undefined }).expect(422);
    await presignCategory({ destinationId: "x" }).expect(422);
    await presignCategory({ categoryId: "missing" }).expect(404);
    // Categories only take images.
    await presignCategory({ contentType: "video/mp4" }).expect(422);
  });

  it("verifies the file exists before saving the image key", async () => {
    const key = (await presignCategory().expect(200)).body.key as string;

    const missing = await admin(token).patch(`/categories/${categoryId}`).send({ imageKey: key }).expect(400);
    expect(missing.body.code).toBe("UPLOAD_MISSING");
    await admin(token).patch(`/categories/${categoryId}`).send({ imageKey: "destinations/some/file123.webp" }).expect(422);

    fakeUploadedObject("image/webp", 80_000);
    const saved = await admin(token).patch(`/categories/${categoryId}`).send({ imageKey: key }).expect(200);
    expect(saved.body.category).toMatchObject({ imageKey: key, imageUrl: `https://media.test/${key}` });
  });

  it("deletes the old file when the image is replaced or the category is deleted", async () => {
    const { deleteObject } = await import("../src/lib/r2.js");
    fakeUploadedObject("image/webp", 80_000);
    const first = (await presignCategory().expect(200)).body.key as string;
    const second = (await presignCategory().expect(200)).body.key as string;
    await admin(token).patch(`/categories/${categoryId}`).send({ imageKey: first }).expect(200);

    await admin(token).patch(`/categories/${categoryId}`).send({ imageKey: second }).expect(200);
    expect(deleteObject).toHaveBeenCalledWith(first);

    await admin(token).patch(`/categories/${categoryId}`).send({ imageKey: null }).expect(200);
    expect(deleteObject).toHaveBeenCalledWith(second);
  });
});
