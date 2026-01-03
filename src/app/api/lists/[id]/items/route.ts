import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LimitError } from "@/lib/limits";
import { addItemToList } from "@/server/lists";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: listId } = await params;
    const body = await request.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Item text is required" },
        { status: 400 }
      );
    }

    const item = await addItemToList(listId, text.trim(), session.user.id);

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error adding item to list:", error);
    if (error instanceof LimitError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof Error && error.message === "List not found") {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to add item" },
      { status: 500 }
    );
  }
}
