import { prisma } from "../../lib/prisma.js";
import { notFound } from "../../utils/errors.js";
import { toPublicCareer } from "./careerMapper.js";

/** Published listings whose closing date has not passed. */
const openWhere = () => ({
  isPublished: true,
  OR: [{ closesAt: null }, { closesAt: { gt: new Date() } }],
});

/** Every open position, grouped by department on the page. An empty list is a normal answer. */
export const listCareers = async () => {
  const rows = await prisma.jobListing.findMany({
    where: openWhere(),
    orderBy: [{ department: "asc" }, { publishedAt: "desc" }, { id: "asc" }],
  });

  return { data: rows.map(toPublicCareer) };
};

export const getCareer = async (id: string) => {
  const row = await prisma.jobListing.findFirst({ where: { id, ...openWhere() } });
  if (!row) throw notFound("This position is no longer open");

  return { career: toPublicCareer(row) };
};
