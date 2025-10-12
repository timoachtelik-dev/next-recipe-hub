"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RecipeForm } from "@/components/recipe/recipe-form";
import { createRecipeSchema, type CreateRecipeInput } from "@/lib/validators";
import { RecipeWithDetails } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const slug = params.slug as string;

  // Fetch the recipe data
  const { data: recipe, isLoading, error } = useQuery<RecipeWithDetails>({
    queryKey: ["recipe", slug],
    queryFn: async () => {
      const response = await fetch(`/api/recipes/${slug}`);
      if (!response.ok) {
        throw new Error("Failed to fetch recipe");
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
        throw new Error("Failed to update recipe");
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
      toast.error("Failed to update recipe. Please try again.");
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

  // Convert recipe data to form format
  const getInitialData = (recipe: RecipeWithDetails): Partial<CreateRecipeInput> => {
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
      items: recipe.items.map(item => ({
        ingredientId: item.ingredientId,
        qty: item.qty,
        unit: item.unit,
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
              <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
              <span className="ml-2 text-gray-500">Loading recipe...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h1>
              <p className="text-gray-500 mb-6">
                The recipe you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to edit it.
              </p>
              <Button onClick={() => router.push("/recipes")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Recipes
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/recipes/${recipe.slug}`)}
                className="shadow-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Recipe
              </Button>
            </div>
          </div>

          {/* Recipe Form */}
          <RecipeForm
            initialData={getInitialData(recipe)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting || updateRecipeMutation.isPending}
            submitLabel="Update Recipe"
          />
        </div>
      </div>
    </div>
  );
}
