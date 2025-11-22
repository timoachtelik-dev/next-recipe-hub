import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

    // Verify list belongs to user
    const list = await prisma.shoppingList.findFirst({
      where: { id: listId, userId: session.user.id },
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // Add item to list and update parent list's updatedAt
    const [item] = await prisma.$transaction([
      prisma.shoppingListItem.create({
        data: {
          listId,
          text: text.trim(),
          checked: false,
        },
      }),
      prisma.shoppingList.update({
        where: { id: listId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error adding item to list:", error);
    return NextResponse.json(
      { error: "Failed to add item" },
      { status: 500 }
    );
  }
}
