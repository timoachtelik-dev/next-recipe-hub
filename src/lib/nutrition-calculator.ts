/**
 * Nutrition Calculation Engine
 * Calculates nutritional values from recipe ingredients
 */

import type { Ingredient, RecipeItem } from "@prisma/client";
import type { NutritionData, IngredientNutritionPer100g } from "@/types";
import { convertToGrams } from "./unit-conversion-nutrition";

/**
 * Calculate the nutrition for a single ingredient based on quantity and unit
 * @param ingredient - The ingredient with nutrition data
 * @param quantity - The amount of ingredient
 * @param unit - The unit of measurement
 * @returns Nutrition data for the ingredient amount
 */
export function calculateIngredientNutrition(
  ingredient: Ingredient,
  quantity: number,
  unit: string
): Partial<NutritionData> {
  // Convert quantity to grams
  const grams = convertToGrams(quantity, unit, ingredient.name);

  // Get nutrition per 100g
  let nutritionPer100g: IngredientNutritionPer100g | null = null;

  if (ingredient.nutritionPer100g) {
    try {
      nutritionPer100g = ingredient.nutritionPer100g as IngredientNutritionPer100g;
    } catch {
      // If parsing fails, fall back to basic macros
    }
  }

  // If we have detailed nutrition data, use it
  if (nutritionPer100g) {
    const multiplier = grams / 100;
    return {
      kcal: Math.round((nutritionPer100g.kcal || 0) * multiplier),
      protein: Number(((nutritionPer100g.protein || 0) * multiplier).toFixed(1)),
      carbs: Number(((nutritionPer100g.carbs || 0) * multiplier).toFixed(1)),
      fat: Number(((nutritionPer100g.fat || 0) * multiplier).toFixed(1)),
      fiber: nutritionPer100g.fiber
        ? Number((nutritionPer100g.fiber * multiplier).toFixed(1))
        : undefined,
      sugar: nutritionPer100g.sugar
        ? Number((nutritionPer100g.sugar * multiplier).toFixed(1))
        : undefined,
      saturatedFat: nutritionPer100g.saturatedFat
        ? Number((nutritionPer100g.saturatedFat * multiplier).toFixed(1))
        : undefined,
    };
  }

  // Fall back to basic macros if available
  if (ingredient.kcalPer100g || ingredient.macros) {
    const multiplier = grams / 100;
    const macros = ingredient.macros as { protein?: number; carbs?: number; fat?: number } | null;

    return {
      kcal: ingredient.kcalPer100g
        ? Math.round(ingredient.kcalPer100g * multiplier)
        : 0,
      protein: macros?.protein ? Number((macros.protein * multiplier).toFixed(1)) : 0,
      carbs: macros?.carbs ? Number((macros.carbs * multiplier).toFixed(1)) : 0,
      fat: macros?.fat ? Number((macros.fat * multiplier).toFixed(1)) : 0,
    };
  }

  // No nutrition data available
  return {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };
}

/**
 * Aggregate multiple nutrition values into a single total
 * @param nutritionDataArray - Array of nutrition data objects
 * @returns Aggregated nutrition data
 */
export function aggregateNutritionValues(
  nutritionDataArray: Partial<NutritionData>[]
): NutritionData {
  const result: NutritionData = {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };

  for (const nutrition of nutritionDataArray) {
    result.kcal += nutrition.kcal || 0;
    result.protein += nutrition.protein || 0;
    result.carbs += nutrition.carbs || 0;
    result.fat += nutrition.fat || 0;

    // Optional nutrients - only include if at least one item has them
    if (nutrition.fiber !== undefined) {
      result.fiber = (result.fiber || 0) + nutrition.fiber;
    }
    if (nutrition.sugar !== undefined) {
      result.sugar = (result.sugar || 0) + nutrition.sugar;
    }
    if (nutrition.saturatedFat !== undefined) {
      result.saturatedFat = (result.saturatedFat || 0) + nutrition.saturatedFat;
    }
  }

  // Round all values
  result.kcal = Math.round(result.kcal);
  result.protein = Number(result.protein.toFixed(1));
  result.carbs = Number(result.carbs.toFixed(1));
  result.fat = Number(result.fat.toFixed(1));

  if (result.fiber !== undefined) result.fiber = Number(result.fiber.toFixed(1));
  if (result.sugar !== undefined) result.sugar = Number(result.sugar.toFixed(1));
  if (result.saturatedFat !== undefined)
    result.saturatedFat = Number(result.saturatedFat.toFixed(1));

  return result;
}

/**
 * Calculate total nutrition for a recipe from its ingredients
 * @param items - Recipe items with ingredients
 * @param servings - Number of servings (for per-serving calculation)
 * @returns Nutrition data per serving
 */
export function calculateRecipeNutrition(
  items: (RecipeItem & { ingredient: Ingredient })[],
  servings: number = 1
): NutritionData {
  // Calculate nutrition for each ingredient
  const ingredientNutritions = items.map((item) =>
    calculateIngredientNutrition(item.ingredient, item.qty, item.unit)
  );

  // Aggregate all nutrition values
  const totalNutrition = aggregateNutritionValues(ingredientNutritions);

  // Divide by servings to get per-serving values
  const perServing: NutritionData = {
    kcal: Math.round(totalNutrition.kcal / servings),
    protein: Number((totalNutrition.protein / servings).toFixed(1)),
    carbs: Number((totalNutrition.carbs / servings).toFixed(1)),
    fat: Number((totalNutrition.fat / servings).toFixed(1)),
  };

  // Handle optional nutrients
  if (totalNutrition.fiber !== undefined) {
    perServing.fiber = Number((totalNutrition.fiber / servings).toFixed(1));
  }
  if (totalNutrition.sugar !== undefined) {
    perServing.sugar = Number((totalNutrition.sugar / servings).toFixed(1));
  }
  if (totalNutrition.saturatedFat !== undefined) {
    perServing.saturatedFat = Number((totalNutrition.saturatedFat / servings).toFixed(1));
  }

  return perServing;
}

/**
 * Scale nutrition data by a factor (e.g., for recipe scaling)
 * @param nutrition - Original nutrition data
 * @param factor - Scaling factor (e.g., 2 for double, 0.5 for half)
 * @returns Scaled nutrition data
 */
export function scaleNutrition(nutrition: NutritionData, factor: number): NutritionData {
  const scaled: NutritionData = {
    kcal: Math.round(nutrition.kcal * factor),
    protein: Number((nutrition.protein * factor).toFixed(1)),
    carbs: Number((nutrition.carbs * factor).toFixed(1)),
    fat: Number((nutrition.fat * factor).toFixed(1)),
  };

  // Scale optional nutrients
  if (nutrition.fiber !== undefined) {
    scaled.fiber = Number((nutrition.fiber * factor).toFixed(1));
  }
  if (nutrition.sugar !== undefined) {
    scaled.sugar = Number((nutrition.sugar * factor).toFixed(1));
  }
  if (nutrition.saturatedFat !== undefined) {
    scaled.saturatedFat = Number((nutrition.saturatedFat * factor).toFixed(1));
  }

  return scaled;
}
