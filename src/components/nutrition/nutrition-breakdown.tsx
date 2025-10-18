/**
 * Nutrition Breakdown Component
 * Displays a detailed table of nutritional information with daily value percentages
 */

"use client";

import type { NutritionData } from "@/types";
import { NutritionProgressBar } from "./nutrition-progress-bar";
import { calculateDailyValue } from "@/lib/nutrition-badges";

interface NutritionBreakdownProps {
  nutrition: NutritionData;
  servings: number;
}

export function NutritionBreakdown({ nutrition, servings }: NutritionBreakdownProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Nutrition Facts</h3>
        <p className="text-sm text-muted-foreground">Per serving ({servings} servings)</p>
      </div>

      {/* Macronutrients */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-muted-foreground">Macronutrients</h4>
        <div className="space-y-3">
          <NutritionProgressBar
            label="Calories"
            amount={nutrition.kcal}
            unit=""
            percentage={Math.round((nutrition.kcal / 2000) * 100)}
            color="blue"
          />
          <NutritionProgressBar
            label="Protein"
            amount={nutrition.protein}
            unit="g"
            percentage={calculateDailyValue("protein", nutrition.protein)}
            color="blue"
          />
          <NutritionProgressBar
            label="Carbohydrates"
            amount={nutrition.carbs}
            unit="g"
            percentage={calculateDailyValue("carbs", nutrition.carbs)}
            color="orange"
          />
          <NutritionProgressBar
            label="Fat"
            amount={nutrition.fat}
            unit="g"
            percentage={calculateDailyValue("fat", nutrition.fat)}
            color="orange"
          />
          {nutrition.fiber !== undefined && (
            <NutritionProgressBar
              label="Fiber"
              amount={nutrition.fiber}
              unit="g"
              percentage={calculateDailyValue("fiber", nutrition.fiber)}
              color="green"
            />
          )}
          {nutrition.sugar !== undefined && (
            <NutritionProgressBar
              label="Sugar"
              amount={nutrition.sugar}
              unit="g"
              percentage={calculateDailyValue("sugar", nutrition.sugar)}
              color="red"
            />
          )}
          {nutrition.saturatedFat !== undefined && (
            <NutritionProgressBar
              label="Saturated Fat"
              amount={nutrition.saturatedFat}
              unit="g"
              percentage={calculateDailyValue("saturatedFat", nutrition.saturatedFat)}
              color="red"
            />
          )}
        </div>
      </div>

      <div className="text-xs text-muted-foreground pt-4 border-t">
        * Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher
        or lower depending on your calorie needs.
      </div>
    </div>
  );
}
