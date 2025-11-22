/**
 * Server-side Nutrition Functions
 * Handles database operations and server-side logic for nutrition calculations
 */

import { prisma } from "@/lib/db";
import { calculateRecipeNutrition } from "@/lib/nutrition-calculator";
import { getNutritionBadges } from "@/lib/nutrition-badges";
import type { NutritionData, NutritionBadge } from "@/types";

/**
 * Calculate and save nutrition for a recipe
 * @param recipeId - The recipe ID
 * @returns The calculated nutrition data
 */
export async function calculateAndSaveRecipeNutrition(
  recipeId: string
): Promise<NutritionData | null> {
  try {
    // Fetch recipe with ingredients
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        items: {
          include: {
            ingredient: true,
            unit: true,
          },
        },
      },
    });

    if (!recipe) {
      throw new Error("Recipe not found");
    }

    // Calculate nutrition
    const nutrition = calculateRecipeNutrition(recipe.items, recipe.servings);

    // Save to database
    await prisma.nutrition.upsert({
      where: { recipeId },
      create: {
        recipeId,
        kcal: nutrition.kcal,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        fiber: nutrition.fiber,
        sugar: nutrition.sugar,
        saturatedFat: nutrition.saturatedFat,
      },
      update: {
        kcal: nutrition.kcal,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        fiber: nutrition.fiber,
        sugar: nutrition.sugar,
        saturatedFat: nutrition.saturatedFat,
      },
    });

    return nutrition;
  } catch (error) {
    console.error("Error calculating recipe nutrition:", error);
    return null;
  }
}

/**
 * Get nutrition data for a recipe
 * @param recipeId - The recipe ID
 * @returns The nutrition data or null if not found
 */
export async function getRecipeNutrition(recipeId: string): Promise<NutritionData | null> {
  try {
    const nutrition = await prisma.nutrition.findUnique({
      where: { recipeId },
    });

    if (!nutrition) {
      return null;
    }

    return {
      kcal: nutrition.kcal,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fat: nutrition.fat,
      fiber: nutrition.fiber || undefined,
      sugar: nutrition.sugar || undefined,
      saturatedFat: nutrition.saturatedFat || undefined,
    };
  } catch (error) {
    console.error("Error getting recipe nutrition:", error);
    return null;
  }
}

/**
 * Get nutrition badges for a recipe
 * @param recipeId - The recipe ID
 * @returns Array of nutrition badges
 */
export async function getRecipeNutritionBadges(recipeId: string): Promise<NutritionBadge[]> {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        nutrition: true,
      },
    });

    if (!recipe || !recipe.nutrition) {
      return [];
    }

    const nutritionData: NutritionData = {
      kcal: recipe.nutrition.kcal,
      protein: recipe.nutrition.protein,
      carbs: recipe.nutrition.carbs,
      fat: recipe.nutrition.fat,
      fiber: recipe.nutrition.fiber || undefined,
      sugar: recipe.nutrition.sugar || undefined,
      saturatedFat: recipe.nutrition.saturatedFat || undefined,
    };

    return getNutritionBadges(nutritionData, recipe.diets);
  } catch (error) {
    console.error("Error getting nutrition badges:", error);
    return [];
  }
}

/**
 * Update ingredient nutrition data
 * @param ingredientId - The ingredient ID
 * @param nutritionData - The nutrition data per 100g
 * @returns True if successful
 */
export async function updateIngredientNutrition(
  ingredientId: string,
  nutritionData: Record<string, unknown>
): Promise<boolean> {
  try {
    await prisma.ingredient.update({
      where: { id: ingredientId },
      data: {
        nutritionPer100g: nutritionData,
      },
    });

    return true;
  } catch (error) {
    console.error("Error updating ingredient nutrition:", error);
    return false;
  }
}

/**
 * Validate nutrition data
 * @param data - The nutrition data to validate
 * @returns True if valid
 */
export function validateNutritionData(data: Partial<NutritionData>): boolean {
  // Check required fields
  if (
    data.kcal === undefined ||
    data.protein === undefined ||
    data.carbs === undefined ||
    data.fat === undefined
  ) {
    return false;
  }

  // Check for negative values
  if (data.kcal < 0 || data.protein < 0 || data.carbs < 0 || data.fat < 0) {
    return false;
  }

  // Check calorie calculation makes sense (protein and carbs = 4 cal/g, fat = 9 cal/g)
  const calculatedKcal = data.protein * 4 + data.carbs * 4 + data.fat * 9;
  const difference = Math.abs(calculatedKcal - data.kcal);
  const percentageDiff = (difference / data.kcal) * 100;

  // Allow up to 20% difference (accounts for fiber, alcohol, etc.)
  if (percentageDiff > 20) {
    console.warn(
      `Nutrition data may be inaccurate: calculated ${calculatedKcal} kcal vs provided ${data.kcal} kcal`
    );
  }

  return true;
}

/**
 * Get nutrition breakdown with daily value percentages
 * @param recipeId - The recipe ID
 * @returns Nutrition breakdown with daily values
 */
export async function getNutritionBreakdown(recipeId: string) {
  const nutrition = await getRecipeNutrition(recipeId);

  if (!nutrition) {
    return null;
  }

  // Daily values based on a 2000 calorie diet
  const dailyValues = {
    protein: 50, // g
    carbs: 275, // g
    fat: 78, // g
    fiber: 28, // g
    saturatedFat: 20, // g
  };

  return {
    ...nutrition,
    percentages: {
      protein: Math.round((nutrition.protein / dailyValues.protein) * 100),
      carbs: Math.round((nutrition.carbs / dailyValues.carbs) * 100),
      fat: Math.round((nutrition.fat / dailyValues.fat) * 100),
      fiber: nutrition.fiber
        ? Math.round((nutrition.fiber / dailyValues.fiber) * 100)
        : undefined,
      saturatedFat: nutrition.saturatedFat
        ? Math.round((nutrition.saturatedFat / dailyValues.saturatedFat) * 100)
        : undefined,
    },
  };
}
