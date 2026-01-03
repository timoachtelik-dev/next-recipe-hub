import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LimitError, MAX_LIST_ITEMS_PER_LIST } from "@/lib/limits";
import { createList } from "@/server/lists";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: listIdParam } = await params;
    const body = await request.json();
    const { items, newListName } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items array is required" },
        { status: 400 }
      );
    }

    if (items.length > MAX_LIST_ITEMS_PER_LIST) {
      return NextResponse.json(
        { error: `Shopping list item limit reached (${MAX_LIST_ITEMS_PER_LIST}).` },
        { status: 403 }
      );
    }

    // Handle "new" list creation
    let listId = listIdParam;
    let list;

    if (listIdParam === "new") {
      if (!newListName || !newListName.trim()) {
        return NextResponse.json(
          { error: "New list name is required" },
          { status: 400 }
        );
      }

      list = await createList({ name: newListName.trim() }, session.user.id);
      listId = list.id;
    } else {
      // Verify existing list belongs to user
      list = await prisma.shoppingList.findFirst({
        where: { id: listIdParam, userId: session.user.id },
      });

      if (!list) {
        return NextResponse.json({ error: "List not found" }, { status: 404 });
      }
    }

    const existingItemCount = await prisma.shoppingListItem.count({
      where: { listId },
    });

    if (existingItemCount + items.length > MAX_LIST_ITEMS_PER_LIST) {
      return NextResponse.json(
        { error: `Shopping list item limit reached (${MAX_LIST_ITEMS_PER_LIST}).` },
        { status: 403 }
      );
    }

    // Fetch ingredient names and create items with formatted text
    const createdItems = await Promise.all(
      items.map(async (item) => {
        const { ingredientId, qty, unit } = item;

        // Fetch ingredient name
        const ingredient = await prisma.ingredient.findUnique({
          where: { id: ingredientId },
        });

        if (!ingredient) {
          throw new Error(`Ingredient not found: ${ingredientId}`);
        }

        // Format as "{qty} {unit} {name}"
        const text = `${qty} ${unit} ${ingredient.name}`.trim();

        return await prisma.shoppingListItem.create({
          data: {
            listId,
            text,
            checked: false,
          },
        });
      })
    );

    // Update parent list's updatedAt
    await prisma.shoppingList.update({
      where: { id: listId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ items: createdItems, list }, { status: 201 });
  } catch (error) {
    console.error("Error adding items to list:", error);
    if (error instanceof LimitError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Failed to add items" },
      { status: 500 }
    );
  }
}
