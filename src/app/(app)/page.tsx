import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SearchBar } from "@/components/search/search-bar";
import { RecipeCard } from "@/components/recipe/recipe-card";
import { searchRecipes } from "@/server/recipes";
import { recipeSearchSchema } from "@/lib/validators";
import type { RecipeWithDetails } from "@/types";

interface HomePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/app");
  }
  const params = {
    q: typeof searchParams.q === "string" ? searchParams.q : undefined,
    tags: typeof searchParams.tags === "string" ? searchParams.tags.split(",") : undefined,
    diet: typeof searchParams.diet === "string" ? searchParams.diet : undefined,
    maxTime: typeof searchParams.maxTime === "string" ? Number(searchParams.maxTime) : undefined,
    page: 1,
    limit: 12,
  };

  const validatedParams = recipeSearchSchema.parse(params);
  const { recipes } = await searchRecipes(validatedParams);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Discover Amazing Recipes
        </h1>
        <Suspense fallback={<div className="h-12 bg-gray-200 rounded animate-pulse" />}>
          <SearchBar />
        </Suspense>
      </div>

      <Suspense fallback={<RecipeGridSkeleton />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe: RecipeWithDetails) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </Suspense>

      {recipes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">
            No recipes found matching your criteria.
          </div>
          <p className="text-gray-400">
            Try adjusting your search or filters to find more recipes.
          </p>
        </div>
      )}
    </div>
  );
}

function RecipeGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white border rounded-lg overflow-hidden">
          <div className="aspect-video bg-gray-200 animate-pulse" />
          <div className="p-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
