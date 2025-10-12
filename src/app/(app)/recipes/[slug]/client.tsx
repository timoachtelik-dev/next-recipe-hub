"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AddToShoppingListDialog } from "@/components/recipe/add-to-shopping-list-dialog";
import { AddToListSuccessDialog } from "@/components/recipe/add-to-list-success-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Share2, Printer, Download } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import type { RecipeWithDetails } from "@/types";

interface RecipePageClientProps {
  recipe: RecipeWithDetails;
}

export function RecipePageClient({ recipe }: RecipePageClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  
  const [isAddToListDialogOpen, setIsAddToListDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [successDialogData, setSuccessDialogData] = useState<{
    listName: string;
    listId: string;
    itemCount: number;
  } | null>(null);

  const isOwner = session?.user?.id === recipe.authorId;

  const deleteRecipeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete recipe");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      toast.success("Recipe deleted successfully!");
      router.push("/recipes");
    },
    onError: (error) => {
      console.error("Error deleting recipe:", error);
      toast.error("Failed to delete recipe. Please try again.");
    },
  });

  const handleAddToListSuccess = (listName: string, listId: string, itemCount: number) => {
    setSuccessDialogData({ listName, listId, itemCount });
    setIsSuccessDialogOpen(true);
  };

  const handleEdit = () => {
    router.push(`/recipes/${recipe.slug}/edit`);
  };

  const handleDelete = async () => {
    await deleteRecipeMutation.mutateAsync();
    setIsDeleteDialogOpen(false);
  };

  // Share functionality using Native Web Share API
  const handleShare = async () => {
    const shareData = {
      title: recipe.title,
      text: recipe.summary || `Check out this delicious recipe: ${recipe.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("Recipe shared successfully!");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Recipe link copied to clipboard!");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast.error("Failed to share recipe. Please try again.");
      }
    }
  };

  // Print functionality
  const handlePrint = () => {
    window.print();
  };

  // PDF download functionality
  const handleDownloadPDF = async () => {
    try {
      toast.loading("Generating PDF...", { id: "pdf-generation" });
      
      const element = document.getElementById('recipe-content');
      if (!element) {
        throw new Error('Recipe content not found');
      }

      // Create a temporary container with simplified styling for PDF generation
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: fixed;
        top: -10000px;
        left: -10000px;
        width: 800px;
        background: white;
        color: black;
        font-family: Arial, sans-serif;
        padding: 20px;
        box-sizing: border-box;
      `;

      // Clone the content and simplify styling
      const clonedContent = element.cloneNode(true) as HTMLElement;
      
      // Remove problematic CSS classes and inline styles
      const removeProblematicStyles = (el: HTMLElement) => {
        // Remove all classes that might contain lab() colors
        el.removeAttribute('class');
        
        // Simplify inline styles
        if (el.style) {
          el.style.removeProperty('background');
          el.style.removeProperty('background-color');
          el.style.removeProperty('color');
          el.style.backgroundColor = 'white';
          el.style.color = 'black';
        }
        
        // Recursively process child elements
        Array.from(el.children).forEach(child => {
          if (child instanceof HTMLElement) {
            removeProblematicStyles(child);
          }
        });
      };

      removeProblematicStyles(clonedContent);
      
      // Add basic styling for readability
      clonedContent.style.cssText = `
        font-family: Arial, sans-serif;
        color: black;
        background: white;
        line-height: 1.4;
      `;

      // Style specific elements
      const styleElements = (el: HTMLElement) => {
        const tagName = el.tagName.toLowerCase();
        
        if (tagName === 'h1') {
          el.style.fontSize = '24px';
          el.style.fontWeight = 'bold';
          el.style.marginBottom = '16px';
        } else if (tagName === 'h2') {
          el.style.fontSize = '20px';
          el.style.fontWeight = 'bold';
          el.style.marginBottom = '12px';
        } else if (tagName === 'p') {
          el.style.marginBottom = '8px';
        } else if (tagName === 'div' && el.className.includes('ingredient-item')) {
          el.style.borderBottom = '1px solid #ccc';
          el.style.padding = '4px 0';
        }
        
        Array.from(el.children).forEach(child => {
          if (child instanceof HTMLElement) {
            styleElements(child);
          }
        });
      };

      styleElements(clonedContent);
      tempContainer.appendChild(clonedContent);
      document.body.appendChild(tempContainer);

      const canvas = await html2canvas(tempContainer, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 800,
        height: tempContainer.scrollHeight,
      });

      // Clean up temporary container
      document.body.removeChild(tempContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${recipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      pdf.save(fileName);
      
      toast.success("PDF downloaded successfully!", { id: "pdf-generation" });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate PDF. Please try again.", { id: "pdf-generation" });
    }
  };

  return (
    <>
      <div className="space-y-3">
        <Button
          className="w-full"
          size="lg"
          onClick={() => setIsAddToListDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add to Shopping List
        </Button>

        {/* Share and Print Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            onClick={handleShare}
            className="w-full"
            title="Share recipe"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="w-full"
            title="Print recipe"
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            className="w-full"
            title="Download PDF"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {isOwner && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleEdit}
              className="w-full"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Recipe
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{recipe.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteRecipeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteRecipeMutation.isPending}
            >
              {deleteRecipeMutation.isPending ? "Deleting..." : "Delete Recipe"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
