import { RecipeWithDetails } from "@/types";
import { RecipeListItem } from "./recipe-list-item";

interface RecipeListViewProps {
  recipes: RecipeWithDetails[];
  variant?: "default" | "compact";
  onItemClick?: (slug: string) => void;
  selectedIndex?: number;
}

export function RecipeListView({ recipes, variant = "default", onItemClick, selectedIndex }: RecipeListViewProps) {
  return (
    <div className={variant === "compact" ? "divide-y divide-gray-100" : "space-y-4"}>
      {recipes.map((recipe, index) => (
        <RecipeListItem 
          key={recipe.id} 
          recipe={recipe} 
          variant={variant}
          onItemClick={onItemClick}
          isSelected={selectedIndex === index}
        />
      ))}
    </div>
  );
}

