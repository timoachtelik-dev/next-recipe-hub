import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/lists/[id]/items/route";
import { LimitError } from "@/lib/limits";
import { getServerSession } from "next-auth";
import { addItemToList } from "@/server/lists";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/server/lists", () => ({
  addItemToList: vi.fn(),
}));

describe("POST /api/lists/[id]/items", () => {
  beforeEach(() => {
    vi.mocked(getServerSession).mockReset();
    vi.mocked(addItemToList).mockReset();
  });

  it("returns 403 when item limit is exceeded", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(addItemToList).mockRejectedValue(
      new LimitError("Shopping list item limit reached (50).")
    );

    const request = new Request("http://localhost/api/lists/list-1/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Milk" }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: "list-1" }),
    });

    expect(response.status).toBe(403);

    const data = await response.json();
    expect(data.error).toMatch(/Shopping list item limit/i);
  });

  it("returns 404 when list is missing", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(addItemToList).mockRejectedValue(new Error("List not found"));

    const request = new Request("http://localhost/api/lists/list-1/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Milk" }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: "list-1" }),
    });

    expect(response.status).toBe(404);
  });
});
