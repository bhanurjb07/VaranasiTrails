import { prisma } from "../../lib/prisma.js";
import { notFound } from "../../utils/errors.js";
import { cardInclude, toCard } from "../destination/destination.service.js";

export const listWishlist = async (userId: string) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId, destination: { isPublished: true } },
    include: { destination: { include: cardInclude } },
    orderBy: { createdAt: "desc" },
  });

  return { data: items.map((item) => ({ ...toCard(item.destination), addedAt: item.createdAt })) };
};

export const addToWishlist = async (userId: string, destinationId: string) => {
  const destination = await prisma.destination.findFirst({
    where: { id: destinationId, isPublished: true },
    select: { id: true },
  });
  if (!destination) throw notFound("Destination not found");

  // Idempotent: PUT twice leaves exactly one row.
  await prisma.wishlistItem.upsert({
    where: { userId_destinationId: { userId, destinationId } },
    create: { userId, destinationId },
    update: {},
  });
};

export const removeFromWishlist = async (userId: string, destinationId: string) => {
  await prisma.wishlistItem.deleteMany({ where: { userId, destinationId } });
};
