"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RecipeForm } from "@/components/recipe/recipe-form";
import { type CreateRecipeInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function NewRecipeClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateRecipeInput) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create recipe");
      }

      const recipe = await response.json();
      router.push(`/recipes/${recipe.slug}`);
    } catch (error) {
      console.error("Error creating recipe:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="shadow-sm"
              >
                <ArrowLeft className="size-4 mr-2" />
                Back
              </Button>
            </div>
          </div>

          <RecipeForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Create Recipe"
          />
        </div>
      </div>
    </div>
  );
}

export default NewRecipeClient;
