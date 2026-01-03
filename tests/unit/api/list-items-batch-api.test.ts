import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/lists/[id]/items/batch/route";
import { MAX_LIST_ITEMS_PER_LIST } from "@/lib/limits";
import { getServerSession } from "next-auth";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/server/lists", () => ({
  createList: vi.fn(),
}));

describe("POST /api/lists/[id]/items/batch", () => {
  beforeEach(() => {
    vi.mocked(getServerSession).mockReset();
  });

  it("returns 403 when the batch exceeds the item limit", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1" } } as never);

    const items = Array.from({ length: MAX_LIST_ITEMS_PER_LIST + 1 }, (_, index) => ({
      ingredientId: `ingredient-${index}`,
      qty: 1,
      unit: "g",
    }));

    const request = new Request("http://localhost/api/lists/list-1/items/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: "list-1" }),
    });

    expect(response.status).toBe(403);
  });
});
