import { prisma } from "@/lib/db";

export async function searchIngredients(query: string) {
  return await prisma.ingredient.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { aliases: { hasSome: [query] } },
      ],
    },
    take: 10,
    orderBy: { name: "asc" },
  });
}

export async function getIngredient(id: string) {
  return await prisma.ingredient.findUnique({
    where: { id },
  });
}

export async function createIngredient(data: {
  id: string;
  name: string;
  category?: string;
  kcalPer100g?: number;
  macros?: Record<string, unknown>;
  aliases?: string[];
}) {
  return await prisma.ingredient.create({
    data,
  });
}
