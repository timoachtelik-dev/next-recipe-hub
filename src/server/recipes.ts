import { prisma } from "@/lib/db";
import { CreateRecipeInput, UpdateRecipeInput, RecipeSearchInput } from "@/lib/validators";
import { calculateAndSaveRecipeNutrition } from "./nutrition";
import { LimitError, MAX_RECIPES_PER_USER } from "@/lib/limits";

const AUTO_NUTRITION_TAGS = new Set([
  "low sugar",
  "low-sugar",
  "low carb",
  "low-carb",
  "high protein",
  "high-protein",
  "keto friendly",
  "keto-friendly",
  "high fiber",
  "high-fiber",
  "gluten free",
  "gluten-free",
]);

function sanitizeTags(tags: string[] | undefined) {
  if (!tags) return tags;
  return tags.filter(tag => !AUTO_NUTRITION_TAGS.has(tag.toLowerCase()));
}

function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "recipe";
}

async function generateUniqueSlug(title: string, excludeRecipeId?: string) {
  const baseSlug = slugifyTitle(title);
  let candidate = baseSlug;
  let suffix = 2;

  while (
    await prisma.recipe.findFirst({
      where: {
        slug: candidate,
        ...(excludeRecipeId ? { NOT: { id: excludeRecipeId } } : {}),
      },
      select: { id: true },
    })
  ) {
    candidate = `${baseSlug}-${suffix++}`;
  }

  return candidate;
}

export async function createRecipe(data: CreateRecipeInput, authorId: string) {
  const recipeCount = await prisma.recipe.count({
    where: { authorId },
  });

  if (recipeCount >= MAX_RECIPES_PER_USER) {
    throw new LimitError(`Recipe limit reached (${MAX_RECIPES_PER_USER}).`);
  }

  const slug = await generateUniqueSlug(data.title);
  const sanitizedTags = sanitizeTags(data.tags);

  const recipe = await prisma.recipe.create({
    data: {
      ...data,
      ...(sanitizedTags ? { tags: sanitizedTags } : {}),
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
          unitId: item.unitId,
          notes: item.notes,
        })),
      },
    },
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
      items: {
        include: {
          ingredient: true,
          unit: true,
        },
      },
      nutrition: true,
    },
  });

  // Auto-calculate nutrition from ingredients
  await calculateAndSaveRecipeNutrition(recipe.id);

  // Fetch the updated recipe with calculated nutrition
  const updatedRecipe = await prisma.recipe.findUnique({
    where: { id: recipe.id },
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
      items: {
        include: {
          ingredient: true,
          unit: true,
        },
      },
      nutrition: true,
    },
  });

  return updatedRecipe || recipe;
}

export async function getRecipe(id: string) {
  return await prisma.recipe.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
      items: {
        include: {
          ingredient: true,
          unit: true,
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
      author: {
        select: { id: true, name: true, image: true },
      },
      items: {
        include: {
          ingredient: true,
          unit: true,
        },
      },
      nutrition: true,
    },
  });
}

export async function updateRecipe(id: string, data: UpdateRecipeInput) {
  const { items, ...recipeData } = data;
  if (recipeData.tags) {
    recipeData.tags = sanitizeTags(recipeData.tags);
  }

  const updateData: Record<string, unknown> = Object.fromEntries(
    Object.entries(recipeData).filter(([, value]) => value !== undefined)
  );

  if (typeof recipeData.title === "string" && recipeData.title.trim()) {
    updateData.slug = await generateUniqueSlug(recipeData.title, id);
  }

  const recipe = await prisma.recipe.update({
    where: { id },
    data: {
      ...updateData,
      ...(items
        ? {
            items: {
              deleteMany: {},
              create: items.map((item) => ({
                ingredientId: item.ingredientId,
                qty: item.qty,
                unitId: item.unitId,
                notes: item.notes,
              })),
            },
          }
        : {}),
    },
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
      items: {
        include: {
          ingredient: true,
          unit: true,
        },
      },
      nutrition: true,
    },
  });

  if (items || typeof recipeData.servings !== "undefined") {
    await calculateAndSaveRecipeNutrition(id);
  }

  const updatedRecipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
      items: {
        include: {
          ingredient: true,
          unit: true,
        },
      },
      nutrition: true,
    },
  });

  return updatedRecipe || recipe;
}

export async function deleteRecipe(id: string) {
  // Delete related records first to avoid foreign key constraints
  await prisma.recipeItem.deleteMany({
    where: { recipeId: id },
  });
  
  await prisma.nutrition.deleteMany({
    where: { recipeId: id },
  });
  
  return await prisma.recipe.delete({
    where: { id },
  });
}

export async function searchRecipes(params: RecipeSearchInput) {
  const { q, tags, diet, maxTime, minServings, maxServings, maxCalories, page, limit } = params;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  const andConditions: Record<string, unknown>[] = [];

  // Search query - use OR for title/summary/tags
  if (q) {
    andConditions.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
      ],
    });
  }

  // Filter by tags
  if (tags && tags.length > 0) {
    andConditions.push({ tags: { hasSome: tags } });
  }

  // Filter by diet
  if (diet) {
    andConditions.push({ diets: { has: diet } });
  }

  // Filter by max cooking time (prep + cook)
  if (maxTime && maxTime > 0) {
    andConditions.push({
      OR: [
        {
          AND: [
            { prepMinutes: { lte: maxTime } },
            { cookMinutes: { lte: maxTime } },
          ],
        },
        { prepMinutes: null },
        { cookMinutes: null },
      ],
    });
  }

  // Filter by servings
  if (minServings && minServings > 0) {
    andConditions.push({ servings: { gte: minServings } });
  }

  if (maxServings && maxServings > 0) {
    andConditions.push({ servings: { lte: maxServings } });
  }

  // Filter by max calories
  if (maxCalories && maxCalories > 0) {
    andConditions.push({
      nutrition: {
        kcal: { lte: maxCalories },
      },
    });
  }

  // Combine all conditions with AND logic
  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      skip,
      take: limit,
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        items: {
          include: {
            ingredient: true,
          },
        },
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

export async function getUserRecipes(userId: string, limit: number = 6) {
  return await prisma.recipe.findMany({
    where: { authorId: userId },
    take: limit,
    include: {
      author: {
        select: { id: true, name: true, image: true },
      },
      items: {
        include: {
          ingredient: true,
          unit: true,
        },
      },
      nutrition: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecipeStats(userId: string) {
  const totalRecipes = await prisma.recipe.count({
    where: { authorId: userId },
  });

  return {
    totalRecipes,
  };
}
