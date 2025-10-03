import { prisma } from "@/lib/db";
import { CreateRecipeInput, UpdateRecipeInput, RecipeSearchInput } from "@/lib/validators";

export async function createRecipe(data: CreateRecipeInput, authorId: string) {
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const recipe = await prisma.recipe.create({
    data: {
      ...data,
      slug,
      authorId,
      nutrition: {
        create: {
          kcal: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        },
      },
      items: {
        create: data.items.map((item) => ({
          ingredientId: item.ingredientId,
          qty: item.qty,
          unit: item.unit,
          notes: item.notes,
        })),
      },
    },
    include: {
      author: true,
      items: {
        include: {
          ingredient: true,
        },
      },
      nutrition: true,
    },
  });

  return recipe;
}

export async function getRecipe(id: string) {
  return await prisma.recipe.findUnique({
    where: { id },
    include: {
      author: true,
      items: {
        include: {
          ingredient: true,
        },
      },
      nutrition: true,
    },
  });
}

export async function getRecipeBySlug(slug: string) {
  return await prisma.recipe.findUnique({
    where: { slug },
    include: {
      author: true,
      items: {
        include: {
          ingredient: true,
        },
      },
      nutrition: true,
    },
  });
}

export async function updateRecipe(id: string, data: UpdateRecipeInput) {
  const updateData: any = { ...data };
  
  if (data.title) {
    updateData.slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  return await prisma.recipe.update({
    where: { id },
    data: updateData,
    include: {
      author: true,
      items: {
        include: {
          ingredient: true,
        },
      },
      nutrition: true,
    },
  });
}

export async function deleteRecipe(id: string) {
  return await prisma.recipe.delete({
    where: { id },
  });
}

export async function searchRecipes(params: RecipeSearchInput) {
  const { q, tags, diet, maxTime, page, limit } = params;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
    ];
  }

  if (tags && tags.length > 0) {
    where.tags = { hasSome: tags };
  }

  if (diet) {
    where.diets = { has: diet };
  }

  if (maxTime) {
    where.OR = [
      ...(where.OR || []),
      {
        AND: [
          { prepMinutes: { not: null } },
          { cookMinutes: { not: null } },
          {
            OR: [
              {
                AND: [
                  { prepMinutes: { lte: maxTime } },
                  { cookMinutes: { lte: maxTime } },
                ],
              },
            ],
          },
        ],
      },
    ];
  }

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      skip,
      take: limit,
      include: {
        author: true,
        nutrition: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.recipe.count({ where }),
  ]);

  return {
    recipes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}
