"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { NutritionBadge, NutritionData } from "@/types";
import { NutritionBadges } from "./nutrition-badges";
import { NutritionSummary } from "@/components/nutrition/nutrition-summary";

interface NutritionBadgeToggleProps {
  badges: NutritionBadge[];
  nutritionData?: NutritionData | null;
  servings?: number;
  maxBadges?: number;
}

export function NutritionBadgeToggle({
  badges,
  nutritionData,
  servings = 1,
  maxBadges = 5,
}: NutritionBadgeToggleProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!badges.length) {
    return null;
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Nutrition Highlights
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsVisible((prev) => !prev)}
        >
          {isVisible ? "Hide nutrition data" : "Show nutrition data"}
        </Button>
      </div>
      {isVisible && (
        <div className="space-y-4">
          <NutritionBadges badges={badges} maxBadges={maxBadges} />
          {nutritionData && (
            <NutritionSummary nutrition={nutritionData} servings={servings} />
          )}
        </div>
      )}
    </div>
  );
}
