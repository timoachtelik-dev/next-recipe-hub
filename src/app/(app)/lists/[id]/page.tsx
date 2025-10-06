"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ListItemRow } from "@/components/list/list-item-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ShoppingCart, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function ListPage() {
  const params = useParams();
  const listId = params.id as string;
  const queryClient = useQueryClient();
  const [newItem, setNewItem] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

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
      const response = await fetch(`/api/lists/${listId}/items/${itemId}`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Failed to toggle item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list", listId] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
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
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    },
  });

  const updateListNameMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch(`/api/lists/${listId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error("Failed to update list name");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list", listId] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      setIsEditingName(false);
      toast.success("List name updated");
    },
    onError: () => {
      toast.error("Failed to update list name");
    },
  });

  const handleAddItem = async () => {
    if (!newItem.trim()) return;

    setIsAddingItem(true);
    try {
      const response = await fetch(`/api/lists/${listId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newItem.trim() }),
      });

      if (!response.ok) throw new Error("Failed to add item");

      setNewItem("");
      queryClient.invalidateQueries({ queryKey: ["list", listId] });
      queryClient.invalidateQueries({ queryKey: ["lists"] });
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleStartEdit = () => {
    setEditedName(list.name);
    setIsEditingName(true);
  };

  const handleSaveEdit = () => {
    if (!editedName.trim()) return;
    updateListNameMutation.mutate(editedName.trim());
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName("");
  };

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
        {/* List Name with Edit */}
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="h-6 w-6 text-orange-600 flex-shrink-0" />
          {isEditingName ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && editedName.trim()) {
                    handleSaveEdit();
                  } else if (e.key === "Escape") {
                    handleCancelEdit();
                  }
                }}
                className="text-xl font-bold"
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editedName.trim() || updateListNameMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={updateListNameMutation.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {list.name}
              </h1>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleStartEdit}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Edit list name"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Add Item Form */}
        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Add new item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && newItem.trim() && !isAddingItem) {
                handleAddItem();
              }
            }}
            disabled={isAddingItem}
          />
          <Button 
            onClick={handleAddItem}
            disabled={!newItem.trim() || isAddingItem}
          >
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
