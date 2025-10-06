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
    const { name, qty = 1, unit = "piece" } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Item name is required" },
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

    // Create or find ingredient by name (normalized to lowercase slug)
    const ingredientId = name.toLowerCase().replace(/\s+/g, "_");
    let ingredient = await prisma.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient) {
      ingredient = await prisma.ingredient.create({
        data: {
          id: ingredientId,
          name: name.trim(),
          aliases: [name.trim()],
        },
      });
    }

    // Add item to list and update parent list's updatedAt
    const [item] = await prisma.$transaction([
      prisma.shoppingListItem.create({
        data: {
          listId,
          ingredientId: ingredient.id,
          qty: parseFloat(qty) || 1,
          unit: unit || "piece",
          checked: false,
        },
        include: {
          ingredient: true,
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
