import type { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import type {
  CreateDestinationInput,
  ListAdminDestinationsQuery,
  UpdateDestinationInput,
} from "../../schemas/admin/destination.schemas.js";
import { AppError, conflict, notFound } from "../../utils/errors.js";
import { paginationMeta } from "../../utils/pagination.js";
import { uniqueSlug } from "../../utils/slug.js";
import { recordAudit } from "./audit.service.js";
import { adminInclude, checkReadiness, rowInclude, toAdminDetail, toRow } from "./destinationMapper.js";

type Tx = Prisma.TransactionClient;

export const findDestination = async (id: string, db: Tx | typeof prisma = prisma) => {
  const destination = await db.destination.findUnique({ where: { id }, include: adminInclude });
  if (!destination) throw notFound("Destination not found");
  return destination;
};

const notReady = (errors: ReturnType<typeof checkReadiness>) =>
  new AppError(422, "This trip is not ready to publish yet", "NOT_READY", errors);

const slugTaken = (excludeId?: string) => async (slug: string) =>
  (await prisma.destination.count({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) } })) > 0;

const orderBy = (sort: ListAdminDestinationsQuery["sort"]): Prisma.DestinationOrderByWithRelationInput[] => {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" }, { id: "asc" }];
    case "title":
      return [{ title: "asc" }, { id: "asc" }];
    case "price_asc":
      return [{ priceInr: "asc" }, { id: "asc" }];
    case "price_desc":
      return [{ priceInr: "desc" }, { id: "asc" }];
    case "updated":
      return [{ updatedAt: "desc" }, { id: "asc" }];
  }
};

