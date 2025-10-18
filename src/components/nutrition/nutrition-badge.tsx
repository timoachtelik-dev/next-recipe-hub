/**
 * Nutrition Badge Component
 * Displays a single nutrition badge with label and optional tooltip
 */

import type { NutritionBadge } from "@/types";
import { Badge } from "@/components/ui/badge";

interface NutritionBadgeProps {
  badge: NutritionBadge;
  showDescription?: boolean;
}

const colorVariants = {
  green: "bg-green-100 text-green-800 hover:bg-green-200 border-green-300",
  blue: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300",
  purple: "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300",
  orange: "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300",
  red: "bg-red-100 text-red-800 hover:bg-red-200 border-red-300",
  yellow: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300",
};

export function NutritionBadge({ badge, showDescription = false }: NutritionBadgeProps) {
  const colorClass = colorVariants[badge.color];

  if (showDescription) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium border ${colorClass}`}
        title={badge.description}
      >
        <span>{badge.label}</span>
      </div>
    );
  }

  return (
    <Badge
      variant="outline"
      className={colorClass}
      title={badge.description}
    >
      {badge.label}
    </Badge>
  );
}

