import type { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma.js";
import type { ListAuditQuery } from "../../schemas/admin/audit.schemas.js";
import { paginationMeta } from "../../utils/pagination.js";

type Db = Prisma.TransactionClient | typeof prisma;

/**
 * Writes one audit row. Pass the transaction client so the entry commits (or rolls
 * back) together with the change it describes. The summary is short human text; never
 * put passwords, tokens or full request bodies in it.
 */
export const recordAudit = (
  db: Db,
  adminId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  summary: string,
) =>
  db.auditLog.create({
    data: { adminId, action, entityType, entityId, summary: summary.slice(0, 300) },
  });

export const listAuditLog = async (query: ListAuditQuery) => {
  const where: Prisma.AuditLogWhereInput = {
    ...(query.entityType ? { entityType: query.entityType } : {}),
    ...(query.entityId ? { entityId: query.entityId } : {}),
    ...(query.adminId ? { adminId: query.adminId } : {}),
    ...(query.action ? { action: { startsWith: query.action } } : {}),
    ...(query.q ? { summary: { contains: query.q } } : {}),
    ...(query.from || query.to ? { createdAt: { gte: query.from, lte: query.to } } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: { admin: { select: { id: true, name: true, email: true } } },
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  return {
    data: rows.map((row) => ({
      id: row.id,
      action: row.action,
      entityType: row.entityType,
      entityId: row.entityId,
      summary: row.summary,
      createdAt: row.createdAt,
      admin: row.admin,
    })),
    meta: paginationMeta(query.page, query.limit, total),
  };
};
