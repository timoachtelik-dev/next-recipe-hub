import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/lists/route";
import { LimitError } from "@/lib/limits";
import { getServerSession } from "next-auth";
import { createList } from "@/server/lists";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/server/lists", () => ({
  createList: vi.fn(),
  getUserLists: vi.fn(),
}));

describe("GET /api/lists", () => {
  beforeEach(() => {
    vi.mocked(getServerSession).mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(401);
  });
});

describe("POST /api/lists", () => {
  beforeEach(() => {
    vi.mocked(getServerSession).mockReset();
    vi.mocked(createList).mockReset();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new Request("http://localhost/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "My List" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns 403 when list limit is exceeded", async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: "user-1" } } as never);
    vi.mocked(createList).mockRejectedValue(new LimitError("Shopping list limit reached (10)."));

    const request = new Request("http://localhost/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "My List" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(403);

    const data = await response.json();
    expect(data.error).toMatch(/Shopping list limit/i);
  });
});
