import { z } from "zod";

export const stepSchema = z.object({
  order: z.number().min(1, "Step order must be at least 1"),
  text: z.string().min(1, "Step text is required").max(1000, "Step text is too long"),
});

export const recipeItemSchema = z.object({
  ingredientId: z.string().min(1, "Ingredient is required"),
  qty: z.number().min(0.01, "Quantity must be greater than 0"),
  unit: z.string().min(1, "Unit is required").max(20, "Unit name is too long"),
  notes: z.string().max(200, "Notes are too long").optional(),
});

export const createRecipeSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  summary: z.string().max(500, "Summary is too long").optional(),
  steps: z.array(stepSchema).min(1, "At least one step is required"),
  heroImage: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  prepMinutes: z.number().min(0, "Prep time cannot be negative").max(1440, "Prep time is too long").optional(),
  cookMinutes: z.number().min(0, "Cook time cannot be negative").max(1440, "Cook time is too long").optional(),
  servings: z.number().min(1, "Servings must be at least 1").max(100, "Too many servings").default(2),
  diets: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  items: z.array(recipeItemSchema).min(1, "At least one ingredient is required"),
});

export const updateRecipeSchema = createRecipeSchema.partial();

export type Step = z.infer<typeof stepSchema>;
export type RecipeItem = z.infer<typeof recipeItemSchema>;

export const createListSchema = z.object({
  name: z.string().min(1, "List name is required"),
});

export const updateListSchema = createListSchema.partial();

export const ingredientAutocompleteSchema = z.object({
  q: z.string().min(1, "Query is required"),
});

export const recipeSearchSchema = z.object({
  q: z.string().optional(),
  tags: z.array(z.string()).optional(),
  diet: z.string().optional(),
  maxTime: z.number().optional(),
  minServings: z.number().optional(),
  maxServings: z.number().optional(),
  maxCalories: z.number().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
export type IngredientAutocompleteInput = z.infer<typeof ingredientAutocompleteSchema>;
export type RecipeSearchInput = z.infer<typeof recipeSearchSchema>;