/** "All" means everything except archived trips, which have their own tab. */
export const listAdminDestinations = async (query: ListAdminDestinationsQuery) => {
  const where: Prisma.DestinationWhereInput = {
    deletedAt: query.status === "archived" ? { not: null } : null,
    ...(query.status === "published" ? { isPublished: true } : {}),
    ...(query.status === "draft" ? { isPublished: false } : {}),
    ...(query.q
      ? { OR: [{ title: { contains: query.q } }, { city: { contains: query.q } }, { slug: { contains: query.q } }] }
      : {}),
    ...(query.category ? { OR: [{ categoryId: query.category }, { category: { slug: query.category } }] } : {}),
    ...(query.featured !== undefined ? { isFeatured: query.featured } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.destination.count({ where }),
    prisma.destination.findMany({
      where,
      include: rowInclude,
      orderBy: orderBy(query.sort),
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return { data: rows.map(toRow), meta: paginationMeta(query.page, query.limit, total) };
};

export const getAdminDestination = async (id: string) => toAdminDetail(await findDestination(id));

/** Scalar columns copied straight from the form. */
const scalarData = (input: UpdateDestinationInput) => ({
  title: input.title,
  tagline: input.tagline,
  overview: input.overview,
  categoryId: input.categoryId,
  city: input.city,
  state: input.state,
  country: input.country,
  priceInr: input.priceInr,
  originalPriceInr: input.originalPriceInr,
  durationDays: input.durationDays,
  durationNights: input.durationNights,
  maxGroupSize: input.maxGroupSize,
  difficulty: input.difficulty,
  bestTimeToVisit: input.bestTimeToVisit,
  meetingPoint: input.meetingPoint,
  metaTitle: input.metaTitle,
  metaDescription: input.metaDescription,
  isFeatured: input.isFeatured,
});

const assertCategory = async (categoryId: string | undefined) => {
  if (categoryId && (await prisma.category.count({ where: { id: categoryId } })) === 0) {
    throw new AppError(422, "Choose a valid category", "VALIDATION_ERROR", [
      { field: "categoryId", message: "Category not found" },
    ]);
  }
};

const replaceChildren = async (tx: Tx, id: string, input: UpdateDestinationInput) => {
  if (input.highlights) {
    await tx.destinationHighlight.deleteMany({ where: { destinationId: id } });
    await tx.destinationHighlight.createMany({
      data: input.highlights.map((text, sortOrder) => ({ destinationId: id, text, sortOrder })),
    });
  }
  if (input.itinerary) {
    await tx.itineraryDay.deleteMany({ where: { destinationId: id } });
    await tx.itineraryDay.createMany({
      data: input.itinerary.map((day, index) => ({ destinationId: id, dayNumber: index + 1, ...day })),
    });
  }
  for (const [list, isIncluded] of [
    [input.inclusions, true],
    [input.exclusions, false],
  ] as const) {
    if (!list) continue;
    await tx.destinationInclusion.deleteMany({ where: { destinationId: id, isIncluded } });
    await tx.destinationInclusion.createMany({
      data: list.map((text, sortOrder) => ({ destinationId: id, text, isIncluded, sortOrder })),
    });
  }
};

export const createDestination = async (adminId: string, input: CreateDestinationInput) => {
  await assertCategory(input.categoryId);
  const slug = await uniqueSlug(input.slug ?? input.title, slugTaken());

  const created = await prisma.$transaction(async (tx) => {
    const destination = await tx.destination.create({
      data: {
        slug,
        title: input.title,
        categoryId: input.categoryId,
        tagline: input.tagline ?? "",
        overview: input.overview ?? "",
        city: input.city ?? "Varanasi",
        state: input.state ?? "Uttar Pradesh",
        country: input.country ?? "India",
        priceInr: input.priceInr ?? 0,
        originalPriceInr: input.originalPriceInr ?? null,
        durationDays: input.durationDays ?? 1,
        durationNights: input.durationNights ?? 0,
        maxGroupSize: input.maxGroupSize ?? 10,
        difficulty: input.difficulty ?? "EASY",
        bestTimeToVisit: input.bestTimeToVisit ?? "",
        meetingPoint: input.meetingPoint ?? null,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        isFeatured: input.isFeatured ?? false,
        isPublished: false,
      },
    });
    await replaceChildren(tx, destination.id, input);
    await recordAudit(tx, adminId, "destination.create", "destination", destination.id, `Created draft "${destination.title}"`);
    return destination;
  });

  return getAdminDestination(created.id);
};

export const updateDestination = async (adminId: string, id: string, input: UpdateDestinationInput) => {
  const existing = await findDestination(id);
  if (existing.deletedAt) throw conflict("Restore this trip before editing it", "ARCHIVED");

  await assertCategory(input.categoryId);

  // Partial updates still have to keep the discount valid against the stored price.
  const price = input.priceInr ?? existing.priceInr;
  const original = input.originalPriceInr === undefined ? existing.originalPriceInr : input.originalPriceInr;
  if (original !== null && original <= price) {
    throw new AppError(422, "Validation failed", "VALIDATION_ERROR", [
      { field: "originalPriceInr", message: "Original price must be higher than the price" },
    ]);
  }

  if (input.slug && input.slug !== existing.slug && (await slugTaken(id)(input.slug))) {
    throw conflict("That slug is already used by another trip", "SLUG_TAKEN");
  }

  await prisma.$transaction(async (tx) => {
    await tx.destination.update({ where: { id }, data: { ...scalarData(input), slug: input.slug } });
    await replaceChildren(tx, id, input);

    // A live trip must stay publishable: refuse edits that would break it.
    if (existing.isPublished) {
      const errors = checkReadiness(await findDestination(id, tx));
      if (errors.length > 0) throw notReady(errors);
    }

    await recordAudit(tx, adminId, "destination.update", "destination", id, `Edited "${input.title ?? existing.title}"`);
  });

  return getAdminDestination(id);
};

export const publishDestination = async (adminId: string, id: string) => {
  const destination = await findDestination(id);
  if (destination.deletedAt) throw conflict("Restore this trip before publishing it", "ARCHIVED");

  const errors = checkReadiness(destination);
  if (errors.length > 0) throw notReady(errors);

  await prisma.$transaction(async (tx) => {
    await tx.destination.update({
      where: { id },
      data: { isPublished: true, publishedAt: destination.publishedAt ?? new Date() },
    });
    await recordAudit(tx, adminId, "destination.publish", "destination", id, `Published "${destination.title}"`);
  });

  return getAdminDestination(id);
};

export const unpublishDestination = async (adminId: string, id: string) => {
  const destination = await findDestination(id);

  await prisma.$transaction(async (tx) => {
    await tx.destination.update({ where: { id }, data: { isPublished: false } });
    await recordAudit(tx, adminId, "destination.unpublish", "destination", id, `Unpublished "${destination.title}"`);
  });

  return getAdminDestination(id);
};

export const setFeatured = async (adminId: string, id: string, isFeatured: boolean) => {
  const destination = await findDestination(id);
  if (destination.deletedAt) throw conflict("Restore this trip first", "ARCHIVED");

  await prisma.$transaction(async (tx) => {
    await tx.destination.update({ where: { id }, data: { isFeatured } });
    await recordAudit(
      tx,
      adminId,
      isFeatured ? "destination.feature" : "destination.unfeature",
      "destination",
      id,
      `${isFeatured ? "Featured" : "Unfeatured"} "${destination.title}"`,
    );
  });

  return getAdminDestination(id);
};
