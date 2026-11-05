import { beforeEach, describe, expect, it } from "vitest";

import { prisma } from "../src/lib/prisma.js";
import { api, createCategory, createDestination, resetDatabase } from "./helpers.js";

let spiritualId: string;
let foodId: string;

beforeEach(async () => {
  await resetDatabase();
  spiritualId = (await createCategory("spiritual", "Spiritual")).id;
  foodId = (await createCategory("food", "Food")).id;

  await createDestination(spiritualId, {
    slug: "ganga-aarti",
    title: "Ganga Aarti Boat Ride",
    priceInr: 1500,
    originalPriceInr: 2000,
    city: "Varanasi",
    durationDays: 1,
    difficulty: "EASY",
    isFeatured: true,
    ratingAvg: 4.8,
    ratingCount: 20,
    createdAt: new Date("2026-01-01"),
  });
  await createDestination(spiritualId, {
    slug: "pilgrimage-circuit",
    title: "Pilgrimage Circuit",
    priceInr: 15000,
    city: "Ayodhya",
    durationDays: 5,
    durationNights: 4,
    difficulty: "MODERATE",
    ratingAvg: 4.2,
    ratingCount: 5,
    createdAt: new Date("2026-03-01"),
  });
  await createDestination(foodId, {
    slug: "food-trail",
    title: "Banarasi Food Trail",
    priceInr: 1000,
    city: "Varanasi",
    durationDays: 1,
    ratingAvg: 4.5,
    ratingCount: 50,
    createdAt: new Date("2026-02-01"),
  });
  await createDestination(foodId, { slug: "hidden-draft", priceInr: 500, isPublished: false });
});

const slugs = (body: { data: { slug: string }[] }) => body.data.map((d) => d.slug);

describe("GET /api/destinations", () => {
  it("lists only published destinations as cards with pagination meta", async () => {
    const res = await api().get("/api/destinations").expect(200);

    expect(res.headers["cache-control"]).toBe("public, max-age=60");
    expect(res.body.meta).toEqual({ page: 1, limit: 12, total: 3, totalPages: 1 });
    expect(slugs(res.body)).not.toContain("hidden-draft");

    const card = res.body.data.find((d: { slug: string }) => d.slug === "ganga-aarti");
    expect(card).toEqual({
      id: expect.any(String),
      slug: "ganga-aarti",
      title: "Ganga Aarti Boat Ride",
      tagline: "A tagline",
      city: "Varanasi",
      coverImage: "https://media.test/destinations/ganga-aarti/01.webp",
      priceInr: 1500,
      originalPriceInr: 2000,
      discountPercent: 25,
      duration: { days: 1, nights: 0 },
      ratingAvg: 4.8,
      ratingCount: 20,
    });
  });

  it("filters by search, category, price, duration, difficulty and featured", async () => {
    const get = async (query: string) => slugs((await api().get(`/api/destinations?${query}`).expect(200)).body);

    expect(await get("q=aarti")).toEqual(["ganga-aarti"]);
    expect((await get("q=ayodhya"))).toEqual(["pilgrimage-circuit"]);
    expect((await get("category=food"))).toEqual(["food-trail"]);
    expect((await get("minPrice=1200&maxPrice=2000"))).toEqual(["ganga-aarti"]);
    expect((await get("minDays=2"))).toEqual(["pilgrimage-circuit"]);
    expect((await get("maxDays=1")).sort()).toEqual(["food-trail", "ganga-aarti"]);
    expect((await get("difficulty=MODERATE"))).toEqual(["pilgrimage-circuit"]);
    expect((await get("featured=true"))).toEqual(["ganga-aarti"]);
    expect((await get("category=nope"))).toEqual([]);
  });

  it("sorts", async () => {
    const get = async (sort: string) => slugs((await api().get(`/api/destinations?sort=${sort}`).expect(200)).body);

    expect(await get("price_asc")).toEqual(["food-trail", "ganga-aarti", "pilgrimage-circuit"]);
    expect(await get("price_desc")).toEqual(["pilgrimage-circuit", "ganga-aarti", "food-trail"]);
    expect(await get("rating")).toEqual(["ganga-aarti", "food-trail", "pilgrimage-circuit"]);
    expect(await get("newest")).toEqual(["pilgrimage-circuit", "food-trail", "ganga-aarti"]);
    expect(await get("popular")).toEqual(["food-trail", "ganga-aarti", "pilgrimage-circuit"]);
  });

  it("paginates and caps the page size at 24", async () => {
    const res = await api().get("/api/destinations?limit=2&page=2&sort=price_asc").expect(200);
    expect(slugs(res.body)).toEqual(["pilgrimage-circuit"]);
    expect(res.body.meta).toEqual({ page: 2, limit: 2, total: 3, totalPages: 2 });

    await api().get("/api/destinations?limit=25").expect(422);
    await api().get("/api/destinations?sort=bogus").expect(422);
  });
});

describe("GET /api/destinations/:slug", () => {
  it("returns the full product-page payload", async () => {
    const destination = await prisma.destination.findUniqueOrThrow({ where: { slug: "ganga-aarti" } });
    await prisma.$transaction([
      prisma.itineraryDay.create({
        data: { destinationId: destination.id, dayNumber: 2, title: "Day two", description: "Second" },
      }),
      prisma.itineraryDay.create({
        data: { destinationId: destination.id, dayNumber: 1, title: "Day one", description: "First" },
      }),
      prisma.destinationHighlight.create({
        data: { destinationId: destination.id, text: "Floating diyas", sortOrder: 0 },
      }),
      prisma.destinationInclusion.createMany({
        data: [
          { destinationId: destination.id, text: "Boat ride", isIncluded: true },
          { destinationId: destination.id, text: "Lunch", isIncluded: false },
        ],
      }),
    ]);
    await prisma.destination.update({
      where: { id: destination.id },
      data: { videoUrl: "videos/ganga.mp4" },
    });

    const res = await api().get("/api/destinations/ganga-aarti").expect(200);
    expect(res.headers["cache-control"]).toBe("public, max-age=60");

    const d = res.body.destination;
    expect(d).toMatchObject({
      slug: "ganga-aarti",
      priceInr: 1500,
      originalPriceInr: 2000,
      discountPercent: 25,
      duration: { days: 1, nights: 0 },
      category: { slug: "spiritual", name: "Spiritual" },
      videoUrl: "https://media.test/videos/ganga.mp4",
      highlights: ["Floating diyas"],
      inclusions: ["Boat ride"],
      exclusions: ["Lunch"],
      ratingBreakdown: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
      latestReviews: [],
    });
    expect(d.images.map((i: { url: string }) => i.url)).toEqual([
      "https://media.test/destinations/ganga-aarti/01.webp",
      "https://media.test/destinations/ganga-aarti/02.webp",
    ]);
    expect(d.images[0].isCover).toBe(true);
    expect(d.itinerary.map((day: { title: string }) => day.title)).toEqual(["Day one", "Day two"]);

    // Related: same category or same city, never itself or unpublished ones.
    const related = d.related.map((r: { slug: string }) => r.slug).sort();
    expect(related).toEqual(["food-trail", "pilgrimage-circuit"]);
  });

  it("returns 404 for unknown or unpublished destinations", async () => {
    await api().get("/api/destinations/nope").expect(404);
    await api().get("/api/destinations/hidden-draft").expect(404);
  });
});

describe("GET /api/categories", () => {
  it("lists categories", async () => {
    const res = await api().get("/api/categories").expect(200);

    expect(res.body.data.map((c: { slug: string }) => c.slug)).toEqual(["food", "spiritual"]);
  });
});
