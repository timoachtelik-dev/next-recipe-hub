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

import type { RecipeWithDetails, Step } from "@/types";

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

      // Create a completely isolated container for PDF generation
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
        font-size: 14px;
        line-height: 1.4;
      `;

      // Create a clean HTML structure without any CSS classes or modern color functions
      const cleanHTML = createCleanHTMLForPDF(element, recipe);
      tempContainer.innerHTML = cleanHTML;

      document.body.appendChild(tempContainer);

      const canvas = await html2canvas(tempContainer, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 800,
        height: tempContainer.scrollHeight,
        ignoreElements: (element) => {
          // Ignore elements that might have problematic styling
          return element.classList.contains('no-print') || 
                 element.tagName === 'BUTTON' ||
                 element.tagName === 'NAV';
        }
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

  // Helper function to create clean HTML for PDF generation
  const createCleanHTMLForPDF = (element: HTMLElement, recipe: RecipeWithDetails): string => {
    // Extract text content and create a clean structure
    const title = recipe.title;
    const summary = recipe.summary || '';
    const diets = recipe.diets.map(diet => diet.replace('_', ' ')).join(', ');
    const tags = recipe.tags.join(', ');
    const prepTime = recipe.prepMinutes ? `${recipe.prepMinutes} min` : 'N/A';
    const cookTime = recipe.cookMinutes ? `${recipe.cookMinutes} min` : 'N/A';
    const servings = recipe.servings || 'N/A';
    const author = recipe.author.name || recipe.author.email;
    const createdAt = new Date(recipe.createdAt).toLocaleDateString();

    // Build ingredients list
    const ingredientsList = recipe.items.map(item => 
      `<div style="padding: 8px 0; border-bottom: 1px solid #ddd;">
        <strong>${item.qty} ${item.unit} ${item.ingredient.name}</strong>
        ${item.notes ? `<br><span style="color: #666; font-size: 12px;">${item.notes}</span>` : ''}
      </div>`
    ).join('');

    // Build instructions list
    const instructionsList = (recipe.steps as Step[]).map(step => 
      `<div style="margin-bottom: 16px; display: flex; gap: 12px;">
        <div style="width: 32px; height: 32px; background: #f97316; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 14px;">
          ${step.order}
        </div>
        <div style="flex: 1; padding-top: 4px;">
          ${step.text}
        </div>
      </div>`
    ).join('');

    return `
      <div style="max-width: 100%; margin: 0; padding: 0; background: white; color: black;">
        <!-- Title -->
        <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 16px; color: black;">${title}</h1>
        
        <!-- Summary -->
        ${summary ? `<p style="font-size: 16px; margin-bottom: 20px; color: #333; line-height: 1.5;">${summary}</p>` : ''}
        
        <!-- Meta Information -->
        <div style="background: #f5f5f5; padding: 16px; margin-bottom: 24px; border: 1px solid #ddd;">
          <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 12px;">
            <div><strong>Prep Time:</strong> ${prepTime}</div>
            <div><strong>Cook Time:</strong> ${cookTime}</div>
            <div><strong>Servings:</strong> ${servings}</div>
          </div>
          ${diets ? `<div style="margin-bottom: 8px;"><strong>Diets:</strong> ${diets}</div>` : ''}
          ${tags ? `<div><strong>Tags:</strong> ${tags}</div>` : ''}
        </div>
        
        <!-- Ingredients -->
        <h2 style="font-size: 22px; font-weight: bold; margin-bottom: 16px; color: black;">Ingredients</h2>
        <div style="margin-bottom: 32px;">
          ${ingredientsList}
        </div>
        
        <!-- Instructions -->
        <h2 style="font-size: 22px; font-weight: bold; margin-bottom: 16px; color: black;">Instructions</h2>
        <div style="margin-bottom: 32px;">
          ${instructionsList}
        </div>
        
        <!-- Author -->
        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666;">
          <strong>Recipe by:</strong> ${author}<br>
          <strong>Created:</strong> ${createdAt}
        </div>
      </div>
    `;
  };

  return (
    <>
      <div className="space-y-3 mt-6">
        <Button
          variant="secondary"
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
              variant="primary"
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
