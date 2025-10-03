import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create ingredients
  const ingredients = [
    {
      id: "tomato",
      name: "Tomato",
      category: "vegetables",
      kcalPer100g: 18,
      aliases: ["Tomate", "Roma Tomato", "Cherry Tomato"],
    },
    {
      id: "onion",
      name: "Onion",
      category: "vegetables",
      kcalPer100g: 40,
      aliases: ["Yellow Onion", "White Onion", "Red Onion"],
    },
    {
      id: "garlic",
      name: "Garlic",
      category: "vegetables",
      kcalPer100g: 149,
      aliases: ["Garlic Clove", "Fresh Garlic"],
    },
    {
      id: "olive_oil",
      name: "Olive Oil",
      category: "oils",
      kcalPer100g: 884,
      aliases: ["Extra Virgin Olive Oil", "EVOO"],
    },
    {
      id: "pasta_dry",
      name: "Pasta (Dry)",
      category: "grains",
      kcalPer100g: 371,
      aliases: ["Spaghetti", "Penne", "Fettuccine"],
    },
    {
      id: "salt",
      name: "Salt",
      category: "seasonings",
      kcalPer100g: 0,
      aliases: ["Sea Salt", "Kosher Salt", "Table Salt"],
    },
    {
      id: "black_pepper",
      name: "Black Pepper",
      category: "seasonings",
      kcalPer100g: 251,
      aliases: ["Ground Black Pepper", "Peppercorns"],
    },
    {
      id: "basil",
      name: "Basil",
      category: "herbs",
      kcalPer100g: 22,
      aliases: ["Fresh Basil", "Sweet Basil"],
    },
    {
      id: "parmesan",
      name: "Parmesan Cheese",
      category: "dairy",
      kcalPer100g: 431,
      aliases: ["Parmigiano Reggiano", "Grated Parmesan"],
    },
    {
      id: "chicken_breast",
      name: "Chicken Breast",
      category: "meat",
      kcalPer100g: 165,
      aliases: ["Boneless Chicken Breast", "Skinless Chicken Breast"],
    },
  ];

  for (const ingredient of ingredients) {
    await prisma.ingredient.upsert({
      where: { id: ingredient.id },
      update: ingredient,
      create: ingredient,
    });
  }

  console.log(`✅ Created ${ingredients.length} ingredients`);

  // Create a sample user
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
    },
  });

  console.log("✅ Created demo user");

  // Create a sample recipe
  const recipe = await prisma.recipe.upsert({
    where: { slug: "classic-tomato-pasta" },
    update: {},
    create: {
      title: "Classic Tomato Pasta",
      slug: "classic-tomato-pasta",
      summary: "A simple and delicious pasta dish with fresh tomatoes and basil.",
      steps: [
        { order: 1, text: "Bring a large pot of salted water to boil." },
        { order: 2, text: "Add pasta and cook according to package directions until al dente." },
        { order: 3, text: "Meanwhile, heat olive oil in a large pan over medium heat." },
        { order: 4, text: "Add diced tomatoes and cook for 5-7 minutes until softened." },
        { order: 5, text: "Season with salt and pepper to taste." },
        { order: 6, text: "Drain pasta and add to the pan with tomatoes." },
        { order: 7, text: "Toss with fresh basil and grated parmesan cheese." },
        { order: 8, text: "Serve immediately." },
      ],
      prepMinutes: 10,
      cookMinutes: 20,
      servings: 4,
      diets: ["vegetarian"],
      tags: ["quick", "easy", "comfort"],
      authorId: user.id,
      items: {
        create: [
          {
            ingredientId: "pasta_dry",
            qty: 400,
            unit: "g",
          },
          {
            ingredientId: "tomato",
            qty: 4,
            unit: "pieces",
          },
          {
            ingredientId: "olive_oil",
            qty: 3,
            unit: "tbsp",
          },
          {
            ingredientId: "garlic",
            qty: 2,
            unit: "cloves",
          },
          {
            ingredientId: "basil",
            qty: 1,
            unit: "handful",
          },
          {
            ingredientId: "parmesan",
            qty: 50,
            unit: "g",
          },
          {
            ingredientId: "salt",
            qty: 1,
            unit: "tsp",
          },
          {
            ingredientId: "black_pepper",
            qty: 0.5,
            unit: "tsp",
          },
        ],
      },
      nutrition: {
        create: {
          kcal: 450,
          protein: 18,
          carbs: 65,
          fat: 12,
        },
      },
    },
  });

  console.log("✅ Created sample recipe");

  console.log("🎉 Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
