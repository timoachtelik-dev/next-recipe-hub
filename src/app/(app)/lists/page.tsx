"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  ShoppingCart,
  MoreVertical,
  Eye,
  Copy,
  Trash2,
  Calendar,
  Package,
  ListChecks,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import type { ShoppingListWithItems } from "@/types";

type SortOption = "date" | "name" | "items";

export default function ListsPage() {
  const { status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");

  // Fetch all lists
  const { data: lists = [], isLoading } = useQuery<ShoppingListWithItems[]>({
    queryKey: ["lists"],
    queryFn: async () => {
      const response = await fetch("/api/lists");
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/signin");
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch lists");
      }
      return response.json();
    },
    enabled: status !== "loading",
  });

  // Create list mutation
  const createListMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error("Failed to create list");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      setIsCreateDialogOpen(false);
      setNewListName("");
      toast.success("List created successfully");
      router.push(`/lists/${data.id}`);
    },
    onError: () => {
      toast.error("Failed to create list");
    },
  });

  // Delete list mutation
  const deleteListMutation = useMutation({
    mutationFn: async (listId: string) => {
      const response = await fetch(`/api/lists/${listId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete list");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      toast.success("List deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete list");
    },
  });

  // Duplicate list mutation
  const duplicateListMutation = useMutation({
    mutationFn: async (list: ShoppingListWithItems) => {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${list.name} (Copy)` }),
      });
      if (!response.ok) throw new Error("Failed to duplicate list");
      const newList = await response.json();

      // Add all items from original list
      if (list.items.length > 0) {
        const itemsResponse = await fetch(`/api/lists/${newList.id}/items/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: list.items.map((item) => ({
              ingredientId: item.ingredientId,
              qty: item.qty,
              unit: item.unit,
              notes: item.notes,
            })),
          }),
        });
        if (!itemsResponse.ok) throw new Error("Failed to copy items");
      }
      return newList;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      toast.success("List duplicated successfully");
    },
    onError: () => {
      toast.error("Failed to duplicate list");
    },
  });

  // Filter and sort lists
  const filteredAndSortedLists = useMemo(() => {
    let result = [...lists];

    // Filter by search query
    if (searchQuery.trim()) {
      result = result.filter((list) =>
        list.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "items":
          return b.items.length - a.items.length;
        case "date":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return result;
  }, [lists, searchQuery, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalLists = lists.length;
    const totalItems = lists.reduce((sum, list) => sum + list.items.length, 0);
    const recentlyModified = lists.filter(
      (list) => new Date().getTime() - new Date(list.updatedAt).getTime() < 86400000
    ).length; // 24 hours

    return { totalLists, totalItems, recentlyModified };
  }, [lists]);

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    createListMutation.mutate(newListName.trim());
  };

  // Loading state
  if (isLoading || status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-64 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Shopping Lists
            </h1>
            <p className="text-gray-600">
              Manage and organize your shopping lists
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                New List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Shopping List</DialogTitle>
                <DialogDescription>
                  Give your shopping list a name to get started.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="e.g., Weekly Groceries"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && newListName.trim()) {
                      handleCreateList();
                    }
                  }}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setNewListName("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateList}
                  disabled={!newListName.trim() || createListMutation.isPending}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {createListMutation.isPending ? "Creating..." : "Create List"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics */}
        {lists.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <ListChecks className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Lists</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalLists}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Modified Today</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.recentlyModified}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filter */}
        {lists.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search lists by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort by: {sortBy === "date" ? "Date" : sortBy === "name" ? "Name" : "Items"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setSortBy("date")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Last Updated
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSortBy("name")}>
                  <ListChecks className="h-4 w-4 mr-2" />
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setSortBy("items")}>
                  <Package className="h-4 w-4 mr-2" />
                  Item Count
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Lists Grid */}
        {filteredAndSortedLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedLists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onDelete={() => deleteListMutation.mutate(list.id)}
                onDuplicate={() => duplicateListMutation.mutate(list)}
                onView={() => router.push(`/lists/${list.id}`)}
              />
            ))}
          </div>
        ) : lists.length > 0 ? (
          <EmptySearchState onClearSearch={() => setSearchQuery("")} />
        ) : (
          <EmptyState onCreateList={() => setIsCreateDialogOpen(true)} />
        )}
      </div>
    </div>
  );
}

// List Card Component
interface ListCardProps {
  list: ShoppingListWithItems;
  onDelete: () => void;
  onDuplicate: () => void;
  onView: () => void;
}

function ListCard({ list, onDelete, onDuplicate, onView }: ListCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const checkedCount = list.items.filter((item) => item.checked).length;
  const totalCount = list.items.length;
  const completionPercentage = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString();
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1" onClick={onView}>
              <ShoppingCart className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-orange-600 transition-colors">
                {list.name}
              </h3>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteDialogOpen(true);
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent onClick={onView}>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {totalCount} {totalCount === 1 ? "item" : "items"}
              </span>
              {totalCount > 0 && (
                <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                  {checkedCount}/{totalCount} checked
                </Badge>
              )}
            </div>

            {totalCount > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>Updated {formatDate(list.updatedAt)}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            onClick={onView}
            className="w-full bg-orange-600 hover:bg-orange-700"
            size="sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            View List
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Shopping List</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{list.name}&quot;? This action cannot be undone and will remove all items in this list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete();
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Empty State Component
function EmptyState({ onCreateList }: { onCreateList: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        <ShoppingCart className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No shopping lists yet
      </h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        Create your first shopping list to start organizing your groceries and ingredients.
      </p>
      <Button
        onClick={onCreateList}
        className="bg-orange-600 hover:bg-orange-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Your First List
      </Button>
    </div>
  );
}

// Empty Search State Component
function EmptySearchState({ onClearSearch }: { onClearSearch: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        <Search className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No lists found
      </h3>
      <p className="text-gray-600 mb-6">
        No shopping lists match your search criteria.
      </p>
      <Button onClick={onClearSearch} variant="outline">
        Clear Search
      </Button>
    </div>
  );
}

