import { z } from "zod";

export const createRecipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().optional(),
  steps: z.array(
    z.object({
      order: z.number(),
      text: z.string(),
    })
  ),
  heroImage: z.string().url().optional(),
  prepMinutes: z.number().min(0).optional(),
  cookMinutes: z.number().min(0).optional(),
  servings: z.number().min(1).default(2),
  diets: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  items: z.array(
    z.object({
      ingredientId: z.string(),
      qty: z.number().min(0),
      unit: z.string(),
      notes: z.string().optional(),
    })
  ),
});

export const updateRecipeSchema = createRecipeSchema.partial();

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
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
});

export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type CreateListInput = z.infer<typeof createListSchema>;
export type UpdateListInput = z.infer<typeof updateListSchema>;
export type IngredientAutocompleteInput = z.infer<typeof ingredientAutocompleteSchema>;
export type RecipeSearchInput = z.infer<typeof recipeSearchSchema>;
