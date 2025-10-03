"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

interface FilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters: (filters: FilterState) => void;
}

interface FilterState {
  tags: string[];
  diet: string;
  maxTime: number;
}

const DIET_OPTIONS = [
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "gluten_free", label: "Gluten Free" },
  { value: "keto", label: "Keto" },
  { value: "paleo", label: "Paleo" },
  { value: "dairy_free", label: "Dairy Free" },
];

const TAG_OPTIONS = [
  "quick", "easy", "healthy", "comfort", "spicy", "sweet", 
  "savory", "breakfast", "lunch", "dinner", "dessert", "snack"
];

export function FilterPanel({ open, onOpenChange, onApplyFilters }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    tags: [],
    diet: "",
    maxTime: 0,
  });

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
    setFilters({ tags: [], diet: "", maxTime: 0 });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-80">
        <SheetHeader>
          <SheetTitle>Filter Recipes</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Diet */}
          <div>
            <h3 className="font-medium mb-3">Diet</h3>
            <div className="space-y-2">
              {DIET_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={filters.diet === option.value}
                    onCheckedChange={(checked) => 
                      setFilters(prev => ({ 
                        ...prev, 
                        diet: checked ? option.value : "" 
                      }))
                    }
                  />
                  <label htmlFor={option.value} className="text-sm">
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="font-medium mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => (
                <Badge
                  key={tag}
                  variant={filters.tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Max Time */}
          <div>
            <h3 className="font-medium mb-3">
              Max Time: {filters.maxTime > 0 ? `${filters.maxTime} min` : "No limit"}
            </h3>
            <Slider
              value={[filters.maxTime]}
              onValueChange={([value]) => setFilters(prev => ({ ...prev, maxTime: value }))}
              max={180}
              step={15}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 min</span>
              <span>3 hours</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-8">
          <Button onClick={handleClear} variant="outline" className="flex-1">
            Clear
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
