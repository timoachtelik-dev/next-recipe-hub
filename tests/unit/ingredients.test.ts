import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchIngredients } from "@/server/ingredients";

// Define a proper type for macros
type MacroData = {
  protein: number;
  carbs: number;
  fat: number;
};

// Mock Prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    ingredient: {
      findMany: vi.fn(),
    },
  },
}));

describe("Ingredients Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should search ingredients by name", async () => {
    const mockIngredients = [
      { 
        id: "tomato", 
        name: "Tomato", 
        category: "vegetable" as string | null,
        kcalPer100g: 18 as number | null,
        macros: { protein: 0.9, carbs: 3.9, fat: 0.2 } as MacroData,
        aliases: [] as string[]
      },
      { 
        id: "cherry-tomato", 
        name: "Cherry Tomato", 
        category: "vegetable" as string | null,
        kcalPer100g: 18 as number | null,
        macros: { protein: 0.9, carbs: 3.9, fat: 0.2 } as MacroData,
        aliases: [] as string[]
      },
    ];
    
    const { prisma } = await import("@/lib/db");
    vi.mocked(prisma.ingredient.findMany).mockResolvedValue(mockIngredients);

    const results = await searchIngredients("tomato");
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results).toHaveLength(2);
  });

  it("should return empty array for non-existent ingredient", async () => {
    const { prisma } = await import("@/lib/db");
    vi.mocked(prisma.ingredient.findMany).mockResolvedValue([]);

    const results = await searchIngredients("nonexistent");
    expect(results).toEqual([]);
  });
});
