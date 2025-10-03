import { describe, it, expect } from "vitest";
import { searchIngredients } from "@/server/ingredients";

describe("Ingredients Service", () => {
  it("should search ingredients by name", async () => {
    const results = await searchIngredients("tomato");
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
  });

  it("should return empty array for non-existent ingredient", async () => {
    const results = await searchIngredients("nonexistent");
    expect(results).toEqual([]);
  });
});
