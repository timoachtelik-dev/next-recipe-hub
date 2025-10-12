import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/ui/safe-image";
import { Clock, Users, Zap, ChefHat, ArrowRight } from "lucide-react";
import { RecipeWithDetails } from "@/types";

interface RecipeListItemProps {
  recipe: RecipeWithDetails;
  variant?: "default" | "compact";
  onItemClick?: (slug: string) => void;
  isSelected?: boolean;
}

export function RecipeListItem({ recipe, variant = "default", onItemClick, isSelected = false }: RecipeListItemProps) {
  const totalTime = (recipe.prepMinutes || 0) + (recipe.cookMinutes || 0);
  const calories = recipe.nutrition?.kcal || 0;
  const protein = recipe.nutrition?.protein || 0;
  const carbs = recipe.nutrition?.carbs || 0;
  const fat = recipe.nutrition?.fat || 0;

  const handleClick = () => {
    if (onItemClick) {
      onItemClick(recipe.slug);
    }
  };

  // Compact variant for navbar/dropdowns
  if (variant === "compact") {
    return (
      <Link
        href={`/recipes/${recipe.slug}`}
        onClick={handleClick}
        className={`flex gap-3 p-3 hover:bg-gray-50 transition-colors ${
          isSelected ? "bg-orange-50" : ""
        }`}
      >
        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden relative">
          <SafeImage
            src={recipe.heroImage}
            alt={recipe.title}
            fill
            className="object-cover"
            placeholder={
              <div className="flex items-center justify-center h-full">
                <ChefHat className="h-8 w-8 text-gray-300" />
              </div>
            }
          />
        </div>
        
        <div className="flex-1 min-w-0 relative">
          <h4 className="font-semibold text-sm mb-1 truncate">
            {recipe.title}
          </h4>
          
          {recipe.summary && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {recipe.summary}
            </p>
          )}
          
          <div className="flex flex-col justify-end absolute bottom-0">
            <div className="flex items-center gap-3 text-xs text-gray-500 pt-2">
              {totalTime > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{totalTime} min</span>
                </div>
              )}
              {calories > 0 && (
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>{calories} kcal</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant for full page view
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="md:w-64 h-48 md:h-auto relative bg-gray-100 flex-shrink-0">
          <SafeImage
            src={recipe.heroImage}
            alt={recipe.title}
            fill
            className="object-cover"
            placeholder={
              <div className="flex items-center justify-center h-full text-gray-400">
                <ChefHat className="h-16 w-16" />
              </div>
            }
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-6">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="mb-3">
              <Link href={`/recipes/${recipe.slug}`}>
                <h3 className="font-bold text-xl mb-2 hover:text-orange-600 transition-colors line-clamp-1">
                  {recipe.title}
                </h3>
              </Link>
              
              {recipe.summary && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {recipe.summary}
                </p>
              )}

              {/* Diets & Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.diets.slice(0, 3).map((diet: string) => (
                  <Badge key={diet} variant="secondary" className="text-xs">
                    {diet.replace("_", " ")}
                  </Badge>
                ))}
                {recipe.tags.slice(0, 2).map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {(recipe.diets.length > 3 || recipe.tags.length > 2) && (
                  <Badge variant="outline" className="text-xs text-gray-500">
                    +{Math.max(0, recipe.diets.length - 3) + Math.max(0, recipe.tags.length - 2)} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Stats & CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-auto">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {totalTime > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">{totalTime} min</span>
                  </div>
                )}
                {recipe.servings > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">{recipe.servings} servings</span>
                  </div>
                )}
                {calories > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">{calories} kcal</span>
                  </div>
                )}
              </div>

              {/* Nutrition Summary (hidden on mobile) */}
              {(protein > 0 || carbs > 0 || fat > 0) && (
                <div className="hidden flex items-center gap-2 text-xs text-gray-500">
                  {protein > 0 && <span>P: {protein}g</span>}
                  {carbs > 0 && <span>C: {carbs}g</span>}
                  {fat > 0 && <span>F: {fat}g</span>}
                </div>
              )}

              <Link href={`/recipes/${recipe.slug}`}>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  View Recipe
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

