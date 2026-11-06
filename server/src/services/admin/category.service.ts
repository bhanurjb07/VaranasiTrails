import type { Category } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import { headObject, publicUrl } from "../../lib/r2.js";
import type { CreateCategoryInput, UpdateCategoryInput } from "../../schemas/admin/category.schemas.js";
import { AppError, badRequest, conflict, notFound } from "../../utils/errors.js";
import { uniqueSlug } from "../../utils/slug.js";
import { recordAudit } from "./audit.service.js";
import { deleteUnreferencedObjects } from "./destinationLifecycle.service.js";
import { MAX_IMAGE_BYTES, isImageType, isUploadKey } from "./mediaRules.js";

const toDto = (category: Category, destinationCount: number) => ({
  id: category.id,
  slug: category.slug,
  name: category.name,
  description: category.description,
  imageKey: category.imageKey,
  imageUrl: category.imageKey ? publicUrl(category.imageKey) : null,
  sortOrder: category.sortOrder,
  isActive: category.isActive,
  destinationCount,
  createdAt: category.createdAt,
});

const invalidImage = (message: string) =>
  new AppError(422, "Validation failed", "VALIDATION_ERROR", [{ field: "imageKey", message }]);

/** A category image must be a file the server signed for a category and that really exists. */
const verifyImageKey = async (key: string) => {
  if (!isUploadKey(key, "categories")) throw invalidImage("That is not an uploaded category image");

  const object = await headObject(key);
  if (!object) throw badRequest("The file was not found in storage. Upload it first.", "UPLOAD_MISSING");
  if (!isImageType(object.contentType)) throw invalidImage("The uploaded file is not an allowed image type");
  if (object.contentLength > MAX_IMAGE_BYTES) throw invalidImage("Images can be at most 10 MB");
};

const getCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { destinations: true } } },
  });
  if (!category) throw notFound("Category not found");
  return category;
};

export const listCategories = async () => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { destinations: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return { data: categories.map((category) => toDto(category, category._count.destinations)) };
};

export const createCategory = async (adminId: string, input: CreateCategoryInput) => {
  const slug = await uniqueSlug(input.name, async (candidate) =>
    (await prisma.category.count({ where: { slug: candidate } })) > 0,
  );
  if (input.imageKey) await verifyImageKey(input.imageKey);
  const last = await prisma.category.aggregate({ _max: { sortOrder: true } });

  const category = await prisma.$transaction(async (tx) => {
    const created = await tx.category.create({
      data: {
        slug,
        name: input.name,
        description: input.description ?? null,
        imageKey: input.imageKey ?? null,
        isActive: input.isActive ?? true,
        sortOrder: (last._max.sortOrder ?? -1) + 1,
      },
    });
    await recordAudit(tx, adminId, "category.create", "category", created.id, `Created category "${created.name}"`);
    return created;
  });

  return toDto(category, 0);
};

export const updateCategory = async (adminId: string, id: string, input: UpdateCategoryInput) => {
  const existing = await getCategory(id);
  if (input.imageKey && input.imageKey !== existing.imageKey) await verifyImageKey(input.imageKey);

  const updated = await prisma.$transaction(async (tx) => {
    const category = await tx.category.update({
      where: { id },
      // The slug stays stable when a category is renamed, so public links keep working.
      data: {
        name: input.name,
        description: input.description,
        imageKey: input.imageKey,
        isActive: input.isActive,
      },
    });
    const changed = Object.keys(input).join(", ");
    await recordAudit(tx, adminId, "category.update", "category", id, `Updated category "${category.name}" (${changed})`);
    return category;
  });

  // The previous image is no longer used: remove the file from storage.
  if (input.imageKey !== undefined && existing.imageKey && existing.imageKey !== updated.imageKey) {
    await deleteUnreferencedObjects([existing.imageKey]);
  }

  return toDto(updated, existing._count.destinations);
};

export const deleteCategory = async (adminId: string, id: string) => {
  const category = await getCategory(id);

  if (category._count.destinations > 0) {
    throw new AppError(
      409,
      `This category has ${category._count.destinations} destination(s). Move them to another category, or deactivate the category instead.`,
      "CATEGORY_IN_USE",
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.category.delete({ where: { id } });
    await recordAudit(tx, adminId, "category.delete", "category", id, `Deleted category "${category.name}"`);
  });

  if (category.imageKey) await deleteUnreferencedObjects([category.imageKey]);
};

/** `ids` must be every category, in the new order. */
export const reorderCategories = async (adminId: string, ids: string[]) => {
  const existing = await prisma.category.findMany({ select: { id: true } });
  const known = new Set(existing.map((category) => category.id));

  if (ids.length !== known.size || ids.some((id) => !known.has(id))) {
    throw conflict("Send every category id exactly once to reorder", "REORDER_MISMATCH");
  }

  await prisma.$transaction(async (tx) => {
    for (const [index, id] of ids.entries()) {
      await tx.category.update({ where: { id }, data: { sortOrder: index } });
    }
    await recordAudit(tx, adminId, "category.reorder", "category", null, `Reordered ${ids.length} categories`);
  });

  return listCategories();
};
