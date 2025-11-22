"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RecipeForm } from "@/components/recipe/recipe-form";
import { type CreateRecipeInput } from "@/lib/validators";
import { RecipeWithDetails } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditRecipeClientProps {
  slug: string;
}

export function EditRecipeClient({ slug }: EditRecipeClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: recipe, isLoading, error } = useQuery<RecipeWithDetails>({
    queryKey: ["recipe", slug],
    queryFn: async () => {
      const response = await fetch(`/api/recipes/${slug}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch recipe");
      }
      return response.json();
    },
  });

  const updateRecipeMutation = useMutation({
    mutationFn: async (data: CreateRecipeInput) => {
      if (!recipe) throw new Error("No recipe to update");

      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update recipe");
      }

      return response.json();
    },
    onSuccess: (updatedRecipe) => {
      queryClient.invalidateQueries({ queryKey: ["recipe", slug] });
      queryClient.invalidateQueries({ queryKey: ["recipe", updatedRecipe.slug] });
      toast.success("Recipe updated successfully!");
      router.push(`/recipes/${updatedRecipe.slug}`);
    },
    onError: (error) => {
      console.error("Error updating recipe:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update recipe. Please try again.";
      toast.error(message);
    },
  });

  const handleSubmit = async (data: CreateRecipeInput) => {
    setIsSubmitting(true);
    try {
      await updateRecipeMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitialData = (
    recipe: RecipeWithDetails
  ): Partial<CreateRecipeInput> => {
    return {
      title: recipe.title,
      summary: recipe.summary || "",
      steps: recipe.steps as Array<{ order: number; text: string }>,
      heroImage: recipe.heroImage || "",
      prepMinutes: recipe.prepMinutes || undefined,
      cookMinutes: recipe.cookMinutes || undefined,
      servings: recipe.servings,
      diets: recipe.diets,
      tags: recipe.tags,
      items: recipe.items.map((item) => ({
        ingredientId: item.ingredientId,
        qty: item.qty,
        unitId: item.unitId,
        notes: item.notes || "",
      })),
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-gray-900" />
              <span className="ml-2 text-gray-500">Loading recipe...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "The recipe you're looking for doesn't exist or you don't have permission to edit it.";

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-gray-900 mb-4">
                Recipe Not Found
              </h1>
              <p className="text-gray-600 dark:text-dark-gray-500 mb-6">
                {errorMessage}
              </p>
              <Button onClick={() => router.push("/recipes")}>
                <ArrowLeft className="size-4 mr-2" />
                Back to Recipes
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ingredientNameMap = recipe.items.reduce<Record<string, string>>(
    (acc, item) => {
      acc[item.ingredientId] = item.ingredient.name;
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/recipes/${recipe.slug}`)}
                className="shadow-sm"
              >
                <ArrowLeft className="size-4 mr-2" />
                Back to Recipe
              </Button>
            </div>
          </div>

          <RecipeForm
            initialData={getInitialData(recipe)}
            ingredientNameMap={ingredientNameMap}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting || updateRecipeMutation.isPending}
            submitLabel="Update Recipe"
          />
        </div>
      </div>
    </div>
  );
}

export default EditRecipeClient;
