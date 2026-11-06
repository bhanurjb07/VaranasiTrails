import type { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import type {
  ExportEnquiriesQuery,
  ListEnquiriesQuery,
  UpdateEnquiryInput,
} from "../../schemas/admin/enquiry.schemas.js";
import { toCsv } from "../../utils/csv.js";
import { notFound } from "../../utils/errors.js";
import { paginationMeta } from "../../utils/pagination.js";
import { recordAudit } from "./audit.service.js";

const include = { destination: { select: { id: true, title: true, slug: true } } } satisfies Prisma.EnquiryInclude;
type EnquiryRow = Prisma.EnquiryGetPayload<{ include: typeof include }>;

const toDto = (row: EnquiryRow) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  message: row.message,
  status: row.status,
  adminNotes: row.adminNotes,
  destination: row.destination,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const buildWhere = (query: ExportEnquiriesQuery): Prisma.EnquiryWhereInput => ({
  ...(query.status ? { status: query.status } : {}),
  ...(query.destinationId ? { destinationId: query.destinationId } : {}),
  ...(query.from || query.to ? { createdAt: { gte: query.from, lte: query.to } } : {}),
  ...(query.q
    ? {
        OR: [
          { name: { contains: query.q } },
          { email: { contains: query.q } },
          { phone: { contains: query.q } },
          { message: { contains: query.q } },
        ],
      }
    : {}),
});

export const listEnquiries = async (query: ListEnquiriesQuery) => {
  const where = buildWhere(query);

  const [total, rows, counts] = await Promise.all([
    prisma.enquiry.count({ where }),
    prisma.enquiry.findMany({
      where,
      include,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.enquiry.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const byStatus = { NEW: 0, CONTACTED: 0, CLOSED: 0 };
  for (const group of counts) byStatus[group.status] = group._count._all;

  return { data: rows.map(toDto), meta: paginationMeta(query.page, query.limit, total), counts: byStatus };
};

const getRow = async (id: string) => {
  const row = await prisma.enquiry.findUnique({ where: { id }, include });
  if (!row) throw notFound("Enquiry not found");
  return row;
};

export const getEnquiry = async (id: string) => toDto(await getRow(id));

export const updateEnquiry = async (adminId: string, id: string, input: UpdateEnquiryInput) => {
  const existing = await getRow(id);

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.enquiry.update({
      where: { id },
      data: { status: input.status, adminNotes: input.adminNotes },
      include,
    });
    const what = [input.status ? `status ${existing.status} to ${input.status}` : "", input.adminNotes !== undefined ? "notes" : ""]
      .filter(Boolean)
      .join(", ");
    await recordAudit(tx, adminId, "enquiry.update", "enquiry", id, `Updated enquiry from ${existing.name} (${what})`);
    return row;
  });

  return toDto(updated);
};

export const deleteEnquiry = async (adminId: string, id: string) => {
  const existing = await getRow(id);

  await prisma.$transaction(async (tx) => {
    await tx.enquiry.delete({ where: { id } });
    await recordAudit(tx, adminId, "enquiry.delete", "enquiry", id, `Deleted enquiry from ${existing.name}`);
  });
};

const EXPORT_LIMIT = 10_000;

/** CSV of the filtered enquiries (newest first). Formula-looking cells are neutralised. */
export const exportEnquiriesCsv = async (adminId: string, query: ExportEnquiriesQuery) => {
  const rows = await prisma.enquiry.findMany({
    where: buildWhere(query),
    include,
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    take: EXPORT_LIMIT,
  });

  await recordAudit(prisma, adminId, "enquiry.export", "enquiry", null, `Exported ${rows.length} enquiries to CSV`);

  return toCsv(
    ["Received", "Name", "Email", "Phone", "Status", "Destination", "Message", "Admin notes"],
    rows.map((row) => [
      row.createdAt,
      row.name,
      row.email,
      row.phone,
      row.status,
      row.destination?.title ?? "",
      row.message,
      row.adminNotes ?? "",
    ]),
  );
};
