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
  green:
    "bg-green-100 text-green-800 hover:bg-green-200 border-green-300 dark:bg-green-900/40 dark:text-green-100 dark:border-green-700 dark:hover:bg-green-900/55",
  blue: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300 dark:bg-blue-900/40 dark:text-blue-100 dark:border-blue-700 dark:hover:bg-blue-900/55",
  purple:
    "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300 dark:bg-purple-900/40 dark:text-purple-100 dark:border-purple-700 dark:hover:bg-purple-900/55",
  orange:
    "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300 dark:bg-orange-900/40 dark:text-orange-100 dark:border-orange-700 dark:hover:bg-orange-900/55",
  red: "bg-red-100 text-red-800 hover:bg-red-200 border-red-300 dark:bg-red-900/40 dark:text-red-100 dark:border-red-700 dark:hover:bg-red-900/55",
  yellow:
    "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-100 dark:border-yellow-700 dark:hover:bg-yellow-900/55",
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
