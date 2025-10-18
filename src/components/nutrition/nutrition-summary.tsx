/**
 * Nutrition Summary Component
 * Displays a compact summary of key nutritional facts
 */

import type { NutritionData } from "@/types";

interface NutritionSummaryProps {
  nutrition: NutritionData;
  servings?: number;
}

export function NutritionSummary({ nutrition, servings = 1 }: NutritionSummaryProps) {
  return (
    <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="text-center">
        <div className="text-2xl font-bold">{nutrition.kcal}</div>
        <div className="text-xs text-muted-foreground">Calories</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{nutrition.protein}g</div>
        <div className="text-xs text-muted-foreground">Protein</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{nutrition.carbs}g</div>
        <div className="text-xs text-muted-foreground">Carbs</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{nutrition.fat}g</div>
        <div className="text-xs text-muted-foreground">Fat</div>
      </div>
    </div>
  );
}

