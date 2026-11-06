import { beforeEach, describe, expect, it } from "vitest";

import { createUploadUrl, deleteObject, headObject } from "../src/lib/r2.js";
import { parseYouTubeUrl } from "../src/services/admin/mediaRules.js";
import { vi } from "vitest";
import {
  admin,
  createAdminSession,
  createReadyDestination,
  fakeUploadedObject,
  resetDatabase,
  resetR2Mocks,
} from "./helpers.js";

let token: string;
let categoryId: string;
let draftId: string;
let slug: string;

beforeEach(async () => {
  await resetDatabase();
  resetR2Mocks();
  ({ token } = await createAdminSession());
  categoryId = (await admin(token).post("/categories").send({ name: "Honeymoon" })).body.category.id;
  const draft = (await admin(token).post("/destinations").send({ title: "Media Trip", categoryId })).body.destination;
  draftId = draft.id;
  slug = draft.slug;
});

const presign = (body: Record<string, unknown>) =>
  admin(token).post("/uploads/presign").send({ destinationId: draftId, filename: "a.webp", contentType: "image/webp", sizeBytes: 100_000, ...body });

describe("presign", () => {
  it("generates the key on the server and signs type and size", async () => {
    const res = await presign({ filename: "../../etc/passwd.png", contentType: "image/png" }).expect(200);

    // The client's filename never reaches the key.
    expect(res.body.key).toMatch(new RegExp(`^destinations/${slug}/[a-f0-9]{24}\\.png$`));
    expect(res.body).toMatchObject({
      uploadUrl: expect.stringContaining(res.body.key),
      publicUrl: `https://media.test/${res.body.key}`,
      expiresIn: 600,
    });
    expect(createUploadUrl).toHaveBeenCalledWith(res.body.key, "image/png", 100_000, 600);
  });

  it("allows only the listed image and video types", async () => {
    for (const contentType of ["image/jpeg", "image/png", "image/webp", "image/avif"]) {
      await presign({ contentType }).expect(200);
    }
    await presign({ contentType: "video/mp4", sizeBytes: 5_000_000 }).expect(200);
    await presign({ contentType: "video/webm", sizeBytes: 5_000_000 }).expect(200);

    for (const contentType of ["image/gif", "image/svg+xml", "application/pdf", "text/html", "video/quicktime"]) {
      const res = await presign({ contentType }).expect(422);
      expect(res.body.errors[0].field).toBe("contentType");
    }
  });

  it("enforces the size limits (10 MB images, 50 MB videos)", async () => {
    await presign({ sizeBytes: 10 * 1024 * 1024 }).expect(200);
    const image = await presign({ sizeBytes: 10 * 1024 * 1024 + 1 }).expect(422);
    expect(image.body.errors[0].field).toBe("sizeBytes");

    await presign({ contentType: "video/mp4", sizeBytes: 50 * 1024 * 1024 }).expect(200);
    await presign({ contentType: "video/mp4", sizeBytes: 50 * 1024 * 1024 + 1 }).expect(422);
    await presign({ sizeBytes: 0 }).expect(422);
  });

  it("rejects unknown and archived destinations", async () => {
    await presign({ destinationId: "missing" }).expect(404);
    await admin(token).post(`/destinations/${draftId}/archive`).expect(200);
    await presign({}).expect(409);
  });
});

