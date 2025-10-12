import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/ui/safe-image";
import { RecipeMeta } from "@/components/recipe/recipe-meta";
import { getRecipeBySlug } from "@/server/recipes";
import { Step, RecipeWithDetails } from "@/types";

type RecipeItemWithIngredient = RecipeWithDetails['items'][0];
import { ChefHat } from "lucide-react";
import { RecipePageClient } from "./client";

// Force dynamic rendering to avoid build-time database calls
export const dynamic = 'force-dynamic';

interface RecipePageProps {
  params: Promise<{ slug: string }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  const steps = recipe.steps as Step[];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div id="recipe-content" className="recipe-print-container">
          {/* Hero Image */}
          <div className="aspect-video relative bg-gray-100 rounded-lg overflow-hidden mb-8">
            <SafeImage
              src={recipe.heroImage}
              alt={recipe.title}
              fill
              className="object-cover recipe-hero-image"
              placeholder={
                <div className="flex items-center justify-center h-full text-gray-400 text-xl">
                  [Recipe Image]
                </div>
              }
            />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 recipe-title">
              {recipe.title}
            </h1>

            {recipe.summary && (
              <p className="text-lg text-gray-600 mb-4 recipe-summary">
                {recipe.summary}
              </p>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              {recipe.diets.map((diet: string) => (
                <Badge key={diet} variant="secondary">
                  {diet.replace("_", " ")}
                </Badge>
              ))}
              {recipe.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="recipe-meta">
              <RecipeMeta recipe={recipe} />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Ingredients */}
            <div className="lg:col-span-1 ingredients-section">
              <h2 className="text-2xl font-semibold mb-4 ingredients-title">Ingredients</h2>
              <div className="space-y-3">
                {recipe.items.map((item: RecipeItemWithIngredient) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg ingredient-item">
                    <span className="font-medium">
                      {item.qty} {item.unit} {item.ingredient.name}
                    </span>
                    {item.notes && (
                      <span className="text-sm text-gray-600">
                        {item.notes}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="no-print">
                <RecipePageClient recipe={recipe} />
              </div>
            </div>

            {/* Instructions */}
            <div className="lg:col-span-2 instructions-section">
              <h2 className="text-2xl font-semibold mb-4 instructions-title">Instructions</h2>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-4 instruction-step">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-semibold step-number">
                      {step.order}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed step-text">
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Author Info */}
          <div className="mt-12 pt-8 border-t border-gray-200 author-section">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  By {recipe.author.name || recipe.author.email}
                </p>
                <p className="text-sm text-gray-600">
                  Created {new Date(recipe.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
