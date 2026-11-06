import { prisma } from "../../lib/prisma.js";
import { createUploadUrl, headObject, publicUrl } from "../../lib/r2.js";
import type {
  AddImageInput,
  PresignInput,
  SetVideoInput,
  UpdateImageInput,
} from "../../schemas/admin/media.schemas.js";
import { AppError, badRequest, conflict, notFound } from "../../utils/errors.js";
import { recordAudit } from "./audit.service.js";
import { findDestination, getAdminDestination } from "./destination.service.js";
import { deleteUnreferencedObjects } from "./destinationLifecycle.service.js";
import {
  MAX_IMAGES_PER_DESTINATION,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  generateKey,
  isImageType,
  isUploadKey,
  isVideoType,
  parseYouTubeUrl,
  type MediaFolder,
} from "./mediaRules.js";

const PRESIGN_SECONDS = 600;

const invalidField = (field: string, message: string) =>
  new AppError(422, "Validation failed", "VALIDATION_ERROR", [{ field, message }]);

const mb = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`;

const assertEditable = async (id: string) => {
  const destination = await findDestination(id);
  if (destination.deletedAt) throw conflict("Restore this trip before changing its media", "ARCHIVED");
  return destination;
};

/** Step 1 of an upload: the server picks the key and signs type and length into the URL. */
export const presignUpload = async (input: PresignInput) => {
  // The target decides the folder: a destination's photos/video, or a category's image.
  let folder: MediaFolder = "destinations";
  let slug: string;
  if (input.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId }, select: { slug: true } });
    if (!category) throw notFound("Category not found");
    folder = "categories";
    slug = category.slug;
  } else {
    slug = (await assertEditable(input.destinationId!)).slug;
  }

  const image = isImageType(input.contentType);
  const video = isVideoType(input.contentType);
  if ((!image && !video) || (folder === "categories" && !image)) {
    throw invalidField("contentType", "Use JPEG, PNG, WebP or AVIF images, or MP4 / WebM video");
  }

  const limit = image ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (input.sizeBytes > limit) {
    throw invalidField("sizeBytes", `${image ? "Images" : "Videos"} can be at most ${mb(limit)}`);
  }

  const key = generateKey(folder, slug, input.contentType);
  const uploadUrl = await createUploadUrl(key, input.contentType, input.sizeBytes, PRESIGN_SECONDS);

  return { key, uploadUrl, publicUrl: publicUrl(key), expiresIn: PRESIGN_SECONDS };
};

/** Step 2: after the browser PUT, verify the object really exists before saving a row. */
export const addImage = async (adminId: string, id: string, input: AddImageInput) => {
  const destination = await assertEditable(id);

  if (!isUploadKey(input.key)) throw invalidField("key", "That is not an uploaded image key");
  if (destination.images.length >= MAX_IMAGES_PER_DESTINATION) {
    throw conflict(`A trip can have at most ${MAX_IMAGES_PER_DESTINATION} images`, "TOO_MANY_IMAGES");
  }
  if (destination.images.some((image) => image.key === input.key)) {
    throw conflict("That image is already on this trip", "IMAGE_EXISTS");
  }

  const object = await headObject(input.key);
  if (!object) throw badRequest("The file was not found in storage. Upload it first.", "UPLOAD_MISSING");
  if (!isImageType(object.contentType)) throw invalidField("key", "The uploaded file is not an allowed image type");
  if (object.contentLength > MAX_IMAGE_BYTES) throw invalidField("key", `Images can be at most ${mb(MAX_IMAGE_BYTES)}`);

  await prisma.$transaction(async (tx) => {
    const last = destination.images.reduce((max, image) => Math.max(max, image.sortOrder), -1);
    await tx.destinationImage.create({
      data: {
        destinationId: id,
        key: input.key,
        alt: input.alt,
        sortOrder: last + 1,
        isCover: destination.images.length === 0,
        contentType: object.contentType!,
        sizeBytes: object.contentLength,
      },
    });
    await recordAudit(tx, adminId, "destination.image.add", "destination", id, `Added an image to "${destination.title}"`);
  });

  return getAdminDestination(id);
};

export const reorderImages = async (adminId: string, id: string, ids: string[]) => {
  const destination = await assertEditable(id);
  const known = new Set(destination.images.map((image) => image.id));

  if (ids.length !== known.size || ids.some((imageId) => !known.has(imageId))) {
    throw conflict("Send every image id exactly once to reorder", "REORDER_MISMATCH");
  }

  await prisma.$transaction(async (tx) => {
    for (const [index, imageId] of ids.entries()) {
      await tx.destinationImage.update({ where: { id: imageId }, data: { sortOrder: index } });
    }
    await recordAudit(tx, adminId, "destination.image.reorder", "destination", id, `Reordered images of "${destination.title}"`);
  });

  return getAdminDestination(id);
};

export const updateImage = async (adminId: string, id: string, imageId: string, input: UpdateImageInput) => {
  const destination = await assertEditable(id);
  const image = destination.images.find((candidate) => candidate.id === imageId);
  if (!image) throw notFound("Image not found");

  if (input.isCover === false && image.isCover) {
    throw conflict("A trip needs a cover image. Make another image the cover instead.", "COVER_REQUIRED");
  }

  await prisma.$transaction(async (tx) => {
    if (input.isCover === true && !image.isCover) {
      await tx.destinationImage.updateMany({ where: { destinationId: id }, data: { isCover: false } });
    }
    await tx.destinationImage.update({
      where: { id: imageId },
      data: { alt: input.alt, ...(input.isCover === true ? { isCover: true } : {}) },
    });
    await recordAudit(tx, adminId, "destination.image.update", "destination", id, `Edited an image of "${destination.title}"`);
  });

  return getAdminDestination(id);
};

export const deleteImage = async (adminId: string, id: string, imageId: string) => {
  const destination = await assertEditable(id);
  const image = destination.images.find((candidate) => candidate.id === imageId);
  if (!image) throw notFound("Image not found");

  await prisma.$transaction(async (tx) => {
    await tx.destinationImage.delete({ where: { id: imageId } });

    // Exactly one cover: hand it to the next image when the cover is removed.
    const next = destination.images.find((candidate) => candidate.id !== imageId);
    if (image.isCover && next) {
      await tx.destinationImage.update({ where: { id: next.id }, data: { isCover: true } });
    }
    await recordAudit(tx, adminId, "destination.image.delete", "destination", id, `Removed an image from "${destination.title}"`);
  });

  // Another trip (a duplicate) may still use this file: only delete it when unused.
  await deleteUnreferencedObjects([image.key]);
  return getAdminDestination(id);
};

export const setVideo = async (adminId: string, id: string, input: SetVideoInput) => {
  const destination = await assertEditable(id);
  let videoUrl: string;

  if (input.youtubeUrl) {
    const embed = parseYouTubeUrl(input.youtubeUrl);
    if (!embed) throw invalidField("youtubeUrl", "Paste a YouTube link (watch, youtu.be or embed)");
    videoUrl = embed;
  } else {
    const key = input.key!;
    if (!isUploadKey(key) || !/\.(mp4|webm)$/.test(key)) throw invalidField("key", "That is not an uploaded video key");

    const object = await headObject(key);
    if (!object) throw badRequest("The file was not found in storage. Upload it first.", "UPLOAD_MISSING");
    if (!isVideoType(object.contentType)) throw invalidField("key", "The uploaded file is not an MP4 or WebM video");
    if (object.contentLength > MAX_VIDEO_BYTES) throw invalidField("key", `Videos can be at most ${mb(MAX_VIDEO_BYTES)}`);
    videoUrl = key;
  }

  await prisma.$transaction(async (tx) => {
    await tx.destination.update({ where: { id }, data: { videoUrl } });
    await recordAudit(tx, adminId, "destination.video.set", "destination", id, `Set the video of "${destination.title}"`);
  });

  if (destination.videoUrl && destination.videoUrl !== videoUrl) await deleteUnreferencedObjects([destination.videoUrl]);
  return getAdminDestination(id);
};

export const removeVideo = async (adminId: string, id: string) => {
  const destination = await assertEditable(id);

  await prisma.$transaction(async (tx) => {
    await tx.destination.update({ where: { id }, data: { videoUrl: null } });
    await recordAudit(tx, adminId, "destination.video.remove", "destination", id, `Removed the video of "${destination.title}"`);
  });

  if (destination.videoUrl) await deleteUnreferencedObjects([destination.videoUrl]);
  return getAdminDestination(id);
};
