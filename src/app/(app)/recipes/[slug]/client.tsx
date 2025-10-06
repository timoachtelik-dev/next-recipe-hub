"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddToShoppingListDialog } from "@/components/recipe/add-to-shopping-list-dialog";
import { AddToListSuccessDialog } from "@/components/recipe/add-to-list-success-dialog";
import { Plus } from "lucide-react";

import type { RecipeWithDetails } from "@/types";

interface RecipePageClientProps {
  recipe: RecipeWithDetails;
}

export function RecipePageClient({ recipe }: RecipePageClientProps) {
  const [isAddToListDialogOpen, setIsAddToListDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [successDialogData, setSuccessDialogData] = useState<{
    listName: string;
    listId: string;
    itemCount: number;
  } | null>(null);

  const handleAddToListSuccess = (listName: string, listId: string, itemCount: number) => {
    setSuccessDialogData({ listName, listId, itemCount });
    setIsSuccessDialogOpen(true);
  };

  return (
    <>
      <Button
        className="w-full mt-4"
        size="lg"
        onClick={() => setIsAddToListDialogOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add to Shopping List
      </Button>

      <AddToShoppingListDialog
        isOpen={isAddToListDialogOpen}
        onClose={() => setIsAddToListDialogOpen(false)}
        onSuccess={handleAddToListSuccess}
        recipeItems={recipe.items}
        recipeTitle={recipe.title}
      />

      {successDialogData && (
        <AddToListSuccessDialog
          isOpen={isSuccessDialogOpen}
          onClose={() => setIsSuccessDialogOpen(false)}
          listName={successDialogData.listName}
          listId={successDialogData.listId}
          itemCount={successDialogData.itemCount}
        />
      )}
    </>
  );
}
