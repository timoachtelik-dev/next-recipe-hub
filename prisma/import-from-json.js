const { PrismaClient } = require("@prisma/client");
const { existsSync, readFileSync } = require("fs");

const prisma = new PrismaClient();

async function main() {
  const datasetPath = "prisma/recipe-dataset.json";
  if (!existsSync(datasetPath)) {
    throw new Error(
      `Unable to find recipe dataset at ${datasetPath}. Ensure the final dataset is checked in.`,
    );
  }

  const dataset = JSON.parse(readFileSync(datasetPath, "utf-8"));
  const ingredients = dataset.ingredients ?? [];
  const recipes = dataset.recipes ?? [];

  const seedUserEmail = (process.env.SEED_USER_EMAIL || "demo@example.com").trim();
  const seedUserName = (process.env.SEED_USER_NAME || "Demo User").trim();

  const demoUser = await prisma.user.upsert({
    where: { email: seedUserEmail },
    update: {},
    create: {
      email: seedUserEmail,
      name: seedUserName,
    },
  });

  await prisma.recipeItem.deleteMany();
  await prisma.nutrition.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.unit.deleteMany();

  const uniqueUnits = new Set();
  ingredients.forEach((ing) => ing.defaultUnitId && uniqueUnits.add(ing.defaultUnitId));
  recipes.forEach((recipe) => {
    recipe.items?.forEach((item) => item.unitId && uniqueUnits.add(item.unitId));
  });

  const unitCategories = {
    cup: "volume",
    tbsp: "volume",
    tsp: "volume",
    ml: "volume",
    l: "volume",
    g: "weight",
    kg: "weight",
    oz: "weight",
    lb: "weight",
    piece: "count",
    pieces: "count",
    clove: "count",
    cloves: "count",
    slice: "count",
    handful: "count",
    bunch: "count",
    pinch: "count",
    "to taste": "special",
    "as needed": "special",
  };

  for (const unitId of uniqueUnits) {
    const category = unitCategories[unitId] || "other";
    await prisma.unit.upsert({
      where: { id: unitId },
      update: {},
      create: { id: unitId, label: unitId, category },
    });
  }

  for (const ing of ingredients) {
    await prisma.ingredient.upsert({
      where: { id: ing.id },
      update: {
        name: ing.name,
        defaultUnitId: ing.defaultUnitId,
        aliases: ing.aliases ?? [],
        kcalPer100g: ing.kcalPer100g ?? null,
        macros: ing.macros ?? null,
        nutritionPer100g: ing.nutritionPer100g ?? null,
      },
      create: {
        id: ing.id,
        name: ing.name,
        defaultUnitId: ing.defaultUnitId,
        aliases: ing.aliases ?? [],
        kcalPer100g: ing.kcalPer100g ?? null,
        macros: ing.macros ?? null,
        nutritionPer100g: ing.nutritionPer100g ?? null,
      },
    });
  }

  for (const recipe of recipes) {
    await prisma.recipe.create({
      data: {
        title: recipe.title,
        slug: recipe.slug,
        summary: recipe.summary ?? null,
        steps: recipe.steps ?? [],
        heroImage: recipe.heroImage ?? null,
        prepMinutes: recipe.prepMinutes ?? null,
        cookMinutes: recipe.cookMinutes ?? null,
        servings: recipe.servings ?? 0,
        diets: recipe.diets ?? [],
        tags: recipe.tags ?? [],
        authorId: demoUser.id,
        items: {
          create: (recipe.items ?? []).map((ing) => ({
            ingredientId: ing.ingredientId,
            qty: ing.qty,
            unitId: ing.unitId,
            notes: ing.notes ?? null,
          })),
        },
        nutrition: recipe.nutrition
          ? {
              create: {
                kcal: recipe.nutrition.kcal,
                protein: recipe.nutrition.protein,
                carbs: recipe.nutrition.carbs,
                fat: recipe.nutrition.fat,
                fiber: recipe.nutrition.fiber,
                sugar: recipe.nutrition.sugar,
                saturatedFat: recipe.nutrition.saturatedFat,
              },
            }
          : undefined,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
