import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getList, updateList, deleteList } from "@/server/lists";
import { updateListSchema } from "@/lib/validators";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const list = await getList(id, session.user.id);
    
    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error("Error fetching list:", error);
    return NextResponse.json(
      { error: "Failed to fetch list" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateListSchema.parse(body);
    
    const list = await updateList(id, validatedData, session.user.id);

    return NextResponse.json(list);
  } catch (error) {
    console.error("Error updating list:", error);
    if (error instanceof Error && error.message === "List not found") {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to update list" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteList(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting list:", error);
    if (error instanceof Error && error.message === "List not found") {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete list" },
      { status: 500 }
    );
  }
}
