import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search/search-bar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
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
            <Button asChild size="lg">
              <Link href="/#recipes">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/#recipes">Browse Recipes</Link>
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
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">[Recipe Image]</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Classic Tomato Pasta</h3>
              <p className="text-gray-600 mb-4">A simple and delicious pasta dish with fresh tomatoes and basil.</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>30 min</span>
                <span>520 kcal</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">[Recipe Image]</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Mediterranean Salad</h3>
              <p className="text-gray-600 mb-4">Fresh vegetables with olive oil and herbs.</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>15 min</span>
                <span>280 kcal</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">[Recipe Image]</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Chicken Stir Fry</h3>
              <p className="text-gray-600 mb-4">Quick and healthy chicken with vegetables.</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>25 min</span>
                <span>450 kcal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}