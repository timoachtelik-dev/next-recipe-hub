"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ShoppingListWithItems } from "@/types";
import { ShoppingCart, Plus, ChevronDown } from "lucide-react";

interface AddToShoppingListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (listName: string, listId: string, itemCount: number) => void;
  recipeItems: Array<{
    id: string;
    qty: number;
    unit: string;
    ingredient: { id: string; name: string };
  }>;
  recipeTitle: string;
}

export function AddToShoppingListDialog({
  isOpen,
  onClose,
  onSuccess,
  recipeItems,
  recipeTitle
}: AddToShoppingListDialogProps) {
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [newListName, setNewListName] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Fetch user's shopping lists
  const { data: shoppingLists, isLoading: isLoadingLists } = useQuery({
    queryKey: ["shopping-lists"],
    queryFn: async () => {
      const response = await fetch("/api/lists");
      if (!response.ok) throw new Error("Failed to fetch lists");
      return response.json();
    },
    enabled: isOpen,
  });

  // Add items to shopping list
  const addItemsMutation = useMutation({
    mutationFn: async () => {
      const listId = isCreatingNew ? "new" : selectedListId;

      const response = await fetch(`/api/lists/${listId}/items/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: recipeItems.map(item => ({
            ingredientId: item.ingredient.id,
            qty: item.qty,
            unit: item.unit,
          })),
          newListName: isCreatingNew ? newListName : undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to add items to list");
      return response.json();
    },
    onSuccess: (data) => {
      // Close the dialog and trigger success callback with list info
      const listName = data.list?.name || newListName;
      const listId = data.list?.id || "";
      onSuccess(listName, listId, recipeItems.length);
      onClose();
    },
  });

  const handleSubmit = () => {
    if (isCreatingNew && !newListName.trim()) return;
    if (!isCreatingNew && !selectedListId) return;

    addItemsMutation.mutate();
  };

  const handleCreateNewToggle = () => {
    setIsCreatingNew(!isCreatingNew);
    setSelectedListId("");
    setNewListName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Add to Shopping List
          </DialogTitle>
          <DialogDescription>
            Add ingredients from &quot;{recipeTitle}&quot; to your shopping list
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recipe Items Preview */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium mb-2">Items to add:</h4>
            <div className="space-y-1 text-sm">
              {recipeItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.ingredient.name}</span>
                  <span className="text-gray-600">
                    {item.qty} {item.unit}
                  </span>
                </div>
              ))}
              {recipeItems.length > 3 && (
                <div className="text-gray-500 text-center">
                  +{recipeItems.length - 3} more items
                </div>
              )}
            </div>
          </div>

          {/* List Selection */}
          <div className="space-y-3">
            {!isCreatingNew ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Select existing list</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        disabled={isLoadingLists}
                      >
                        {selectedListId ?
                          shoppingLists?.find((list: ShoppingListWithItems) => list.id === selectedListId)?.name || "Choose a shopping list..."
                          : "Choose a shopping list..."
                        }
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full min-w-[var(--radix-dropdown-menu-trigger-width)]">
                      {isLoadingLists ? (
                        <div className="p-2 text-sm text-gray-500">Loading lists...</div>
                      ) : shoppingLists?.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">No lists found</div>
                      ) : (
                        shoppingLists?.map((list: ShoppingListWithItems) => (
                          <DropdownMenuItem
                            key={list.id}
                            onClick={() => setSelectedListId(list.id)}
                          >
                            {list.name} ({list.items.length} items)
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleCreateNewToggle}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create new list
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="new-list-name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">New list name</label>
                  <Input
                    id="new-list-name"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="e.g., Weekend BBQ"
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={handleCreateNewToggle}
                  className="w-full"
                >
                  Back to existing lists
                </Button>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              addItemsMutation.isPending ||
              (isCreatingNew && !newListName.trim()) ||
              (!isCreatingNew && !selectedListId)
            }
          >
            {addItemsMutation.isPending ? "Adding..." : "Add Items"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
