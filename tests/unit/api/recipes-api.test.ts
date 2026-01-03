import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/recipes/route";
import { LimitError } from "@/lib/limits";
import { getServerSession } from "next-auth";
import { createRecipe } from "@/server/recipes";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/server/recipes", () => ({
  createRecipe: vi.fn(),
  searchRecipes: vi.fn(),
}));

const validRecipePayload = {
  title: "Test Recipe",
  steps: [{ order: 1, text: "Do the thing." }],
  items: [{ ingredientId: "ingredient-1", qty: 1, unitId: "g" }],
  servings: 2,
  diets: [],
  tags: [],
};

describe("POST /api/recipes", () => {
  beforeEach(() => {
    vi.mocked(getServerSession).mockReset();
    vi.mocked(createRecipe).mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new Request("http://localhost/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validRecipePayload),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns 403 when recipe limit is exceeded", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(createRecipe).mockRejectedValue(new LimitError("Recipe limit reached (10)."));

    const request = new Request("http://localhost/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validRecipePayload),
    });

    const response = await POST(request);
    expect(response.status).toBe(403);

    const data = await response.json();
    expect(data.error).toMatch(/Recipe limit/i);
  });
});
