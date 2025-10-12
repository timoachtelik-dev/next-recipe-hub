import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create ingredients
  const ingredients = [
    // Vegetables
    {
      id: "tomato",
      name: "Tomato",
      category: "vegetables",
      kcalPer100g: 18,
      aliases: ["Tomate", "Roma Tomato", "Cherry Tomato", "Plum Tomato"],
    },
    {
      id: "onion",
      name: "Onion",
      category: "vegetables",
      kcalPer100g: 40,
      aliases: ["Yellow Onion", "White Onion", "Red Onion", "Sweet Onion"],
    },
    {
      id: "garlic",
      name: "Garlic",
      category: "vegetables",
      kcalPer100g: 149,
      aliases: ["Garlic Clove", "Fresh Garlic", "Garlic Bulb"],
    },
    {
      id: "carrot",
      name: "Carrot",
      category: "vegetables",
      kcalPer100g: 41,
      aliases: ["Carrots", "Baby Carrots", "Organic Carrot"],
    },
    {
      id: "celery",
      name: "Celery",
      category: "vegetables",
      kcalPer100g: 16,
      aliases: ["Celery Stalk", "Celery Ribs", "Celery Heart"],
    },
    {
      id: "bell_pepper",
      name: "Bell Pepper",
      category: "vegetables",
      kcalPer100g: 31,
      aliases: ["Red Bell Pepper", "Green Bell Pepper", "Yellow Bell Pepper", "Sweet Pepper"],
    },
    {
      id: "spinach",
      name: "Spinach",
      category: "vegetables",
      kcalPer100g: 23,
      aliases: ["Baby Spinach", "Fresh Spinach", "Leaf Spinach"],
    },
    {
      id: "lettuce",
      name: "Lettuce",
      category: "vegetables",
      kcalPer100g: 15,
      aliases: ["Romaine Lettuce", "Iceberg Lettuce", "Mixed Greens"],
    },
    {
      id: "cucumber",
      name: "Cucumber",
      category: "vegetables",
      kcalPer100g: 16,
      aliases: ["English Cucumber", "Persian Cucumber", "Pickling Cucumber"],
    },
    {
      id: "mushroom",
      name: "Mushroom",
      category: "vegetables",
      kcalPer100g: 22,
      aliases: ["Button Mushrooms", "Cremini Mushrooms", "Portobello", "Shiitake"],
    },
    {
      id: "potato",
      name: "Potato",
      category: "vegetables",
      kcalPer100g: 77,
      aliases: ["Russet Potato", "Yukon Gold Potato", "Red Potato", "Sweet Potato"],
    },
    {
      id: "broccoli",
      name: "Broccoli",
      category: "vegetables",
      kcalPer100g: 34,
      aliases: ["Broccoli Florets", "Broccoli Crown"],
    },
    {
      id: "zucchini",
      name: "Zucchini",
      category: "vegetables",
      kcalPer100g: 17,
      aliases: ["Courgette", "Summer Squash"],
    },
    {
      id: "eggplant",
      name: "Eggplant",
      category: "vegetables",
      kcalPer100g: 25,
      aliases: ["Aubergine", "Japanese Eggplant"],
    },

    // Fruits
    {
      id: "lemon",
      name: "Lemon",
      category: "fruits",
      kcalPer100g: 29,
      aliases: ["Fresh Lemon", "Lemon Juice", "Lemon Zest"],
    },
    {
      id: "lime",
      name: "Lime",
      category: "fruits",
      kcalPer100g: 30,
      aliases: ["Fresh Lime", "Lime Juice", "Lime Zest"],
    },
    {
      id: "apple",
      name: "Apple",
      category: "fruits",
      kcalPer100g: 52,
      aliases: ["Granny Smith Apple", "Honeycrisp Apple", "Red Apple"],
    },
    {
      id: "banana",
      name: "Banana",
      category: "fruits",
      kcalPer100g: 89,
      aliases: ["Ripe Banana", "Green Banana"],
    },
    {
      id: "avocado",
      name: "Avocado",
      category: "fruits",
      kcalPer100g: 160,
      aliases: ["Hass Avocado", "Ripe Avocado"],
    },

    // Proteins
    {
      id: "chicken_breast",
      name: "Chicken Breast",
      category: "meat",
      kcalPer100g: 165,
      aliases: ["Boneless Chicken Breast", "Skinless Chicken Breast", "Chicken Fillet"],
    },
    {
      id: "ground_beef",
      name: "Ground Beef",
      category: "meat",
      kcalPer100g: 250,
      aliases: ["Beef Mince", "Hamburger Meat", "Lean Ground Beef"],
    },
    {
      id: "salmon",
      name: "Salmon",
      category: "seafood",
      kcalPer100g: 208,
      aliases: ["Atlantic Salmon", "Wild Salmon", "Salmon Fillet"],
    },
    {
      id: "shrimp",
      name: "Shrimp",
      category: "seafood",
      kcalPer100g: 99,
      aliases: ["Prawns", "Large Shrimp", "Medium Shrimp"],
    },
    {
      id: "eggs",
      name: "Eggs",
      category: "dairy",
      kcalPer100g: 155,
      aliases: ["Large Eggs", "Fresh Eggs", "Organic Eggs"],
    },
    {
      id: "tofu",
      name: "Tofu",
      category: "protein",
      kcalPer100g: 76,
      aliases: ["Firm Tofu", "Silken Tofu", "Extra Firm Tofu"],
    },

    // Dairy & Cheese
    {
      id: "parmesan",
      name: "Parmesan Cheese",
      category: "dairy",
      kcalPer100g: 431,
      aliases: ["Parmigiano Reggiano", "Grated Parmesan", "Parmesan Wedge"],
    },
    {
      id: "mozzarella",
      name: "Mozzarella Cheese",
      category: "dairy",
      kcalPer100g: 300,
      aliases: ["Fresh Mozzarella", "Shredded Mozzarella", "Buffalo Mozzarella"],
    },
    {
      id: "cheddar",
      name: "Cheddar Cheese",
      category: "dairy",
      kcalPer100g: 403,
      aliases: ["Sharp Cheddar", "Mild Cheddar", "Shredded Cheddar"],
    },
    {
      id: "butter",
      name: "Butter",
      category: "dairy",
      kcalPer100g: 717,
      aliases: ["Unsalted Butter", "Salted Butter", "European Butter"],
    },
    {
      id: "milk",
      name: "Milk",
      category: "dairy",
      kcalPer100g: 42,
      aliases: ["Whole Milk", "2% Milk", "Almond Milk", "Oat Milk"],
    },
    {
      id: "cream",
      name: "Heavy Cream",
      category: "dairy",
      kcalPer100g: 345,
      aliases: ["Whipping Cream", "Double Cream"],
    },

    // Grains & Pasta
    {
      id: "pasta_dry",
      name: "Pasta (Dry)",
      category: "grains",
      kcalPer100g: 371,
      aliases: ["Spaghetti", "Penne", "Fettuccine", "Rigatoni", "Linguine"],
    },
    {
      id: "rice",
      name: "Rice",
      category: "grains",
      kcalPer100g: 130,
      aliases: ["White Rice", "Brown Rice", "Basmati Rice", "Jasmine Rice"],
    },
    {
      id: "bread",
      name: "Bread",
      category: "grains",
      kcalPer100g: 265,
      aliases: ["Sourdough Bread", "Whole Wheat Bread", "French Bread", "Italian Bread"],
    },
    {
      id: "flour",
      name: "Flour",
      category: "grains",
      kcalPer100g: 364,
      aliases: ["All Purpose Flour", "Bread Flour", "Whole Wheat Flour", "Cake Flour"],
    },

    // Oils & Fats
    {
      id: "olive_oil",
      name: "Olive Oil",
      category: "oils",
      kcalPer100g: 884,
      aliases: ["Extra Virgin Olive Oil", "EVOO", "Virgin Olive Oil"],
    },
    {
      id: "vegetable_oil",
      name: "Vegetable Oil",
      category: "oils",
      kcalPer100g: 884,
      aliases: ["Canola Oil", "Sunflower Oil", "Corn Oil"],
    },
    {
      id: "coconut_oil",
      name: "Coconut Oil",
      category: "oils",
      kcalPer100g: 862,
      aliases: ["Virgin Coconut Oil", "Refined Coconut Oil"],
    },

    // Seasonings & Spices
    {
      id: "salt",
      name: "Salt",
      category: "seasonings",
      kcalPer100g: 0,
      aliases: ["Sea Salt", "Kosher Salt", "Table Salt", "Himalayan Salt"],
    },
    {
      id: "black_pepper",
      name: "Black Pepper",
      category: "seasonings",
      kcalPer100g: 251,
      aliases: ["Ground Black Pepper", "Peppercorns", "Freshly Ground Pepper"],
    },
    {
      id: "oregano",
      name: "Oregano",
      category: "herbs",
      kcalPer100g: 265,
      aliases: ["Dried Oregano", "Fresh Oregano"],
    },
    {
      id: "thyme",
      name: "Thyme",
      category: "herbs",
      kcalPer100g: 101,
      aliases: ["Fresh Thyme", "Dried Thyme", "Lemon Thyme"],
    },
    {
      id: "rosemary",
      name: "Rosemary",
      category: "herbs",
      kcalPer100g: 131,
      aliases: ["Fresh Rosemary", "Dried Rosemary"],
    },
    {
      id: "basil",
      name: "Basil",
      category: "herbs",
      kcalPer100g: 22,
      aliases: ["Fresh Basil", "Sweet Basil", "Genovese Basil"],
    },
    {
      id: "paprika",
      name: "Paprika",
      category: "spices",
      kcalPer100g: 282,
      aliases: ["Sweet Paprika", "Smoked Paprika", "Hot Paprika"],
    },
    {
      id: "cumin",
      name: "Cumin",
      category: "spices",
      kcalPer100g: 375,
      aliases: ["Ground Cumin", "Cumin Seeds"],
    },
    {
      id: "cinnamon",
      name: "Cinnamon",
      category: "spices",
      kcalPer100g: 247,
      aliases: ["Ground Cinnamon", "Cinnamon Stick", "Ceylon Cinnamon"],
    },
    {
      id: "garlic_powder",
      name: "Garlic Powder",
      category: "spices",
      kcalPer100g: 331,
      aliases: ["Dried Garlic Powder"],
    },
    {
      id: "onion_powder",
      name: "Onion Powder",
      category: "spices",
      kcalPer100g: 341,
      aliases: ["Dried Onion Powder"],
    },
    {
      id: "red_pepper_flakes",
      name: "Red Pepper Flakes",
      category: "spices",
      kcalPer100g: 318,
      aliases: ["Crushed Red Pepper", "Chili Flakes"],
    },

    // Baking
    {
      id: "sugar",
      name: "Sugar",
      category: "baking",
      kcalPer100g: 387,
      aliases: ["White Sugar", "Granulated Sugar", "Cane Sugar"],
    },
    {
      id: "brown_sugar",
      name: "Brown Sugar",
      category: "baking",
      kcalPer100g: 380,
      aliases: ["Light Brown Sugar", "Dark Brown Sugar"],
    },
    {
      id: "baking_powder",
      name: "Baking Powder",
      category: "baking",
      kcalPer100g: 53,
      aliases: ["Double Acting Baking Powder"],
    },
    {
      id: "baking_soda",
      name: "Baking Soda",
      category: "baking",
      kcalPer100g: 0,
      aliases: ["Sodium Bicarbonate"],
    },
    {
      id: "vanilla_extract",
      name: "Vanilla Extract",
      category: "baking",
      kcalPer100g: 288,
      aliases: ["Pure Vanilla Extract", "Vanilla Essence"],
    },
    {
      id: "chocolate_chips",
      name: "Chocolate Chips",
      category: "baking",
      kcalPer100g: 480,
      aliases: ["Semi-Sweet Chocolate Chips", "Dark Chocolate Chips", "Milk Chocolate Chips"],
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
  await prisma.recipe.upsert({
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
  await prisma.recipe.upsert({
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

  await prisma.recipe.upsert({
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
  await prisma.shoppingList.upsert({
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

  await prisma.shoppingList.upsert({
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
