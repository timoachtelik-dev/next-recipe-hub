import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/ui/safe-image";
import { Clock, Zap } from "lucide-react";
import { RecipeWithDetails, NutritionData } from "@/types";
import { getNutritionBadges } from "@/lib/nutrition-badges";
import { NutritionBadges } from "@/components/nutrition/nutrition-badges";

interface RecipeCardProps {
  recipe: RecipeWithDetails;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime = (recipe.prepMinutes || 0) + (recipe.cookMinutes || 0);
  const calories = recipe.nutrition?.kcal || 0;

  // Get nutrition badges if nutrition data is available
  const nutritionBadges = recipe.nutrition
    ? getNutritionBadges(
        recipe.nutrition as NutritionData,
        recipe.diets
      )
    : [];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative bg-gray-100">
        <SafeImage
          src={recipe.heroImage}
          alt={recipe.title}
          fill
          className="object-cover"
          placeholder={
            <div className="flex items-center justify-center h-full text-gray-400">
              [Image]
            </div>
          }
        />
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {recipe.title}
        </h3>
        
        {recipe.summary && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {recipe.summary}
          </p>
        )}
        
        <div className="flex flex-wrap gap-1 mb-3">
          {recipe.diets.slice(0, 2).map((diet: string) => (
            <Badge key={diet} variant="secondary" className="text-xs">
              {diet.replace("_", " ")}
            </Badge>
          ))}
          {recipe.diets.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{recipe.diets.length - 2} more
            </Badge>
          )}
        </div>

        {nutritionBadges.length > 0 && (
          <div className="mb-3">
            <NutritionBadges badges={nutritionBadges} maxBadges={3} />
          </div>
        )}
        
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {totalTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{totalTime} min</span>
            </div>
          )}
          {calories > 0 && (
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              <span>{calories} kcal</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Link 
          href={`/recipes/${recipe.slug}`}
          className="w-full text-center py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
        >
          View Recipe
        </Link>
      </CardFooter>
    </Card>
  );
}
