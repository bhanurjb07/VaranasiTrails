import { beforeEach, describe, expect, it } from "vitest";

import { sendEmail } from "../src/lib/mailer.js";
import { prisma } from "../src/lib/prisma.js";
import { vi } from "vitest";
import {
  PASSWORD,
  api,
  bearer,
  createCategory,
  createDestination,
  resetDatabase,
  signup,
  signupAndVerify,
  uniqueUser,
} from "./helpers.js";

let destinationId: string;

beforeEach(async () => {
  await resetDatabase();
  const category = await createCategory();
  destinationId = (await createDestination(category.id, { slug: "ganga-aarti" })).id;
});

const rating = async () => {
  const d = await prisma.destination.findUniqueOrThrow({ where: { id: destinationId } });
  return { avg: d.ratingAvg, count: d.ratingCount };
};

const review = { rating: 5, title: "Wonderful", comment: "An unforgettable evening on the river." };

describe("reviews", () => {
  it("recomputes ratingAvg and ratingCount on create, update and delete", async () => {
    const a = await signupAndVerify();
    const b = await signupAndVerify();
    const url = "/api/destinations/ganga-aarti/reviews";

    const first = await api().post(url).set(bearer(a.accessToken)).send(review).expect(201);
    expect(await rating()).toEqual({ avg: 5, count: 1 });

    await api()
      .post(url)
      .set(bearer(b.accessToken))
      .send({ ...review, rating: 2 })
      .expect(201);
    expect(await rating()).toEqual({ avg: 3.5, count: 2 });

    await api()
      .patch(`${url}/${first.body.review.id}`)
      .set(bearer(a.accessToken))
      .send({ rating: 4 })
      .expect(200);
    expect(await rating()).toEqual({ avg: 3, count: 2 });

    // Someone else's review is invisible to you.
    await api().delete(`${url}/${first.body.review.id}`).set(bearer(b.accessToken)).expect(404);

    await api().delete(`${url}/${first.body.review.id}`).set(bearer(a.accessToken)).expect(204);
    expect(await rating()).toEqual({ avg: 2, count: 1 });

    const detail = await api().get("/api/destinations/ganga-aarti").expect(200);
    expect(detail.body.destination.ratingBreakdown).toEqual({ "1": 0, "2": 1, "3": 0, "4": 0, "5": 0 });
    expect(detail.body.destination.latestReviews).toHaveLength(1);
  });

  it("allows one review per user per destination", async () => {
    const a = await signupAndVerify();
    const url = "/api/destinations/ganga-aarti/reviews";

    await api().post(url).set(bearer(a.accessToken)).send(review).expect(201);
    const dup = await api().post(url).set(bearer(a.accessToken)).send(review).expect(409);
    expect(dup.body.code).toBe("REVIEW_EXISTS");
    expect(await rating()).toEqual({ avg: 5, count: 1 });
  });

  it("requires auth, a verified email and valid input; listing is public and paginated", async () => {
    const url = "/api/destinations/ganga-aarti/reviews";
    await api().post(url).send(review).expect(401);

    const a = await signupAndVerify();
    await api().post(url).set(bearer(a.accessToken)).send({ ...review, rating: 6 }).expect(422);
    await api().post(url).set(bearer(a.accessToken)).send({ ...review, comment: "short" }).expect(422);
    await api().post("/api/destinations/nope/reviews").set(bearer(a.accessToken)).send(review).expect(404);

    // A user whose email is not verified cannot review, even with a valid token.
    const unverified = uniqueUser();
    await signup(unverified).expect(201);
    const row = await prisma.user.findUniqueOrThrow({ where: { email: unverified.email } });
    const { signAccessToken } = await import("../src/utils/jwt.js");
    const res = await api()
      .post(url)
      .set(bearer(signAccessToken(row.id)))
      .send(review)
      .expect(403);
    expect(res.body.code).toBe("EMAIL_NOT_VERIFIED");

    await api().post(url).set(bearer(a.accessToken)).send(review).expect(201);
    const list = await api().get(`${url}?limit=1`).expect(200);
    expect(list.headers["cache-control"]).toBe("public, max-age=60");
    expect(list.body.meta).toEqual({ page: 1, limit: 1, total: 1, totalPages: 1 });
    expect(list.body.data[0]).toMatchObject({ rating: 5, user: { name: a.user.name } });
    expect(list.body.data[0].user).not.toHaveProperty("email");
  });
});

