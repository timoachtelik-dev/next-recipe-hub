import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchIngredients } from "@/server/ingredients";

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
        category: "vegetable",
        kcalPer100g: 18,
        macros: { protein: 0.9, carbs: 3.9, fat: 0.2 } as any,
        aliases: [] 
      },
      { 
        id: "cherry-tomato", 
        name: "Cherry Tomato", 
        category: "vegetable",
        kcalPer100g: 18,
        macros: { protein: 0.9, carbs: 3.9, fat: 0.2 } as any,
        aliases: [] 
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
