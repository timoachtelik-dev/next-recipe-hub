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
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items array is required" },
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

    // Create items in batch
    const createdItems = await Promise.all(
      items.map(async (item) => {
        const { ingredientId, qty, unit, notes } = item;

        return await prisma.shoppingListItem.create({
          data: {
            listId,
            ingredientId,
            qty: parseFloat(qty) || 1,
            unit: unit || "piece",
            notes,
            checked: false,
          },
          include: {
            ingredient: true,
          },
        });
      })
    );

    // Update parent list's updatedAt
    await prisma.shoppingList.update({
      where: { id: listId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(createdItems, { status: 201 });
  } catch (error) {
    console.error("Error adding items to list:", error);
    return NextResponse.json(
      { error: "Failed to add items" },
      { status: 500 }
    );
  }
}
