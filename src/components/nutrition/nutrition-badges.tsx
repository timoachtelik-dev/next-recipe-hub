/**
 * Nutrition Badges Component
 * Displays a collection of nutrition badges
 */

import type { NutritionBadge } from "@/types";
import { NutritionBadge as NutritionBadgeComponent } from "./nutrition-badge";

interface NutritionBadgesProps {
  badges: NutritionBadge[];
  maxBadges?: number;
  showDescription?: boolean;
}

export function NutritionBadges({
  badges,
  maxBadges = 5,
  showDescription = false,
}: NutritionBadgesProps) {
  if (!badges || badges.length === 0) {
    return null;
  }

  const displayBadges = badges.slice(0, maxBadges);
  const remainingCount = badges.length - maxBadges;

  return (
    <div className="flex flex-wrap gap-2">
      {displayBadges.map((badge) => (
        <NutritionBadgeComponent
          key={badge.type}
          badge={badge}
          showDescription={showDescription}
        />
      ))}
      {remainingCount > 0 && (
        <span className="text-sm text-muted-foreground">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}

