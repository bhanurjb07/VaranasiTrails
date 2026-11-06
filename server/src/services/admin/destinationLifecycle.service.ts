import { prisma } from "../../lib/prisma.js";
import { deleteObject } from "../../lib/r2.js";
import type { BulkAction } from "../../schemas/admin/destination.schemas.js";
import { AppError, conflict, type FieldError } from "../../utils/errors.js";
import { uniqueSlug } from "../../utils/slug.js";
import { recordAudit } from "./audit.service.js";
import {
  findDestination,
  getAdminDestination,
  publishDestination,
  setFeatured,
  unpublishDestination,
} from "./destination.service.js";

export const archiveDestination = async (adminId: string, id: string) => {
  const destination = await findDestination(id);

  await prisma.$transaction(async (tx) => {
    await tx.destination.update({
      where: { id },
      data: { deletedAt: new Date(), isPublished: false, isFeatured: false },
    });
    await recordAudit(tx, adminId, "destination.archive", "destination", id, `Archived "${destination.title}"`);
  });

  return getAdminDestination(id);
};

/** Restored trips come back as drafts; publish them again on purpose. */
export const restoreDestination = async (adminId: string, id: string) => {
  const destination = await findDestination(id);
  if (!destination.deletedAt) throw conflict("This trip is not archived", "NOT_ARCHIVED");

  await prisma.$transaction(async (tx) => {
    await tx.destination.update({ where: { id }, data: { deletedAt: null } });
    await recordAudit(tx, adminId, "destination.restore", "destination", id, `Restored "${destination.title}" as a draft`);
  });

  return getAdminDestination(id);
};

/**
 * Copies a trip into a new draft. Image rows point at the SAME stored files; a file is
 * only deleted from R2 when no image row of any trip still references it.
 */
export const duplicateDestination = async (adminId: string, id: string) => {
  const source = await findDestination(id);
  const slug = await uniqueSlug(`${source.slug}-copy`, async (candidate) =>
    (await prisma.destination.count({ where: { slug: candidate } })) > 0,
  );

  const copyId = await prisma.$transaction(async (tx) => {
    const copy = await tx.destination.create({
      data: {
        slug,
        title: `${source.title} (Copy)`,
        tagline: source.tagline,
        overview: source.overview,
        city: source.city,
        state: source.state,
        country: source.country,
        categoryId: source.categoryId,
        priceInr: source.priceInr,
        originalPriceInr: source.originalPriceInr,
        durationDays: source.durationDays,
        durationNights: source.durationNights,
        maxGroupSize: source.maxGroupSize,
        difficulty: source.difficulty,
        bestTimeToVisit: source.bestTimeToVisit,
        meetingPoint: source.meetingPoint,
        videoUrl: source.videoUrl,
        metaTitle: source.metaTitle,
        metaDescription: source.metaDescription,
        isPublished: false,
        isFeatured: false,
      },
    });
    await tx.destinationImage.createMany({
      data: source.images.map(({ key, alt, sortOrder, isCover, contentType, sizeBytes }) => ({
        destinationId: copy.id, key, alt, sortOrder, isCover, contentType, sizeBytes,
      })),
    });
    await tx.destinationHighlight.createMany({
      data: source.highlights.map(({ text, sortOrder }) => ({ destinationId: copy.id, text, sortOrder })),
    });
    await tx.itineraryDay.createMany({
      data: source.itinerary.map(({ dayNumber, title, description }) => ({ destinationId: copy.id, dayNumber, title, description })),
    });
    await tx.destinationInclusion.createMany({
      data: source.inclusions.map(({ text, isIncluded, sortOrder }) => ({ destinationId: copy.id, text, isIncluded, sortOrder })),
    });
    await recordAudit(tx, adminId, "destination.duplicate", "destination", copy.id, `Duplicated "${source.title}"`);
    return copy.id;
  });

  return getAdminDestination(copyId);
};

/** Deletes R2 objects nobody references any more. Failures are logged, never thrown. */
export const deleteUnreferencedObjects = async (keys: string[]) => {
  for (const key of new Set(keys)) {
    // A YouTube link is not a stored file.
    if (/^https?:\/\//i.test(key)) continue;

    const [imageRefs, videoRefs, categoryRefs] = await Promise.all([
      prisma.destinationImage.count({ where: { key } }),
      prisma.destination.count({ where: { videoUrl: key } }),
      prisma.category.count({ where: { imageKey: key } }),
    ]);
    if (imageRefs + videoRefs + categoryRefs > 0) continue;

    try {
      await deleteObject(key);
    } catch (error) {
      console.error(`[admin] Could not delete R2 object ${key}:`, error instanceof Error ? error.message : error);
    }
  }
};

/** Permanent delete: only for archived trips. Also removes files no other trip uses. */
export const deleteDestination = async (adminId: string, id: string) => {
  const destination = await findDestination(id);
  if (!destination.deletedAt) {
    throw conflict("Archive this trip first. Only archived trips can be deleted permanently.", "NOT_ARCHIVED");
  }

  const keys = destination.images.map((image) => image.key);
  if (destination.videoUrl && !/^https?:\/\//i.test(destination.videoUrl)) keys.push(destination.videoUrl);

  await prisma.$transaction(async (tx) => {
    await tx.destination.delete({ where: { id } });
    await recordAudit(tx, adminId, "destination.delete", "destination", id, `Permanently deleted "${destination.title}"`);
  });

  await deleteUnreferencedObjects(keys);
};

export interface BulkFailure {
  id: string;
  message: string;
  errors?: FieldError[];
}

/** Applies one action to many trips. Each trip succeeds or fails on its own. */
export const bulkDestinations = async (adminId: string, ids: string[], action: BulkAction) => {
  const failed: BulkFailure[] = [];
  let updated = 0;

  for (const id of ids) {
    try {
      if (action === "publish") await publishDestination(adminId, id);
      else if (action === "unpublish") await unpublishDestination(adminId, id);
      else if (action === "archive") await archiveDestination(adminId, id);
      else await setFeatured(adminId, id, action === "feature");
      updated += 1;
    } catch (error) {
      if (!(error instanceof AppError)) throw error;
      failed.push({ id, message: error.message, ...(error.errors ? { errors: error.errors } : {}) });
    }
  }

  await recordAudit(prisma, adminId, "destination.bulk", "destination", null, `Bulk ${action}: ${updated} done, ${failed.length} failed`);
  return { action, updated, failed };
};
