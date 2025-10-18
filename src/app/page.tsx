import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search/search-bar";
import { RecipeCard } from "@/components/recipe/recipe-card";
import { searchRecipes } from "@/server/recipes";

// Force dynamic rendering to avoid build-time database calls
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch featured recipes (latest 3)
  const { recipes } = await searchRecipes({
    page: 1,
    limit: 3,
  });
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            next-recipe-hub
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover, create, and share amazing recipes. Build your personal recipe collection 
            and never forget a great meal again.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="primary" asChild size="lg">
              <Link href="/auth/signin">Get Started</Link>
            </Button>
          </div>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🍳</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Create Recipes</h3>
            <p className="text-gray-600">
              Build your personal recipe collection with detailed instructions and ingredients.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Discover</h3>
            <p className="text-gray-600">
              Find new recipes by searching ingredients, dietary preferences, or cooking time.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Shopping Lists</h3>
            <p className="text-gray-600">
              Generate shopping lists from your favorite recipes and never miss an ingredient.
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="mt-16">
          <SearchBar />
        </div>

        {/* Recipes Section */}
        <div id="recipes" className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Featured Recipes
          </h2>
          {recipes.length > 0 ? (
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
              <div className="text-center">
                <Button variant="primary" asChild size="lg">
                  <Link href="/auth/signin?callbackUrl=/app">View All Recipes</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-6">
                No recipes available yet. Be the first to create one!
              </p>
              <Button variant="primary" asChild size="lg">
                <Link href="/auth/signin?callbackUrl=/dashboard">Create Recipe</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}