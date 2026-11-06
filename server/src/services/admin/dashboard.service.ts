import { prisma } from "../../lib/prisma.js";
import { checkReadiness } from "./destinationMapper.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const DAYS = 30;

const dayKey = (date: Date) => date.toISOString().slice(0, 10);

/** One bucket per UTC day for the last 30 days (today included), zeros filled in. */
const enquiriesPerDay = async () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const since = new Date(today.getTime() - (DAYS - 1) * DAY_MS);

  const rows = await prisma.enquiry.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } });
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(dayKey(row.createdAt), (counts.get(dayKey(row.createdAt)) ?? 0) + 1);

  return Array.from({ length: DAYS }, (_, index) => {
    const key = dayKey(new Date(since.getTime() + index * DAY_MS));
    return { date: key, count: counts.get(key) ?? 0 };
  });
};

const needsAttention = async () => {
  const destinations = await prisma.destination.findMany({
    where: { deletedAt: null },
    include: {
      images: { select: { isCover: true } },
      highlights: { select: { id: true } },
      itinerary: { select: { id: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return destinations
    .map((d) => ({
      id: d.id,
      title: d.title,
      status: d.isPublished ? ("published" as const) : ("draft" as const),
      issues: checkReadiness(d).map((error) => error.message),
    }))
    .filter((item) => item.issues.length > 0)
    // Live trips with problems first, then the most recently edited drafts.
    .sort((a, b) => Number(b.status === "published") - Number(a.status === "published"))
    .slice(0, 8);
};

export const getDashboard = async () => {
  const since = new Date(Date.now() - DAYS * DAY_MS);

  const [
    published,
    draft,
    archived,
    totalUsers,
    verifiedUsers,
    blockedUsers,
    newUsers,
    enquiryGroups,
    latestEnquiries,
    topWishlisted,
    perDay,
    attention,
  ] = await Promise.all([
    prisma.destination.count({ where: { deletedAt: null, isPublished: true } }),
    prisma.destination.count({ where: { deletedAt: null, isPublished: false } }),
    prisma.destination.count({ where: { deletedAt: { not: null } } }),
    prisma.user.count(),
    prisma.user.count({ where: { emailVerifiedAt: { not: null } } }),
    prisma.user.count({ where: { isBlocked: true } }),
    prisma.user.count({ where: { createdAt: { gte: since } } }),
    prisma.enquiry.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.enquiry.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      take: 5,
      include: { destination: { select: { title: true } } },
    }),
    prisma.destination.findMany({
      where: { deletedAt: null, wishlisted: { some: {} } },
      orderBy: [{ wishlisted: { _count: "desc" } }, { id: "asc" }],
      take: 5,
      select: { id: true, title: true, slug: true, _count: { select: { wishlisted: true } } },
    }),
    enquiriesPerDay(),
    needsAttention(),
  ]);

  const enquiries = { NEW: 0, CONTACTED: 0, CLOSED: 0 };
  for (const group of enquiryGroups) enquiries[group.status] = group._count._all;

  return {
    destinations: { published, draft, archived, total: published + draft },
    users: { total: totalUsers, verified: verifiedUsers, blocked: blockedUsers, newLast30Days: newUsers },
    enquiries: { ...enquiries, total: enquiries.NEW + enquiries.CONTACTED + enquiries.CLOSED },
    enquiriesPerDay: perDay,
    latestEnquiries: latestEnquiries.map((row) => ({
      id: row.id,
      name: row.name,
      status: row.status,
      destinationTitle: row.destination?.title ?? null,
      createdAt: row.createdAt,
    })),
    topWishlisted: topWishlisted.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      wishlistCount: row._count.wishlisted,
    })),
    needsAttention: attention,
  };
};
