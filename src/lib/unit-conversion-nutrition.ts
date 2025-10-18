/**
 * Unit Conversion for Nutrition Calculations
 * Converts various units to grams for accurate nutrition calculations
 */

type UnitConversion = {
  [key: string]: number; // value in grams
};

// Common ingredient density conversions (approximate)
const volumeToGrams: UnitConversion = {
  // Volume to grams (assumes water density, adjust per ingredient)
  ml: 1,
  l: 1000,
  tsp: 5,
  tbsp: 15,
  "fl oz": 30,
  cup: 240,
  pint: 473,
  quart: 946,
  gallon: 3785,
  teaspoon: 5,
  tablespoon: 15,
};

// Weight conversions to grams
const weightToGrams: UnitConversion = {
  g: 1,
  kg: 1000,
  mg: 0.001,
  oz: 28.35,
  lb: 453.59,
  gram: 1,
  kilogram: 1000,
  milligram: 0.001,
  ounce: 28.35,
  pound: 453.59,
};

// Specific ingredient density adjustments
const ingredientDensity: { [key: string]: number } = {
  // Multiplier for volume to gram conversion
  flour: 0.5, // 1 cup flour ≈ 120g (vs 240g water)
  sugar: 0.83, // 1 cup sugar ≈ 200g
  "brown sugar": 0.92, // 1 cup brown sugar ≈ 220g
  "powdered sugar": 0.5, // 1 cup powdered sugar ≈ 120g
  butter: 0.95, // 1 cup butter ≈ 227g
  oil: 0.92, // 1 cup oil ≈ 220g
  honey: 1.42, // 1 cup honey ≈ 340g
  milk: 1.03, // 1 cup milk ≈ 245g
  water: 1.0, // 1 cup water = 240g
  rice: 0.79, // 1 cup rice ≈ 190g
  "rolled oats": 0.35, // 1 cup oats ≈ 85g
};

/**
 * Convert a quantity from one unit to grams
 * @param quantity - The amount
 * @param unit - The unit to convert from
 * @param ingredientName - Optional ingredient name for density adjustment
 * @returns The equivalent weight in grams
 */
export function convertToGrams(
  quantity: number,
  unit: string,
  ingredientName?: string
): number {
  const normalizedUnit = unit.toLowerCase().trim();

  // Check if it's already a weight unit
  if (weightToGrams[normalizedUnit]) {
    return quantity * weightToGrams[normalizedUnit];
  }

  // Check if it's a volume unit
  if (volumeToGrams[normalizedUnit]) {
    let grams = quantity * volumeToGrams[normalizedUnit];

    // Apply ingredient-specific density if available
    if (ingredientName) {
      const ingredientKey = ingredientName.toLowerCase();
      for (const [key, density] of Object.entries(ingredientDensity)) {
        if (ingredientKey.includes(key)) {
          grams *= density;
          break;
        }
      }
    }

    return grams;
  }

  // If unit is unknown, assume it's already in grams or a count
  // For items/pieces, we can't accurately convert without more info
  if (normalizedUnit === "item" || normalizedUnit === "piece" || normalizedUnit === "whole") {
    return quantity * 100; // Assume 100g per item as a rough estimate
  }

  // Default: treat as grams
  return quantity;
}

/**
 * Convert grams to a specified unit
 * @param grams - The amount in grams
 * @param targetUnit - The unit to convert to
 * @param ingredientName - Optional ingredient name for density adjustment
 * @returns The equivalent amount in the target unit
 */
export function convertFromGrams(
  grams: number,
  targetUnit: string,
  ingredientName?: string
): number {
  const normalizedUnit = targetUnit.toLowerCase().trim();

  // Check if it's a weight unit
  if (weightToGrams[normalizedUnit]) {
    return grams / weightToGrams[normalizedUnit];
  }

  // Check if it's a volume unit
  if (volumeToGrams[normalizedUnit]) {
    let quantity = grams / volumeToGrams[normalizedUnit];

    // Apply ingredient-specific density if available
    if (ingredientName) {
      const ingredientKey = ingredientName.toLowerCase();
      for (const [key, density] of Object.entries(ingredientDensity)) {
        if (ingredientKey.includes(key)) {
          quantity /= density;
          break;
        }
      }
    }

    return quantity;
  }

  // Default: return grams as is
  return grams;
}

/**
 * Get the density multiplier for a specific ingredient
 * @param ingredientName - The ingredient name
 * @returns The density multiplier (default 1.0 for water)
 */
export function getIngredientDensity(ingredientName: string): number {
  const ingredientKey = ingredientName.toLowerCase();
  for (const [key, density] of Object.entries(ingredientDensity)) {
    if (ingredientKey.includes(key)) {
      return density;
    }
  }
  return 1.0; // Default to water density
}

/**
 * Check if a unit is a volume unit
 * @param unit - The unit to check
 * @returns True if it's a volume unit
 */
export function isVolumeUnit(unit: string): boolean {
  return unit.toLowerCase().trim() in volumeToGrams;
}

/**
 * Check if a unit is a weight unit
 * @param unit - The unit to check
 * @returns True if it's a weight unit
 */
export function isWeightUnit(unit: string): boolean {
  return unit.toLowerCase().trim() in weightToGrams;
}

