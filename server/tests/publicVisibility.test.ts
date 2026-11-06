import { beforeEach, describe, expect, it } from "vitest";

import { admin, api, bearer, createAdminSession, createReadyDestination, resetDatabase, resetR2Mocks, signupAndVerify } from "./helpers.js";

let token: string;
let categoryId: string;

beforeEach(async () => {
  await resetDatabase();
  resetR2Mocks();
  ({ token } = await createAdminSession());
  categoryId = (await admin(token).post("/categories").send({ name: "Honeymoon" })).body.category.id;
});

const live = async (title: string) => {
  const trip = await createReadyDestination(token, categoryId, { title });
  await admin(token).post(`/destinations/${trip.id}/publish`).expect(200);
  return trip;
};

const publicSlugs = async () =>
  (await api().get("/api/destinations?limit=24").expect(200)).body.data.map((d: { slug: string }) => d.slug).sort();

describe("what the public API shows", () => {
  it("never shows drafts", async () => {
    const shown = await live("Shown Trip");
    const draft = await createReadyDestination(token, categoryId, { title: "Secret Draft" });

    expect(await publicSlugs()).toEqual([shown.slug]);
    await api().get(`/api/destinations/${draft.slug}`).expect(404);
    await api().get(`/api/destinations/${draft.slug}/reviews`).expect(404);
    const user = await signupAndVerify();
    await api().put(`/api/wishlist/${draft.id}`).set(bearer(user.accessToken)).expect(404);
    await api().post("/api/enquiries").send({ name: "Asha Verma", email: "a@example.com", phone: "9876543210", message: "Hello there, a question about trips." }).expect(201);

    const detail = await api().get(`/api/destinations/${shown.slug}`).expect(200);
    expect(detail.body.destination.related).toEqual([]);
  });

  it("never shows archived trips, and they disappear from related trips and wishlists", async () => {
    const keep = await live("Kept Trip");
    const gone = await live("Archived Trip");
    const user = await signupAndVerify();
    await api().put(`/api/wishlist/${gone.id}`).set(bearer(user.accessToken)).expect(200);
    expect((await api().get(`/api/destinations/${keep.slug}`).expect(200)).body.destination.related).toHaveLength(1);
    expect((await api().get("/api/wishlist").set(bearer(user.accessToken)).expect(200)).body.data).toHaveLength(1);

    await admin(token).post(`/destinations/${gone.id}/archive`).expect(200);

    expect(await publicSlugs()).toEqual([keep.slug]);
    await api().get(`/api/destinations/${gone.slug}`).expect(404);
    await api().get(`/api/destinations/${gone.slug}/reviews`).expect(404);
    await api().post(`/api/destinations/${gone.slug}/reviews`).set(bearer(user.accessToken)).send({ rating: 5, title: "Great", comment: "A wonderful experience overall." }).expect(404);
    expect((await api().get(`/api/destinations/${keep.slug}`).expect(200)).body.destination.related).toEqual([]);
    expect((await api().get("/api/wishlist").set(bearer(user.accessToken)).expect(200)).body.data).toEqual([]);
    await api().put(`/api/wishlist/${gone.id}`).set(bearer(user.accessToken)).expect(404);
  });

  it("restoring an archived trip does not make it public until it is published again", async () => {
    const trip = await live("Comes Back");
    await admin(token).post(`/destinations/${trip.id}/archive`).expect(200);
    await admin(token).post(`/destinations/${trip.id}/restore`).expect(200);

    expect(await publicSlugs()).toEqual([]);
    await admin(token).post(`/destinations/${trip.id}/publish`).expect(200);
    expect(await publicSlugs()).toEqual([trip.slug]);
  });

  it("hidden reviews are excluded from lists, counts, breakdown and ratings, and still block a second review", async () => {
    const trip = await live("Reviewed Trip");
    const user = await signupAndVerify();
    const created = await api().post(`/api/destinations/${trip.slug}/reviews`).set(bearer(user.accessToken)).send({ rating: 4, title: "Pretty good", comment: "Enjoyable trip with a friendly guide." }).expect(201);
    await admin(token).patch(`/reviews/${created.body.review.id}/hide`).expect(200);

    const list = await api().get(`/api/destinations/${trip.slug}/reviews`).expect(200);
    expect(list.body.data).toEqual([]);
    expect(list.body.meta.total).toBe(0);
    const detail = (await api().get(`/api/destinations/${trip.slug}`).expect(200)).body.destination;
    expect(detail).toMatchObject({ ratingAvg: 0, ratingCount: 0, latestReviews: [] });
    expect(detail.ratingBreakdown).toEqual({ "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 });

    // The author cannot dodge moderation by posting again.
    await api().post(`/api/destinations/${trip.slug}/reviews`).set(bearer(user.accessToken)).send({ rating: 5, title: "Again", comment: "Trying to post another review." }).expect(409);

    // Editing a hidden review keeps it hidden.
    await api().patch(`/api/destinations/${trip.slug}/reviews/${created.body.review.id}`).set(bearer(user.accessToken)).send({ rating: 5 }).expect(200);
    expect((await api().get(`/api/destinations/${trip.slug}/reviews`).expect(200)).body.data).toEqual([]);
    expect((await api().get(`/api/destinations/${trip.slug}`).expect(200)).body.destination.ratingCount).toBe(0);
  });

  it("hides inactive categories from the public category list but keeps their trips visible", async () => {
    const trip = await live("Still Visible");
    await admin(token).patch(`/categories/${categoryId}`).send({ isActive: false }).expect(200);

    expect((await api().get("/api/categories").expect(200)).body.data).toEqual([]);
    expect(await publicSlugs()).toEqual([trip.slug]);
  });
});
