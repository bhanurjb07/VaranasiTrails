import type { JobListing } from "@prisma/client";

/** Lists are stored one item per line in a single column. */
export const toLines = (items: readonly string[] | undefined): string => (items ?? []).join("\n");

export const fromLines = (value: string): string[] =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** "2026-12-31" means the whole day: applications stay open until the end of it in India (IST). */
export const endOfDay = (date: string): Date => new Date(`${date}T23:59:59.999+05:30`);

/** Today's date in India as YYYY-MM-DD. */
export const todayInIndia = (now = new Date()): string => new Date(now.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);

/** The India calendar date a stored closing time belongs to, as YYYY-MM-DD. */
export const indiaDateOf = (value: Date): string => new Date(value.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);

export const isOpen = (listing: Pick<JobListing, "isPublished" | "closesAt">, now = new Date()): boolean =>
  listing.isPublished && (listing.closesAt === null || listing.closesAt.getTime() > now.getTime());

/** What visitors see. Drafts and closed listings never reach this mapper. */
export const toPublicCareer = (listing: JobListing) => ({
  id: listing.id,
  title: listing.title,
  department: listing.department,
  location: listing.location,
  employmentType: listing.employmentType,
  workMode: listing.workMode,
  experience: listing.experience,
  salary: listing.salary,
  aboutRole: listing.aboutRole,
  responsibilities: fromLines(listing.responsibilities),
  requirements: fromLines(listing.requirements),
  applyUrl: listing.applyUrl,
  closesAt: listing.closesAt,
  publishedAt: listing.publishedAt,
});

/** What the admin panel sees: everything, plus the state of the listing. */
export const toAdminCareer = (listing: JobListing) => ({
  ...toPublicCareer(listing),
  isPublished: listing.isPublished,
  status: !listing.isPublished ? ("draft" as const) : isOpen(listing) ? ("live" as const) : ("closed" as const),
  createdAt: listing.createdAt,
  updatedAt: listing.updatedAt,
});
