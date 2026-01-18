import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecipeCard } from "@/components/recipe/recipe-card";
import { getUserRecipes, getRecipeStats } from "@/server/recipes";
import { getUserLists } from "@/server/lists";
import { ChefHat, Plus, ShoppingCart, BookOpen, List } from "lucide-react";


// Force dynamic rendering to avoid build-time database calls
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const userId = session.user.id;

  // Fetch user data in parallel
  const [recipes, stats, lists] = await Promise.all([
    getUserRecipes(userId, 6),
    getRecipeStats(userId),
    getUserLists(userId),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {session.user.name || "Chef"}! 👋
              </h1>
              <p className="text-gray-600">
                Manage your recipes and shopping lists in one place.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-gray-200 dark:border-dark-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalRecipes}
                  </p>
                  <p className="text-sm text-gray-600">Total Recipes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-dark-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {lists.length}
                  </p>
                  <p className="text-sm text-gray-600">Shopping Lists</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-dark-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <ChefHat className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {lists.reduce((acc, list) => acc + list.items.length, 0)}
                  </p>
                  <p className="text-sm text-gray-600">List Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-gray-200 dark:border-dark-border bg-gradient-to-br from-orange-500 to-orange-600 text-white dark:from-orange-950/70 dark:to-orange-900/70 dark:text-dark-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white dark:text-dark-gray-900">
                <Plus className="h-5 w-5" />
                Create New Recipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-100 dark:text-orange-100/90 mb-4">
                Share your culinary creations with the community.
              </p>
              <Button
                asChild
                size="lg"
                variant="primary"
              >
                <Link href="/recipes/new">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Recipe
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-dark-border bg-gradient-to-br from-blue-500 to-blue-600 text-white dark:from-blue-950/70 dark:to-blue-900/70 dark:text-dark-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white dark:text-dark-gray-900">
                <Plus className="h-5 w-5" />
                New Shopping List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100 dark:text-blue-100/90 mb-4">
                Organize your ingredients and plan your shopping.
              </p>
              <Link href="/lists/new">
                <Button variant="secondary">
                  Create List
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Recipes */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Recent Recipes
            </h2>
            {recipes.length > 0 && (
              <Link href="/recipes">
                <Button variant="link">View All</Button>
              </Link>
            )}
          </div>

          {recipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <Card className="border-gray-200 dark:border-dark-border">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No recipes yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start creating your first recipe to build your collection.
                </p>
                <Link href="/dashboard/recipes/new">
                  <Button variant="primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Recipe
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Shopping Lists */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Shopping Lists
            </h2>
            {lists.length > 0 && (
              <Link href="/lists">
                <Button variant="link">View All</Button>
              </Link>
            )}
          </div>

          {lists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.slice(0, 3).map((list) => {
                const totalItems = list.items.length;
                const checkedItems = list.items.filter((item) => item.checked).length;
                const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

                return (
                  <Link key={list.id} href={`/lists/${list.id}`}>
                    <Card className="border-gray-200 dark:border-dark-border hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <List className="h-5 w-5 text-blue-600" />
                          {list.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {checkedItems} of {totalItems} items
                            </span>
                            <span className="font-semibold text-gray-900">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          {list.items.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="text-sm text-gray-600 flex items-center gap-2"
                            >
                              <span className={item.checked ? "line-through" : ""}>
                                {item.text}
                              </span>
                            </div>
                          ))}
                          {totalItems > 3 && (
                            <p className="text-xs text-gray-500">
                              +{totalItems - 3} more items
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Card className="border-gray-200 dark:border-dark-border">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No shopping lists yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first shopping list to organize your ingredients.
                </p>
                <Link href="/lists/new">
                  <Button variant="secondary">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First List
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
