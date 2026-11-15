import type { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import type {
  CreateCareerInput,
  ListAdminCareersQuery,
  UpdateCareerInput,
} from "../../schemas/admin/career.schemas.js";
import { AppError, notFound } from "../../utils/errors.js";
import { paginationMeta } from "../../utils/pagination.js";
import { endOfDay, indiaDateOf, toAdminCareer, toLines, todayInIndia } from "../career/careerMapper.js";
import { recordAudit } from "./audit.service.js";

const getRow = async (id: string) => {
  const row = await prisma.jobListing.findUnique({ where: { id } });
  if (!row) throw notFound("Job listing not found");
  return row;
};

export const listAdminCareers = async (query: ListAdminCareersQuery) => {
  const where: Prisma.JobListingWhereInput = {
    ...(query.published !== undefined ? { isPublished: query.published } : {}),
    ...(query.department ? { department: query.department } : {}),
    ...(query.q
      ? { OR: [{ title: { contains: query.q } }, { department: { contains: query.q } }, { location: { contains: query.q } }] }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.jobListing.count({ where }),
    prisma.jobListing.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return { data: rows.map(toAdminCareer), meta: paginationMeta(query.page, query.limit, total) };
};

export const getAdminCareer = async (id: string) => toAdminCareer(await getRow(id));

/** Departments already in use, so the form can suggest them. */
export const listDepartments = async () => {
  const rows = await prisma.jobListing.findMany({ distinct: ["department"], select: { department: true }, orderBy: { department: "asc" } });
  return { data: rows.map((row) => row.department) };
};

/** A listing closed in the past would never be shown, so a date before today is refused. */
const assertNotInPast = (closesAt: string | null | undefined) => {
  if (closesAt && closesAt < todayInIndia()) {
    throw new AppError(422, "Validation failed", "VALIDATION_ERROR", [
      { field: "closesAt", message: "The closing date has already passed. Pick today or a later date." },
    ]);
  }
};

const columns = (input: UpdateCareerInput) => ({
  title: input.title,
  department: input.department,
  location: input.location,
  employmentType: input.employmentType,
  workMode: input.workMode,
  experience: input.experience === undefined ? undefined : input.experience || null,
  salary: input.salary === undefined ? undefined : input.salary || null,
  aboutRole: input.aboutRole,
  responsibilities: input.responsibilities === undefined ? undefined : toLines(input.responsibilities),
  requirements: input.requirements === undefined ? undefined : toLines(input.requirements),
  applyUrl: input.applyUrl,
  closesAt: input.closesAt === undefined ? undefined : input.closesAt === null ? null : endOfDay(input.closesAt),
});

export const createCareer = async (adminId: string, input: CreateCareerInput) => {
  assertNotInPast(input.closesAt);
  const publish = input.isPublished === true;

  const created = await prisma.$transaction(async (tx) => {
    const row = await tx.jobListing.create({
      data: {
        title: input.title,
        department: input.department,
        location: input.location,
        employmentType: input.employmentType ?? "FULL_TIME",
        workMode: input.workMode ?? "ONSITE",
        experience: input.experience || null,
        salary: input.salary || null,
        aboutRole: input.aboutRole,
        responsibilities: toLines(input.responsibilities),
        requirements: toLines(input.requirements),
        applyUrl: input.applyUrl,
        closesAt: input.closesAt ? endOfDay(input.closesAt) : null,
        isPublished: publish,
        publishedAt: publish ? new Date() : null,
      },
    });
    await recordAudit(tx, adminId, "career.create", "career", row.id, `Created job listing "${row.title}"${publish ? " (published)" : " (draft)"}`);
    return row;
  });

  return toAdminCareer(created);
};

export const updateCareer = async (adminId: string, id: string, input: UpdateCareerInput) => {
  const existing = await getRow(id);

  // Saving other changes to an already closed listing is fine; only a newly chosen date is checked.
  const sameDates: (string | null)[] = existing.closesAt
    ? [indiaDateOf(existing.closesAt), existing.closesAt.toISOString().slice(0, 10)]
    : [null];
  if (input.closesAt !== undefined && !sameDates.includes(input.closesAt)) {
    assertNotInPast(input.closesAt);
  }

  const turningOn = input.isPublished === true && !existing.isPublished;
  const turningOff = input.isPublished === false && existing.isPublished;

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.jobListing.update({
      where: { id },
      data: {
        ...columns(input),
        ...(input.isPublished !== undefined ? { isPublished: input.isPublished } : {}),
        // Keep the first publish date when a listing is switched off and on again.
        ...(turningOn ? { publishedAt: existing.publishedAt ?? new Date() } : {}),
      },
    });

    const action = turningOn ? "career.publish" : turningOff ? "career.unpublish" : "career.update";
    const summary = turningOn
      ? `Published job listing "${row.title}"`
      : turningOff
        ? `Unpublished job listing "${row.title}"`
        : `Edited job listing "${row.title}"`;
    await recordAudit(tx, adminId, action, "career", id, summary);
    return row;
  });

  return toAdminCareer(updated);
};

export const deleteCareer = async (adminId: string, id: string) => {
  const existing = await getRow(id);

  await prisma.$transaction(async (tx) => {
    await tx.jobListing.delete({ where: { id } });
    await recordAudit(tx, adminId, "career.delete", "career", id, `Deleted job listing "${existing.title}"`);
  });
};
