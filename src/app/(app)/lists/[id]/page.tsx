"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ListItemRow } from "@/components/list/list-item-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ShoppingCart } from "lucide-react";

export default function ListPage() {
  const params = useParams();
  const listId = params.id as string;
  const queryClient = useQueryClient();
  const [newItem, setNewItem] = useState("");

  const { data: list, isLoading } = useQuery({
    queryKey: ["list", listId],
    queryFn: async () => {
      const response = await fetch(`/api/lists/${listId}`);
      if (!response.ok) throw new Error("Failed to fetch list");
      return response.json();
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/lists/${listId}/items/${itemId}/toggle`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Failed to toggle item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list", listId] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/lists/${listId}/items/${itemId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list", listId] });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            List not found
          </h1>
          <p className="text-gray-600">
            The shopping list you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    );
  }

  const checkedItems = list.items.filter((item: any) => item.checked);
  const uncheckedItems = list.items.filter((item: any) => !item.checked);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="h-6 w-6 text-orange-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {list.name}
          </h1>
        </div>

        {/* Add Item Form */}
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Add new item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && newItem.trim()) {
                // TODO: Implement add item functionality
                setNewItem("");
              }
            }}
          />
          <Button disabled={!newItem.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Unchecked Items */}
        {uncheckedItems.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-900">
              To Buy ({uncheckedItems.length})
            </h2>
            <div className="space-y-2">
              {uncheckedItems.map((item: any) => (
                <ListItemRow
                  key={item.id}
                  item={item}
                  onToggle={toggleItemMutation.mutate}
                  onDelete={deleteItemMutation.mutate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Checked Items */}
        {checkedItems.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-gray-600">
              Completed ({checkedItems.length})
            </h2>
            <div className="space-y-2">
              {checkedItems.map((item: any) => (
                <ListItemRow
                  key={item.id}
                  item={item}
                  onToggle={toggleItemMutation.mutate}
                  onDelete={deleteItemMutation.mutate}
                />
              ))}
            </div>
          </div>
        )}

        {list.items.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Your list is empty
            </h3>
            <p className="text-gray-600">
              Add items to get started with your shopping list.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
