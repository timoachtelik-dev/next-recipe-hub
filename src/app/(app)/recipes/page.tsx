"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RecipeCard } from "@/components/recipe/recipe-card";
import { RecipeListView } from "@/components/recipe/recipe-list-view";
import { FilterPanel, FilterState } from "@/components/search/filter-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ChevronLeft, ChevronRight, Loader2, Grid3x3, List } from "lucide-react";
import { RecipeWithDetails } from "@/types";

const RECIPES_PER_PAGE = 24;

function RecipesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">(
    (searchParams.get("view") as "grid" | "list") || "grid"
  );
  const [filters, setFilters] = useState<FilterState>({
    tags: searchParams.get("tags")?.split(",").filter(Boolean) || [],
    diet: searchParams.get("diet") || "",
    maxTime: Number(searchParams.get("maxTime")) || 0,
    minServings: Number(searchParams.get("minServings")) || 0,
    maxServings: Number(searchParams.get("maxServings")) || 0,
    maxCalories: Number(searchParams.get("maxCalories")) || 0,
  });
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const [recipes, setRecipes] = useState<RecipeWithDetails[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: RECIPES_PER_PAGE, total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch recipes
  const fetchRecipes = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (filters.tags.length > 0) params.set("tags", filters.tags.join(","));
      if (filters.diet) params.set("diet", filters.diet);
      if (filters.maxTime > 0) params.set("maxTime", filters.maxTime.toString());
      if (filters.minServings > 0) params.set("minServings", filters.minServings.toString());
      if (filters.maxServings > 0) params.set("maxServings", filters.maxServings.toString());
      if (filters.maxCalories > 0) params.set("maxCalories", filters.maxCalories.toString());
      params.set("page", currentPage.toString());
      params.set("limit", RECIPES_PER_PAGE.toString());

      const response = await fetch(`/api/recipes?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch recipes");
      
      const data = await response.json();
      setRecipes(data.recipes);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, filters, currentPage]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (filters.tags.length > 0) params.set("tags", filters.tags.join(","));
    if (filters.diet) params.set("diet", filters.diet);
    if (filters.maxTime > 0) params.set("maxTime", filters.maxTime.toString());
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (viewMode !== "grid") params.set("view", viewMode);
    
    router.replace(`/recipes${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }, [debouncedQuery, filters, currentPage, viewMode, router]);

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleRemoveTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
    setCurrentPage(1);
  };

  const handleRemoveDiet = () => {
    setFilters(prev => ({ ...prev, diet: "" }));
    setCurrentPage(1);
  };

  const handleRemoveMaxTime = () => {
    setFilters(prev => ({ ...prev, maxTime: 0 }));
    setCurrentPage(1);
  };

  const handleRemoveServings = () => {
    setFilters(prev => ({ ...prev, minServings: 0, maxServings: 0 }));
    setCurrentPage(1);
  };

  const handleRemoveCalories = () => {
    setFilters(prev => ({ ...prev, maxCalories: 0 }));
    setCurrentPage(1);
  };

  const activeFiltersCount = 
    filters.tags.length + 
    (filters.diet ? 1 : 0) + 
    (filters.maxTime > 0 ? 1 : 0) +
    (filters.minServings > 0 || filters.maxServings > 0 ? 1 : 0) +
    (filters.maxCalories > 0 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Recipes
          </h1>
          <p className="text-lg text-orange-100 mb-8">
            Browse through our collection of delicious recipes from the community
          </p>

          {/* Search Bar */}
          <div className="flex gap-3 max-w-3xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="search"
                placeholder="Search for recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-gray-900 bg-white border-0 shadow-lg"
              />
            </div>
            <Button 
              onClick={() => setShowFilters(true)}
              variant="secondary"
              size="lg"
              className="h-12 px-6 bg-white text-orange-600 hover:bg-gray-100"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 bg-orange-600 text-white">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            {filters.diet && (
              <Badge variant="secondary" className="gap-1">
                Diet: {filters.diet.replace("_", " ")}
                <button onClick={handleRemoveDiet} className="ml-1 hover:text-red-600">
                  ×
                </button>
              </Badge>
            )}
            {filters.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-red-600">
                  ×
                </button>
              </Badge>
            ))}
            {filters.maxTime > 0 && (
              <Badge variant="secondary" className="gap-1">
                ≤ {filters.maxTime} min
                <button onClick={handleRemoveMaxTime} className="ml-1 hover:text-red-600">
                  ×
                </button>
              </Badge>
            )}
            {(filters.minServings > 0 || filters.maxServings > 0) && (
              <Badge variant="secondary" className="gap-1">
                Servings: {filters.minServings || 1}-{filters.maxServings || "12+"}
                <button onClick={handleRemoveServings} className="ml-1 hover:text-red-600">
                  ×
                </button>
              </Badge>
            )}
            {filters.maxCalories > 0 && (
              <Badge variant="secondary" className="gap-1">
                ≤ {filters.maxCalories} kcal
                <button onClick={handleRemoveCalories} className="ml-1 hover:text-red-600">
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Results Info & View Toggle */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-gray-600">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading recipes...
              </span>
            ) : (
              <>
                Showing <span className="font-semibold">{recipes.length}</span> of{" "}
                <span className="font-semibold">{pagination.total}</span> recipes
              </>
            )}
          </p>
          <div className="flex items-center gap-4">
            {pagination.pages > 1 && (
              <p className="text-sm text-gray-500">
                Page {currentPage} of {pagination.pages}
              </p>
            )}
            <div className="flex items-center gap-2 border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 px-3"
              >
                <Grid3x3 className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 px-3"
              >
                <List className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">List</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Recipes Display */}
        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-video rounded-t-lg" />
                  <div className="bg-white p-4 rounded-b-lg space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg p-6 flex gap-4">
                  <div className="w-48 h-32 bg-gray-200 rounded flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="flex gap-2 mt-4">
                      <div className="h-6 w-20 bg-gray-200 rounded" />
                      <div className="h-6 w-20 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : recipes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No recipes found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters to find what you&apos;re looking for
            </p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setFilters({
                  tags: [],
                  diet: "",
                  maxTime: 0,
                  minServings: 0,
                  maxServings: 0,
                  maxCalories: 0,
                });
                setCurrentPage(1);
              }}
              variant="outline"
            >
              Clear all filters
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <RecipeListView recipes={recipes} />
        )}

        {/* Pagination */}
        {pagination.pages > 1 && !isLoading && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                let pageNum;
                if (pagination.pages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.pages - 3) {
                  pageNum = pagination.pages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }

                return (
                  <Button
                    key={i}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
              disabled={currentPage === pagination.pages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <FilterPanel
        open={showFilters}
        onOpenChange={setShowFilters}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
      />
    </div>
  );
}

export default function RecipesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-64 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <RecipesPageContent />
    </Suspense>
  );
}

