import { prisma } from "@/lib/db";
import { CreateListInput, UpdateListInput } from "@/lib/validators";

export async function createList(data: CreateListInput, userId: string) {
  return await prisma.shoppingList.create({
    data: {
      ...data,
      userId,
    },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getList(id: string, userId: string) {
  return await prisma.shoppingList.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function updateList(id: string, data: UpdateListInput, userId: string) {
  return await prisma.shoppingList.update({
    where: {
      id,
      userId,
    },
    data,
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function deleteList(id: string, userId: string) {
  // First, delete all items in the list
  await prisma.shoppingListItem.deleteMany({
    where: {
      listId: id,
    },
  });

  // Then delete the list itself
  return await prisma.shoppingList.delete({
    where: {
      id,
      userId,
    },
  });
}

export async function getUserLists(userId: string) {
  return await prisma.shoppingList.findMany({
    where: { userId },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function toggleListItem(listId: string, itemId: string, userId: string) {
  const list = await prisma.shoppingList.findFirst({
    where: { id: listId, userId },
  });

  if (!list) {
    throw new Error("List not found");
  }

  const currentItem = await prisma.shoppingListItem.findUnique({
    where: { id: itemId },
  });

  if (!currentItem) {
    throw new Error("Item not found");
  }

  // Update the item and the parent list's updatedAt
  const [updatedItem] = await prisma.$transaction([
    prisma.shoppingListItem.update({
      where: { id: itemId },
      data: {
        checked: !currentItem.checked,
      },
    }),
    prisma.shoppingList.update({
      where: { id: listId },
      data: {
        updatedAt: new Date(),
      },
    }),
  ]);

  return updatedItem;
}

export async function addItemToList(
  listId: string,
  text: string,
  userId: string
) {
  const list = await prisma.shoppingList.findFirst({
    where: { id: listId, userId },
  });

  if (!list) {
    throw new Error("List not found");
  }

  // Create the item and update the parent list's updatedAt
  const [item] = await prisma.$transaction([
    prisma.shoppingListItem.create({
      data: {
        listId,
        text,
        checked: false,
      },
    }),
    prisma.shoppingList.update({
      where: { id: listId },
      data: {
        updatedAt: new Date(),
      },
    }),
  ]);

  return item;
}
