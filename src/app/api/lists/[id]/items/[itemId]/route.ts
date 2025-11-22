import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: listId, itemId } = await params;
    const body = await request.json();
    const { text, checked } = body;

    // Verify list belongs to user
    const list = await prisma.shoppingList.findFirst({
      where: { id: listId, userId: session.user.id },
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // Verify item belongs to list
    const item = await prisma.shoppingListItem.findFirst({
      where: { id: itemId, listId },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: { text?: string; checked?: boolean } = {};
    
    if (text !== undefined) {
      if (!text.trim()) {
        return NextResponse.json(
          { error: "Item text cannot be empty" },
          { status: 400 }
        );
      }
      updateData.text = text.trim();
    }
    
    if (checked !== undefined) {
      updateData.checked = checked;
    }

    // If no update data provided, toggle checked status (backward compatibility)
    if (Object.keys(updateData).length === 0) {
      updateData.checked = !item.checked;
    }

    // Update item and parent list's updatedAt
    const [updatedItem] = await prisma.$transaction([
      prisma.shoppingListItem.update({
        where: { id: itemId },
        data: updateData,
      }),
      prisma.shoppingList.update({
        where: { id: listId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: listId, itemId } = await params;

    // Verify list belongs to user
    const list = await prisma.shoppingList.findFirst({
      where: { id: listId, userId: session.user.id },
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // Verify item belongs to list
    const item = await prisma.shoppingListItem.findFirst({
      where: { id: itemId, listId },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Delete the item and update parent list's updatedAt
    await prisma.$transaction([
      prisma.shoppingListItem.delete({
        where: { id: itemId },
      }),
      prisma.shoppingList.update({
        where: { id: listId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}

