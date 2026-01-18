"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IngredientInput } from "@/components/ui/ingredient-input";
import { createRecipeSchema, type CreateRecipeInput, type Step, type RecipeItem } from "@/lib/validators";
import { RecipeWithDetails } from "@/types";
import { Plus, X, Save, Loader2, Clock, Users, ChefHat, Utensils, Tag } from "lucide-react";
import { toast } from "sonner";

type InitialFormItem = CreateRecipeInput["items"][number] & {
  ingredientName?: string;
};

interface RecipeFormProps {
  initialData?: Partial<CreateRecipeInput>;
  onSubmit: (data: CreateRecipeInput) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  ingredientNameMap?: Record<string, string>;
}

// Delete button component for removing items
function DeleteButton({ 
  onClick, 
  disabled 
}: { 
  onClick: () => void; 
  disabled: boolean;
}) {
  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      onClick={onClick}
      disabled={disabled}
    >
      <X className="size-4" />
    </Button>
  );
}

interface IngredientInput {
  qty: number;
  unitId: string;
  ingredientId: string;
  ingredientName: string;
}

export function RecipeForm({ 
  initialData, 
  onSubmit, 
  isSubmitting = false, 
  submitLabel = "Create Recipe",
  ingredientNameMap,
}: RecipeFormProps) {
  const [ingredientInputs, setIngredientInputs] = useState<IngredientInput[]>([
    { qty: 1, unitId: "pieces", ingredientId: "", ingredientName: "" }
  ]);
  
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateRecipeInput>({
    resolver: zodResolver(createRecipeSchema) as any,
    defaultValues: {
      title: "",
      summary: "",
      steps: [{ order: 1, text: "" }],
      heroImage: "",
      prepMinutes: undefined,
      cookMinutes: undefined,
      servings: 2,
      diets: [],
      tags: [],
      items: [],
      ...initialData,
    },
    mode: "onChange",
  });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control,
    name: "steps",
  });

  const watchedTags = watch("tags");
  const watchedDiets = watch("diets");

  // Initialize ingredient inputs if we have initial data
  useEffect(() => {
    if (initialData?.items && initialData.items.length > 0) {
      const itemsWithNames = initialData.items as InitialFormItem[];
      const inputs = itemsWithNames.map(item => ({
        qty: item.qty,
        unitId: item.unitId,
        ingredientId: item.ingredientId,
        ingredientName:
          item.ingredientName ||
          ingredientNameMap?.[item.ingredientId] ||
          item.ingredientId.replace(/_/g, " "),
      }));
      setIngredientInputs(inputs.length > 0 ? inputs : [{ qty: 1, unitId: "pieces", ingredientId: "", ingredientName: "" }]);
    }
  }, [initialData, ingredientNameMap]);

  const addTag = (tag: string) => {
    if (tag && !watchedTags.includes(tag)) {
      setValue("tags", [...watchedTags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue("tags", watchedTags.filter(tag => tag !== tagToRemove));
  };

  const addDiet = (diet: string) => {
    if (diet && !watchedDiets.includes(diet)) {
      setValue("diets", [...watchedDiets, diet]);
    }
  };

  const removeDiet = (dietToRemove: string) => {
    setValue("diets", watchedDiets.filter(diet => diet !== dietToRemove));
  };

  // Update form when ingredient inputs change
  useEffect(() => {
    const items: RecipeItem[] = ingredientInputs
      .filter(input => input.ingredientId && input.qty > 0)
      .map(input => ({
        ingredientId: input.ingredientId,
        qty: input.qty,
        unitId: input.unitId,
        notes: "",
      }));
    
    setValue("items", items);
  }, [ingredientInputs, setValue]);

  const handleQtyChange = (index: number, qty: number) => {
    const newInputs = [...ingredientInputs];
    newInputs[index] = { ...newInputs[index], qty };
    setIngredientInputs(newInputs);
  };

  const handleUnitChange = (index: number, unitId: string) => {
    const newInputs = [...ingredientInputs];
    newInputs[index] = { ...newInputs[index], unitId };
    setIngredientInputs(newInputs);
  };

  const handleIngredientChange = (index: number, name: string, ingredientId: string, defaultUnitId?: string) => {
    const newInputs = [...ingredientInputs];
    newInputs[index] = {
      ...newInputs[index],
      ingredientId,
      ingredientName: name,
      unitId: defaultUnitId || newInputs[index].unitId,
    };
    setIngredientInputs(newInputs);
  };

  const addIngredient = () => {
    setIngredientInputs([
      ...ingredientInputs,
      { qty: 1, unitId: "pieces", ingredientId: "", ingredientName: "" }
    ]);
  };

  const removeIngredient = (index: number) => {
    if (ingredientInputs.length > 1) {
      const newInputs = ingredientInputs.filter((_, i) => i !== index);
      setIngredientInputs(newInputs);
    }
  };

  const onFormSubmit = async (data: CreateRecipeInput) => {
    try {
      // Clean up empty steps and items
      const cleanedData = {
        ...data,
        steps: data.steps.filter(step => step.text.trim() !== ""),
        items: data.items.filter(item => item.ingredientId !== ""),
        heroImage: data.heroImage || undefined,
        tags: data.tags.filter(tag => tag.trim() !== ""),
        diets: data.diets.filter(diet => diet.trim() !== ""),
      };

      await onSubmit(cleanedData);
      toast.success("Recipe saved successfully!");
    } catch (error) {
      toast.error("Failed to save recipe. Please try again.");
      console.error("Recipe submission error:", error);
    }
  };

  const commonDiets = ["vegan", "vegetarian", "gluten_free", "dairy_free", "keto", "paleo"];
  const commonTags = ["quick", "healthy", "comfort", "spicy", "sweet", "savory", "breakfast", "lunch", "dinner", "dessert"];

  return (
    <form onSubmit={handleSubmit(onFormSubmit as any)} className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-gray-900">Create Your Recipe</h2>
        <p className="text-gray-500 dark:text-dark-gray-500">Share your culinary masterpiece with the community</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="recipe-card border-gray-200 dark:border-dark-border">
            <CardHeader className="bg-yellow-50 dark:bg-yellow-950/30">
              <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-200">
                <ChefHat className="size-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium mb-2">Recipe Title *</label>
                <Input
                  {...register("title")}
                  placeholder="Enter recipe title"
                  className={errors.title ? "border-red-300" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Summary</label>
                <textarea
                  {...register("summary")}
                  placeholder="Brief description of the recipe"
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-300 focus:border-gray-300 bg-transparent resize-none"
                />
                {errors.summary && (
                  <p className="text-sm text-red-500 mt-1">{errors.summary.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hero Image URL</label>
                <Input
                  {...register("heroImage")}
                  placeholder="https://example.com/image.jpg"
                  className={errors.heroImage ? "border-red-500" : ""}
                />
                {errors.heroImage && (
                  <p className="text-sm text-red-500 mt-1">{errors.heroImage.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timing & Servings */}
          <Card className="recipe-card border-gray-200 dark:border-dark-border">
            <CardHeader className="bg-blue-50 dark:bg-blue-950/30">
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
                <Clock className="size-5" />
                Cooking Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Prep Time (min)</label>
                  <Input
                    type="number"
                    {...register("prepMinutes", { valueAsNumber: true })}
                    placeholder="15"
                    min="0"
                    className="text-center"
                  />
                  {errors.prepMinutes && (
                    <p className="text-sm text-red-500 mt-1">{errors.prepMinutes.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cook Time (min)</label>
                  <Input
                    type="number"
                    {...register("cookMinutes", { valueAsNumber: true })}
                    placeholder="30"
                    min="0"
                    className="text-center"
                  />
                  {errors.cookMinutes && (
                    <p className="text-sm text-red-500 mt-1">{errors.cookMinutes.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Servings *</label>
                  <Input
                    type="number"
                    {...register("servings", { valueAsNumber: true })}
                    placeholder="4"
                    min="1"
                    className="text-center"
                  />
                  {errors.servings && (
                    <p className="text-sm text-red-500 mt-1">{errors.servings.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card className="recipe-card border-gray-200 dark:border-dark-border">
            <CardHeader className="bg-pink-50 dark:bg-pink-950/30">
              <CardTitle className="flex items-center gap-2 text-pink-700 dark:text-pink-200">
                <Utensils className="size-5" />
                Ingredients
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ingredientInputs.map((input, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <IngredientInput
                      qty={input.qty}
                      unitId={input.unitId}
                      ingredientName={input.ingredientName}
                      onQtyChange={(qty) => handleQtyChange(index, qty)}
                      onUnitChange={(unitId) => handleUnitChange(index, unitId)}
                      onIngredientChange={(name, ingredientId, defaultUnitId) => 
                        handleIngredientChange(index, name, ingredientId, defaultUnitId)
                      }
                    />
                  </div>
                  <DeleteButton
                    onClick={() => removeIngredient(index)}
                    disabled={ingredientInputs.length === 1}
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addIngredient}
                className="w-full border-dashed"
              >
                <Plus className="size-4 mr-2" />
                Add Ingredient
              </Button>

              {errors.items && (
                <p className="text-sm text-red-500">{errors.items.message}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Instructions */}
          <Card className="recipe-card border-gray-200 dark:border-dark-border">
            <CardHeader className="bg-green-50 dark:bg-green-950/30">
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-200">
                <ChefHat className="size-5" />
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stepFields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 p-4 border border-gray-200 dark:border-green-900/50 rounded-lg bg-green-50/50 dark:bg-green-950/20"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-900">Step {index + 1}</h4>
                    <DeleteButton
                      onClick={() => removeStep(index)}
                      disabled={stepFields.length === 1}
                    />
                  </div>

                  <textarea
                    {...register(`steps.${index}.text`)}
                    placeholder="Describe this step..."
                    rows={3}
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-gray-300 focus:border-gray-300 bg-transparent resize-none ${
                      errors.steps?.[index]?.text ? "border-red-500" : "border-gray-200 dark:border-dark-border"
                    }`}
                  />
                  {errors.steps?.[index]?.text && (
                      <p className="text-sm text-red-500">{errors.steps[index]?.text?.message}</p>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => appendStep({ order: stepFields.length + 1, text: "" })}
                className="w-full border-dashed"
              >
                <Plus className="size-4 mr-2" />
                Add Step
              </Button>

              {errors.steps && (
                <p className="text-sm text-red-500">{errors.steps.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Tags and Diets */}
          <Card className="recipe-card border-gray-200 dark:border-dark-border">
            <CardHeader className="bg-purple-50 dark:bg-purple-950/30">
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-200">
                <Tag className="size-5" />
                Tags & Dietary Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium mb-3">Tags</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {watchedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200 cursor-pointer text-sm px-3 py-1 dark:bg-purple-900/30 dark:text-purple-100 dark:border-purple-500/50 dark:hover:bg-purple-900/45"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} <X className="size-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {commonTags.filter(tag => !watchedTags.includes(tag)).map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTag(tag)}
                      className="text-sm h-9 px-3"
                    >
                      <Plus className="size-3 mr-1" />
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Dietary Information</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {watchedDiets.map((diet) => (
                    <Badge
                      key={diet}
                      variant="outline"
                      className="bg-pink-100 text-pink-900 border-pink-300 hover:bg-pink-200 cursor-pointer text-sm px-3 py-1 dark:bg-pink-900/30 dark:text-pink-100 dark:border-pink-500/50 dark:hover:bg-pink-900/45"
                      onClick={() => removeDiet(diet)}
                    >
                      {diet.replace("_", " ")} <X className="size-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {commonDiets.filter(diet => !watchedDiets.includes(diet)).map((diet) => (
                    <Button
                      key={diet}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addDiet(diet)}
                      className="text-sm h-9 px-3"
                    >
                      <Plus className="size-3 mr-1" />
                      {diet.replace("_", " ")}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Button */}
      <div className="sticky bottom-4 flex justify-center">
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          size="lg"
          variant="primary"
          className="min-w-48 shadow-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-5 mr-2 animate-spin" />
              Saving Recipe...
            </>
          ) : (
            <>
              <Save className="size-5 mr-2" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
