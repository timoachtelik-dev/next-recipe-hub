import type { User, Recipe, Ingredient, ShoppingList, RecipeItem, ShoppingListItem, Nutrition, Unit } from "@prisma/client";

export type RecipeWithDetails = Recipe & {
  author: User;
  items: (RecipeItem & {
    ingredient: Ingredient;
    unit: Unit;
  })[];
  nutrition: Nutrition | null;
};

export type ShoppingListWithItems = ShoppingList & {
  items: ShoppingListItem[];
};

export type RecipeSearchResult = {
  recipes: RecipeWithDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type Step = {
  order: number;
  text: string;
};

export type RecipeFormData = {
  title: string;
  summary?: string;
  steps: Step[];
  heroImage?: string;
  prepMinutes?: number;
  cookMinutes?: number;
  servings: number;
  diets: string[];
  tags: string[];
  items: {
    ingredientId: string;
    qty: number;
    unit: string;
    notes?: string;
  }[];
};

// Nutrition Types
export type NutritionData = {
  // Macronutrients (per serving)
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  saturatedFat?: number;
};

export type IngredientNutritionPer100g = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  saturatedFat?: number;
};

export type NutritionBadgeType = 
  // Health badges
  | "high-protein"
  | "low-sugar"
  | "high-fiber"
  // Diet badges
  | "keto-friendly"
  | "low-carb"
  // Allergen badges
  | "gluten-free";

export type NutritionBadge = {
  type: NutritionBadgeType;
  label: string;
  description: string;
  color: "green" | "blue" | "purple" | "orange" | "red" | "yellow";
};

export type NutritionBreakdownProps = {
  nutrition: NutritionData;
  servings: number;
};

export type DailyValue = {
  nutrient: string;
  amount: number;
  unit: string;
  dailyValue: number;
  percentage: number;
};
