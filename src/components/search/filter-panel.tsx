"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Clock, Users, Flame, X } from "lucide-react";

interface FilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  tags: string[];
  diet: string;
  maxTime: number;
  minServings: number;
  maxServings: number;
  maxCalories: number;
}

const DIET_OPTIONS = [
  { value: "vegan", label: "🌱 Vegan", icon: "🌱" },
  { value: "vegetarian", label: "🥗 Vegetarian", icon: "🥗" },
  { value: "gluten_free", label: "🌾 Gluten Free", icon: "🌾" },
  { value: "keto", label: "🥑 Keto", icon: "🥑" },
  { value: "paleo", label: "🍖 Paleo", icon: "🍖" },
  { value: "dairy_free", label: "🥛 Dairy Free", icon: "🥛" },
];

const TAG_OPTIONS = [
  "quick", "easy", "healthy", "comfort", "spicy", "sweet", 
  "savory", "breakfast", "lunch", "dinner", "dessert", "snack"
];

export function FilterPanel({ open, onOpenChange, onApplyFilters, initialFilters }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    tags: [],
    diet: "",
    maxTime: 0,
    minServings: 0,
    maxServings: 0,
    maxCalories: 0,
  });

  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onOpenChange(false);
  };

  const handleClear = () => {
    const clearedFilters = { 
      tags: [], 
      diet: "", 
      maxTime: 0, 
      minServings: 0, 
      maxServings: 0, 
      maxCalories: 0 
    };
    setFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  const activeFiltersCount = 
    filters.tags.length + 
    (filters.diet ? 1 : 0) + 
    (filters.maxTime > 0 ? 1 : 0) +
    (filters.minServings > 0 || filters.maxServings > 0 ? 1 : 0) +
    (filters.maxCalories > 0 ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[400px] overflow-y-auto">
        <SheetHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-2xl font-bold">Filters</SheetTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="rounded-full">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button 
              onClick={handleClear} 
              variant="link" 
              size="sm"
              className="w-full justify-start"
            >
              <X className="size-4 mr-2" />
              Clear all filters
            </Button>
          )}
        </SheetHeader>
        
        <div className="space-y-8 p-6">
          {/* Diet */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span>🥗</span> Diet Preferences
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {DIET_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    diet: prev.diet === option.value ? "" : option.value
                  }))}
                  className={`
                    relative flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all
                    ${filters.diet === option.value 
                      ? 'border-orange-500 bg-orange-50 text-orange-700' 
                      : 'border-gray-200 hover:border-gray-300 bg-baby-powder'
                    }
                  `}
                >
                  <span className="text-xl">{option.icon}</span>
                  <span className="text-sm font-medium">
                    {option.label.split(' ')[1]}
                  </span>
                  {filters.diet === option.value && (
                    <div className="absolute -top-1 -right-1 size-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span>🏷️</span> Recipe Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => (
                <Badge
                  key={tag}
                  variant={filters.tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1.5 text-sm hover:scale-105 transition-transform"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Max Time */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Clock className="size-5 text-orange-600" />
                Cooking Time
              </h3>
              <span className="text-sm font-medium text-orange-600">
                {filters.maxTime > 0 ? `≤ ${filters.maxTime} min` : "Any"}
              </span>
            </div>
            <Slider
              value={[filters.maxTime]}
              onValueChange={([value]) => setFilters(prev => ({ ...prev, maxTime: value }))}
              max={180}
              step={15}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Quick</span>
              <span>Medium</span>
              <span>Long</span>
            </div>
          </div>

          {/* Servings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Users className="size-5 text-orange-600" />
                Servings
              </h3>
              <span className="text-sm font-medium text-orange-600">
                {filters.minServings > 0 || filters.maxServings > 0
                  ? `${filters.minServings || 1}-${filters.maxServings || "12+"}`
                  : "Any"}
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Minimum</label>
                <Slider
                  value={[filters.minServings]}
                  onValueChange={([value]) => setFilters(prev => ({ ...prev, minServings: value }))}
                  max={12}
                  step={1}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Maximum</label>
                <Slider
                  value={[filters.maxServings]}
                  onValueChange={([value]) => setFilters(prev => ({ ...prev, maxServings: value }))}
                  max={12}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Calories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Flame className="size-5 text-orange-600" />
                Max Calories
              </h3>
              <span className="text-sm font-medium text-orange-600">
                {filters.maxCalories > 0 ? `≤ ${filters.maxCalories} kcal` : "Any"}
              </span>
            </div>
            <Slider
              value={[filters.maxCalories]}
              onValueChange={([value]) => setFilters(prev => ({ ...prev, maxCalories: value }))}
              max={1000}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Light</span>
              <span>Moderate</span>
              <span>Hearty</span>
            </div>
          </div>
        </div>

        {/* Fixed bottom action bar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-baby-powder border-t shadow-lg">
          <div className="flex gap-3 max-w-[400px] ml-auto">
            <Button 
              onClick={handleClear} 
              variant="outline" 
              className="flex-1"
              disabled={activeFiltersCount === 0}
            >
              Clear
            </Button>
            <Button variant="primary" onClick={handleApply} className="flex-1">
              Show Results
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
