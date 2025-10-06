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

  // Create more sample recipes
  const recipe2 = await prisma.recipe.upsert({
    where: { slug: "grilled-chicken-salad" },
    update: {},
    create: {
      title: "Grilled Chicken Salad",
      slug: "grilled-chicken-salad",
      summary: "A healthy and protein-rich salad with grilled chicken breast.",
      steps: [
        { order: 1, text: "Season chicken breast with salt and pepper." },
        { order: 2, text: "Grill chicken for 6-8 minutes per side until fully cooked." },
        { order: 3, text: "Let the chicken rest for 5 minutes, then slice." },
        { order: 4, text: "Arrange fresh greens on a plate." },
        { order: 5, text: "Top with sliced chicken and your favorite dressing." },
      ],
      prepMinutes: 15,
      cookMinutes: 15,
      servings: 2,
      diets: ["high_protein", "low_carb"],
      tags: ["healthy", "quick", "lunch"],
      authorId: user.id,
      items: {
        create: [
          {
            ingredientId: "chicken_breast",
            qty: 300,
            unit: "g",
          },
          {
            ingredientId: "olive_oil",
            qty: 2,
            unit: "tbsp",
          },
          {
            ingredientId: "salt",
            qty: 0.5,
            unit: "tsp",
          },
          {
            ingredientId: "black_pepper",
            qty: 0.25,
            unit: "tsp",
          },
        ],
      },
      nutrition: {
        create: {
          kcal: 320,
          protein: 42,
          carbs: 8,
          fat: 14,
        },
      },
    },
  });

  const recipe3 = await prisma.recipe.upsert({
    where: { slug: "garlic-bread" },
    update: {},
    create: {
      title: "Classic Garlic Bread",
      slug: "garlic-bread",
      summary: "Crispy, buttery garlic bread perfect as a side dish.",
      steps: [
        { order: 1, text: "Preheat oven to 180°C (350°F)." },
        { order: 2, text: "Mix softened butter with minced garlic." },
        { order: 3, text: "Spread garlic butter on bread slices." },
        { order: 4, text: "Bake for 10-12 minutes until golden and crispy." },
        { order: 5, text: "Sprinkle with fresh parsley and serve warm." },
      ],
      prepMinutes: 5,
      cookMinutes: 12,
      servings: 4,
      diets: ["vegetarian"],
      tags: ["side", "quick", "comfort"],
      authorId: user.id,
      items: {
        create: [
          {
            ingredientId: "garlic",
            qty: 4,
            unit: "cloves",
          },
          {
            ingredientId: "basil",
            qty: 2,
            unit: "tbsp",
          },
        ],
      },
      nutrition: {
        create: {
          kcal: 220,
          protein: 4,
          carbs: 28,
          fat: 10,
        },
      },
    },
  });

  console.log("✅ Created additional sample recipes");

  // Create sample shopping lists
  const list1 = await prisma.shoppingList.upsert({
    where: { id: "sample-list-1" },
    update: {},
    create: {
      id: "sample-list-1",
      name: "Weekly Groceries",
      userId: user.id,
      items: {
        create: [
          {
            ingredientId: "tomato",
            qty: 6,
            unit: "pieces",
            checked: false,
          },
          {
            ingredientId: "onion",
            qty: 3,
            unit: "pieces",
            checked: true,
          },
          {
            ingredientId: "chicken_breast",
            qty: 500,
            unit: "g",
            checked: false,
          },
          {
            ingredientId: "olive_oil",
            qty: 1,
            unit: "bottle",
            checked: false,
          },
        ],
      },
    },
  });

  const list2 = await prisma.shoppingList.upsert({
    where: { id: "sample-list-2" },
    update: {},
    create: {
      id: "sample-list-2",
      name: "Pasta Night",
      userId: user.id,
      items: {
        create: [
          {
            ingredientId: "pasta_dry",
            qty: 500,
            unit: "g",
            checked: true,
          },
          {
            ingredientId: "parmesan",
            qty: 100,
            unit: "g",
            checked: true,
          },
          {
            ingredientId: "basil",
            qty: 1,
            unit: "bunch",
            checked: false,
          },
        ],
      },
    },
  });

  console.log("✅ Created sample shopping lists");

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
