/**
 * Nutrition Badge System
 * Determines which nutrition badges apply to a recipe based on its nutritional values
 */

import type { NutritionData, NutritionBadge, NutritionBadgeType } from "@/types";

// Badge definitions with criteria
const BADGE_DEFINITIONS: Record<
  NutritionBadgeType,
  {
    label: string;
    description: string;
    color: "green" | "blue" | "purple" | "orange" | "red" | "yellow";
    criteria: (nutrition: NutritionData) => boolean;
  }
> = {
  // Health Badges
  "high-protein": {
    label: "High Protein",
    description: "Contains at least 20g of protein per serving",
    color: "blue",
    criteria: (n) => n.protein >= 20,
  },
  "low-sugar": {
    label: "Low Sugar",
    description: "Contains less than 5g of sugar per serving",
    color: "green",
    criteria: (n) => (n.sugar || 0) < 5,
  },
  "high-fiber": {
    label: "High Fiber",
    description: "Contains at least 5g of fiber per serving",
    color: "green",
    criteria: (n) => (n.fiber || 0) >= 5,
  },

  // Diet Badges
  "keto-friendly": {
    label: "Keto Friendly",
    description: "Low carb, high fat - suitable for ketogenic diet",
    color: "purple",
    criteria: (n) => {
      const netCarbs = (n.carbs || 0) - (n.fiber || 0);
      const fatPercentage = (n.fat * 9) / n.kcal;
      return netCarbs < 10 && fatPercentage > 0.65;
    },
  },
  "low-carb": {
    label: "Low Carb",
    description: "Contains less than 20g of net carbs per serving",
    color: "purple",
    criteria: (n) => {
      const netCarbs = n.carbs - (n.fiber || 0);
      return netCarbs < 20;
    },
  },

  // Allergen Badges (Note: These are determined by diet tags from the recipe)
  "gluten-free": {
    label: "Gluten Free",
    description: "Contains no gluten-containing ingredients",
    color: "orange",
    criteria: () => false, // Should be determined by diet tags
  },
};

/**
 * Get all applicable nutrition badges for a recipe
 * @param nutrition - The nutrition data for the recipe
 * @param diets - Optional array of diet tags from the recipe
 * @returns Array of applicable nutrition badges
 */
export function getNutritionBadges(
  nutrition: NutritionData,
  diets: string[] = []
): NutritionBadge[] {
  const badges: NutritionBadge[] = [];

  // Check each badge's criteria
  for (const [type, definition] of Object.entries(BADGE_DEFINITIONS)) {
    if (definition.criteria(nutrition)) {
      badges.push({
        type: type as NutritionBadgeType,
        label: definition.label,
        description: definition.description,
        color: definition.color,
      });
    }
  }

  // Add allergen/diet badges based on recipe diet tags
  if (diets.includes("gluten_free") || diets.includes("gluten-free")) {
    badges.push({
      type: "gluten-free",
      label: BADGE_DEFINITIONS["gluten-free"].label,
      description: BADGE_DEFINITIONS["gluten-free"].description,
      color: BADGE_DEFINITIONS["gluten-free"].color,
    });
  }

  return badges;
}

/**
 * Calculate the percentage of daily value for a nutrient
 * @param nutrient - The nutrient name
 * @param amount - The amount of the nutrient
 * @returns The percentage of daily value (0-100+)
 */
export function calculateDailyValue(nutrient: string, amount: number): number {
  const dailyValues: Record<string, number> = {
    protein: 50, // g
    carbs: 275, // g
    fat: 78, // g
    fiber: 28, // g
    sugar: 50, // g (added sugars)
    saturatedFat: 20, // g
  };

  const dv = dailyValues[nutrient];
  if (!dv) return 0;

  return Math.round((amount / dv) * 100);
}

/**
 * Get a human-readable description of nutrition quality
 * @param nutrition - The nutrition data
 * @returns A description string
 */
export function getNutritionQualityDescription(nutrition: NutritionData): string {
  const badges = getNutritionBadges(nutrition);

  if (badges.length === 0) {
    return "Nutritional information available";
  }

  const healthBadges = badges.filter((b) =>
    ["high-protein", "low-sugar", "high-fiber"].includes(b.type)
  );

  if (healthBadges.length >= 3) {
    return "Excellent nutritional profile";
  } else if (healthBadges.length >= 2) {
    return "Good nutritional balance";
  } else if (healthBadges.length >= 1) {
    return "Contains healthy nutrients";
  }

  return "Nutritional information available";
}

/**
 * Format a nutrient amount with appropriate units
 * @param nutrient - The nutrient name
 * @param amount - The amount
 * @returns Formatted string with units
 */
export function formatNutrientAmount(nutrient: string, amount: number): string {
  const roundedAmount = Math.round(amount * 10) / 10;
  return `${roundedAmount}g`;
}

