import { Clock, Users, Zap, ChefHat } from "lucide-react";
import { RecipeWithDetails } from "@/types";

interface RecipeMetaProps {
  recipe: RecipeWithDetails;
}

export function RecipeMeta({ recipe }: RecipeMetaProps) {
  const totalTime = (recipe.prepMinutes || 0) + (recipe.cookMinutes || 0);
  const calories = recipe.nutrition?.kcal || 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {totalTime > 0 && (
        <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
          <Clock className="h-5 w-5 text-orange-600" />
          <div>
            <div className="text-sm font-medium text-gray-900">{totalTime} min</div>
            <div className="text-xs text-gray-600">Total time</div>
          </div>
        </div>
      )}
      
      {recipe.servings && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <Users className="h-5 w-5 text-blue-600" />
          <div>
            <div className="text-sm font-medium text-gray-900">{recipe.servings} servings</div>
            <div className="text-xs text-gray-600">Serves</div>
          </div>
        </div>
      )}
      
      {calories > 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
          <Zap className="h-5 w-5 text-green-600" />
          <div>
            <div className="text-sm font-medium text-gray-900">{calories} kcal</div>
            <div className="text-xs text-gray-600">Per serving</div>
          </div>
        </div>
      )}
      
      {recipe.diets.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
          <ChefHat className="h-5 w-5 text-purple-600" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {recipe.diets[0].replace("_", " ")}
            </div>
            <div className="text-xs text-gray-600">Diet</div>
          </div>
        </div>
      )}
    </div>
  );
}