describe("wishlist", () => {
  it("adds idempotently, lists and removes", async () => {
    const a = await signupAndVerify();
    const url = `/api/wishlist/${destinationId}`;

    await api().get("/api/wishlist").expect(401);
    await api().put(url).set(bearer(a.accessToken)).expect(200);
    await api().put(url).set(bearer(a.accessToken)).expect(200);
    await api().put("/api/wishlist/missing").set(bearer(a.accessToken)).expect(404);

    const list = await api().get("/api/wishlist").set(bearer(a.accessToken)).expect(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0]).toMatchObject({ slug: "ganga-aarti" });

    await api().delete(url).set(bearer(a.accessToken)).expect(200);
    const empty = await api().get("/api/wishlist").set(bearer(a.accessToken)).expect(200);
    expect(empty.body.data).toEqual([]);
  });
});

describe("users", () => {
  it("reads and updates the profile", async () => {
    const a = await signupAndVerify();
    const other = await signupAndVerify();

    const me = await api().get("/api/users/me").set(bearer(a.accessToken)).expect(200);
    expect(me.body.user.email).toBe(a.user.email);

    const updated = await api()
      .patch("/api/users/me")
      .set(bearer(a.accessToken))
      .send({ name: "New Name", phone: "8123456789" })
      .expect(200);
    expect(updated.body.user).toMatchObject({ name: "New Name", phone: "+918123456789" });

    await api()
      .patch("/api/users/me")
      .set(bearer(other.accessToken))
      .send({ phone: "+918123456789" })
      .expect(409);
    await api().patch("/api/users/me").set(bearer(a.accessToken)).send({}).expect(422);
  });

  it("changes the password and revokes other sessions only", async () => {
    const a = await signupAndVerify();
    const second = await api()
      .post("/api/auth/login")
      .send({ email: a.user.email, password: PASSWORD })
      .expect(200);
    const otherCookie = (second.headers["set-cookie"] as unknown as string[])[0]!.split(";")[0]!;

    await api()
      .post("/api/users/me/change-password")
      .set(bearer(a.accessToken))
      .set("Cookie", a.cookie)
      .send({ oldPassword: "WrongPass1", newPassword: "BrandNew123" })
      .expect(400);
    await api()
      .post("/api/users/me/change-password")
      .set(bearer(a.accessToken))
      .set("Cookie", a.cookie)
      .send({ oldPassword: PASSWORD, newPassword: "BrandNew123" })
      .expect(200);

    await api().post("/api/auth/refresh").set("Cookie", otherCookie).expect(401);
    await api().post("/api/auth/refresh").set("Cookie", a.cookie).expect(200);
    await api()
      .post("/api/auth/login")
      .send({ email: a.user.email, password: "BrandNew123" })
      .expect(200);
  });
});

describe("enquiries", () => {
  it("stores the enquiry and emails the owner", async () => {
    const res = await api()
      .post("/api/enquiries")
      .send({
        name: "Asha Verma",
        email: "ASHA@example.com",
        phone: "9876543210",
        destinationId,
        message: "Do you run this trip for a family of six?",
      })
      .expect(201);

    const stored = await prisma.enquiry.findUniqueOrThrow({ where: { id: res.body.id } });
    expect(stored).toMatchObject({ email: "asha@example.com", phone: "+919876543210", destinationId });

    const mail = vi.mocked(sendEmail).mock.calls.at(-1)![0];
    expect(mail.to).toBe("owner@example.com");
    expect(mail.text).toContain("Asha Verma");
  });

  it("validates input and unknown destinations", async () => {
    await api().post("/api/enquiries").send({ name: "A" }).expect(422);
    await api()
      .post("/api/enquiries")
      .send({
        name: "Asha Verma",
        email: "asha@example.com",
        phone: "9876543210",
        destinationId: "missing",
        message: "Is this available next month?",
      })
      .expect(404);
  });
});
