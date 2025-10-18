"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShoppingCart, ChefHat, Eye } from "lucide-react";

interface AddToListSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listName: string;
  listId: string;
  itemCount: number;
}

export function AddToListSuccessDialog({
  isOpen,
  onClose,
  listName,
  listId,
  itemCount
}: AddToListSuccessDialogProps) {
  const handleViewList = () => {
    window.location.href = `/lists/${listId}`;
  };

  const handleBrowseRecipes = () => {
    window.location.href = "/recipes";
  };

  const handleStayHere = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <ShoppingCart className="h-5 w-5" />
            Items Added Successfully!
          </DialogTitle>
          <DialogDescription>
            {itemCount} ingredient{itemCount !== 1 ? 's' : ''} from the recipe have been added to &quot;{listName}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 text-green-800">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span className="font-medium">Ready for shopping!</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Your shopping list &quot;{listName}&quot; now contains {itemCount} new item{itemCount !== 1 ? 's' : ''}.
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <div className="grid grid-cols-1 gap-2 w-full">
            <Button
              onClick={handleViewList}
              className="w-full justify-start"
              variant="secondary"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              View Shopping List
            </Button>

            <Button
              onClick={handleBrowseRecipes}
              className="w-full justify-start"
              variant="outline"
            >
              <ChefHat className="h-4 w-4 mr-2" />
              Browse More Recipes
            </Button>

            <Button
              onClick={handleStayHere}
              className="w-full justify-start"
              variant="outline"
            >
              <Eye className="h-4 w-4 mr-2" />
              Stay on Recipe
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
