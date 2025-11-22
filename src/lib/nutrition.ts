import type { NutritionData } from "@/types";

const nutrientKeys: (keyof NutritionData)[] = [
  "kcal",
  "protein",
  "carbs",
  "fat",
  "fiber",
  "sugar",
  "saturatedFat",
];

/**
 * Determine if any meaningful nutrition values exist.
 * Prevents rendering nutrition UI when everything is zero/undefined.
 */
export function hasNutritionValues(
  nutrition?: Partial<NutritionData> | null,
): boolean {
  if (!nutrition) {
    return false;
  }

  return nutrientKeys.some((key) => {
    const value = nutrition[key];
    return typeof value === "number" && value > 0;
  });
}