describe("attaching images (HEAD verification)", () => {
  const key = () => presign({}).then((res) => res.body.key as string);

  it("refuses a file that was never uploaded", async () => {
    const res = await admin(token).post(`/destinations/${draftId}/images`).send({ key: await key(), alt: "x" }).expect(400);

    expect(res.body.code).toBe("UPLOAD_MISSING");
    expect(headObject).toHaveBeenCalled();
  });

  it("rejects keys the server did not generate and wrong stored types or sizes", async () => {
    fakeUploadedObject();
    await admin(token).post(`/destinations/${draftId}/images`).send({ key: "somewhere/else.webp" }).expect(422);
    await admin(token).post(`/destinations/${draftId}/images`).send({ key: "destinations/../secret.webp" }).expect(422);

    fakeUploadedObject("application/pdf");
    await admin(token).post(`/destinations/${draftId}/images`).send({ key: await key() }).expect(422);
    fakeUploadedObject("image/webp", 11 * 1024 * 1024);
    await admin(token).post(`/destinations/${draftId}/images`).send({ key: await key() }).expect(422);
  });

  it("saves a verified image, stores the real type and size, and makes the first one the cover", async () => {
    fakeUploadedObject("image/png", 45_000);
    const first = await admin(token).post(`/destinations/${draftId}/images`).send({ key: await key(), alt: "Ghat" }).expect(201);
    fakeUploadedObject("image/webp", 80_000);
    const second = await admin(token).post(`/destinations/${draftId}/images`).send({ key: await key(), alt: "Boat" }).expect(201);

    const images = second.body.destination.images;
    expect(first.body.destination.images[0]).toMatchObject({ isCover: true, contentType: "image/png", sizeBytes: 45_000, alt: "Ghat" });
    expect(images.map((i: { alt: string; sortOrder: number }) => [i.alt, i.sortOrder])).toEqual([["Ghat", 0], ["Boat", 1]]);
    expect(images.filter((i: { isCover: boolean }) => i.isCover)).toHaveLength(1);
    expect(images[0].url).toMatch(/^https:\/\/media\.test\//);
  });

  it("rejects attaching the same key twice", async () => {
    fakeUploadedObject();
    const k = await key();
    await admin(token).post(`/destinations/${draftId}/images`).send({ key: k }).expect(201);
    const res = await admin(token).post(`/destinations/${draftId}/images`).send({ key: k }).expect(409);

    expect(res.body.code).toBe("IMAGE_EXISTS");
  });
});

describe("image management", () => {
  const addTwo = async () => {
    const trip = await createReadyDestination(token, categoryId);
    const presigned = await admin(token)
      .post("/uploads/presign")
      .send({ destinationId: trip.id, filename: "b.webp", contentType: "image/webp", sizeBytes: 90_000 });
    fakeUploadedObject();
    const withTwo = await admin(token).post(`/destinations/${trip.id}/images`).send({ key: presigned.body.key, alt: "Second" }).expect(201);
    return { id: trip.id, images: withTwo.body.destination.images as { id: string; key: string; isCover: boolean }[] };
  };

  it("reorders images and validates the id list", async () => {
    const { id, images } = await addTwo();

    await admin(token).patch(`/destinations/${id}/images/reorder`).send({ ids: [images[0]!.id] }).expect(409);
    await admin(token).patch(`/destinations/${id}/images/reorder`).send({ ids: [images[0]!.id, "other"] }).expect(409);

    const res = await admin(token).patch(`/destinations/${id}/images/reorder`).send({ ids: [images[1]!.id, images[0]!.id] }).expect(200);
    expect(res.body.destination.images.map((i: { id: string }) => i.id)).toEqual([images[1]!.id, images[0]!.id]);
  });

  it("keeps exactly one cover", async () => {
    const { id, images } = await addTwo();

    const switched = await admin(token).patch(`/destinations/${id}/images/${images[1]!.id}`).send({ isCover: true }).expect(200);
    const covers = switched.body.destination.images.filter((i: { isCover: boolean }) => i.isCover);
    expect(covers.map((i: { id: string }) => i.id)).toEqual([images[1]!.id]);

    const refused = await admin(token).patch(`/destinations/${id}/images/${images[1]!.id}`).send({ isCover: false }).expect(409);
    expect(refused.body.code).toBe("COVER_REQUIRED");

    const alt = await admin(token).patch(`/destinations/${id}/images/${images[0]!.id}`).send({ alt: "New alt text" }).expect(200);
    expect(alt.body.destination.images.find((i: { id: string }) => i.id === images[0]!.id).alt).toBe("New alt text");
  });

  it("promotes another image to cover when the cover is deleted, and deletes the R2 file", async () => {
    const { id, images } = await addTwo();

    const res = await admin(token).delete(`/destinations/${id}/images/${images[0]!.id}`).expect(200);

    expect(res.body.destination.images).toHaveLength(1);
    expect(res.body.destination.images[0]).toMatchObject({ id: images[1]!.id, isCover: true });
    expect(deleteObject).toHaveBeenCalledWith(images[0]!.key);
  });

  it("never deletes a file another trip still uses (duplicates share files)", async () => {
    const { id, images } = await addTwo();
    const copy = (await admin(token).post(`/destinations/${id}/duplicate`).expect(201)).body.destination;
    vi.mocked(deleteObject).mockClear();

    await admin(token).delete(`/destinations/${id}/images/${images[1]!.id}`).expect(200);
    expect(deleteObject).not.toHaveBeenCalled();

    // Once the copy drops its last reference, the file is finally removed.
    const copyImage = copy.images.find((i: { key: string }) => i.key === images[1]!.key);
    await admin(token).delete(`/destinations/${copy.id}/images/${copyImage.id}`).expect(200);
    expect(deleteObject).toHaveBeenCalledWith(images[1]!.key);
  });

  it("permanent delete keeps files that a duplicate still references", async () => {
    const trip = await createReadyDestination(token, categoryId);
    const copy = (await admin(token).post(`/destinations/${trip.id}/duplicate`).expect(201)).body.destination;
    vi.mocked(deleteObject).mockClear();

    await admin(token).post(`/destinations/${trip.id}/archive`).expect(200);
    await admin(token).delete(`/destinations/${trip.id}`).expect(204);

    expect(deleteObject).not.toHaveBeenCalled();
    expect((await admin(token).get(`/destinations/${copy.id}`).expect(200)).body.destination.images).toHaveLength(1);
  });

  it("caps a trip at 20 images", async () => {
    fakeUploadedObject();
    for (let i = 0; i < 20; i++) {
      const k = (await presign({}).expect(200)).body.key;
      await admin(token).post(`/destinations/${draftId}/images`).send({ key: k }).expect(201);
    }
    const k = (await presign({}).expect(200)).body.key;

    await admin(token).post(`/destinations/${draftId}/images`).send({ key: k }).expect(409);
  });
});

describe("video", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?t=42", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://m.youtube.com/watch?v=dQw4w9WgXcQ&feature=share", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
  ])("normalises %s to the embed URL", async (url, id) => {
    const res = await admin(token).put(`/destinations/${draftId}/video`).send({ youtubeUrl: url }).expect(200);

    expect(res.body.destination.video).toEqual({ type: "YOUTUBE", url: `https://www.youtube.com/embed/${id}`, key: null });
    expect(deleteObject).not.toHaveBeenCalled();
  });

  it.each(["https://vimeo.com/123456789", "https://evil.example.com/watch?v=dQw4w9WgXcQ", "https://www.youtube.com/watch?v=short", "javascript:alert(1)", "not a url"])(
    "rejects %s",
    async (url) => {
      const res = await admin(token).put(`/destinations/${draftId}/video`).send({ youtubeUrl: url }).expect(422);

      expect(res.body.errors[0].field).toBe("youtubeUrl");
    },
  );

  it("requires exactly one of youtubeUrl or key", async () => {
    await admin(token).put(`/destinations/${draftId}/video`).send({}).expect(422);
    await admin(token).put(`/destinations/${draftId}/video`).send({ youtubeUrl: "https://youtu.be/dQw4w9WgXcQ", key: "x" }).expect(422);
  });

  it("accepts a verified uploaded mp4 and deletes it when removed", async () => {
    const up = (await presign({ contentType: "video/mp4", sizeBytes: 5_000_000, filename: "tour.mp4" }).expect(200)).body;

    await admin(token).put(`/destinations/${draftId}/video`).send({ key: up.key }).expect(400); // not uploaded yet
    fakeUploadedObject("video/mp4", 5_000_000);
    const set = await admin(token).put(`/destinations/${draftId}/video`).send({ key: up.key }).expect(200);
    expect(set.body.destination.video).toEqual({ type: "UPLOAD", url: `https://media.test/${up.key}`, key: up.key });

    const removed = await admin(token).delete(`/destinations/${draftId}/video`).expect(200);
    expect(removed.body.destination.video).toBeNull();
    expect(deleteObject).toHaveBeenCalledWith(up.key);
  });

  it("rejects an uploaded file that is not a video or is too large", async () => {
    const up = (await presign({ contentType: "video/webm", sizeBytes: 1_000_000, filename: "t.webm" }).expect(200)).body;

    fakeUploadedObject("image/webp", 1000);
    await admin(token).put(`/destinations/${draftId}/video`).send({ key: up.key }).expect(422);
    fakeUploadedObject("video/webm", 60 * 1024 * 1024);
    await admin(token).put(`/destinations/${draftId}/video`).send({ key: up.key }).expect(422);
  });

  it("replacing an uploaded video with a YouTube link removes the old file", async () => {
    const up = (await presign({ contentType: "video/mp4", sizeBytes: 5_000_000 }).expect(200)).body;
    fakeUploadedObject("video/mp4", 5_000_000);
    await admin(token).put(`/destinations/${draftId}/video`).send({ key: up.key }).expect(200);

    await admin(token).put(`/destinations/${draftId}/video`).send({ youtubeUrl: "https://youtu.be/dQw4w9WgXcQ" }).expect(200);

    expect(deleteObject).toHaveBeenCalledWith(up.key);
  });
});

describe("parseYouTubeUrl", () => {
  it("only accepts YouTube hosts and 11-character ids", () => {
    expect(parseYouTubeUrl("https://youtu.be/abcDEF12345")).toBe("https://www.youtube.com/embed/abcDEF12345");
    expect(parseYouTubeUrl("https://youtube.com.evil.io/watch?v=abcDEF12345")).toBeNull();
    expect(parseYouTubeUrl("https://www.youtube.com/watch")).toBeNull();
    expect(parseYouTubeUrl("ftp://youtu.be/abcDEF12345")).toBeNull();
  });
});
