import type { User, Recipe, Ingredient, ShoppingList, RecipeItem, ShoppingListItem, Nutrition } from "@prisma/client";

export type RecipeWithDetails = Recipe & {
  author: User;
  items: (RecipeItem & {
    ingredient: Ingredient;
  })[];
  nutrition: Nutrition | null;
};

export type ShoppingListWithItems = ShoppingList & {
  items: (ShoppingListItem & {
    ingredient: Ingredient;
  })[];
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
