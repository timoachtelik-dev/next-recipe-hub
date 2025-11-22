"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { UnitSelect } from "@/components/ui/unit-select";
import { Search } from "lucide-react";

interface Ingredient {
  id: string;
  name: string;
  category?: string;
  defaultUnitId?: string;
  aliases?: string[];
}

interface IngredientInputProps {
  qty: number;
  unitId: string;
  ingredientName: string;
  onQtyChange: (qty: number) => void;
  onUnitChange: (unitId: string) => void;
  onIngredientChange: (name: string, ingredientId: string, defaultUnitId?: string) => void;
  disabled?: boolean;
  className?: string;
}

export function IngredientInput({
  qty,
  unitId,
  ingredientName,
  onQtyChange,
  onUnitChange,
  onIngredientChange,
  disabled = false,
  className = "",
}: IngredientInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState(ingredientName);
  const [isFocused, setIsFocused] = useState(false);

  // Sync search query with ingredientName prop
  useEffect(() => {
    setSearchQuery(ingredientName);
  }, [ingredientName]);

  // Fetch suggestions
  useEffect(() => {
    const controller = new AbortController();
    
    async function fetchSuggestions() {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/ingredients?q=${encodeURIComponent(searchQuery)}`,
          { signal: controller.signal }
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
          if (isFocused) {
            setIsOpen(true);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Failed to fetch ingredients:", error);
        }
      } finally {
        setIsLoading(false);
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchQuery, isFocused]);

  const handleSuggestionSelect = (ingredient: Ingredient) => {
    setSearchQuery(ingredient.name);
    setIsOpen(false);
    setSelectedIndex(-1);
    
    // Auto-fill unit from ingredient default
    if (ingredient.defaultUnitId) {
      onUnitChange(ingredient.defaultUnitId);
    }
    
    onIngredientChange(ingredient.name, ingredient.id, ingredient.defaultUnitId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className={`grid grid-cols-[80px_120px_1fr] gap-2 ${className}`}>
      {/* Quantity Input */}
      <Input
        type="number"
        value={qty || ""}
        onChange={(e) => onQtyChange(parseFloat(e.target.value) || 0)}
        placeholder="Qty"
        disabled={disabled}
        min="0"
        step="any"
        className="text-center"
      />

      {/* Unit Select */}
      <UnitSelect
        value={unitId}
        onChange={onUnitChange}
        disabled={disabled}
      />

      {/* Ingredient Autocomplete */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              if (suggestions.length > 0) setIsOpen(true);
            }}
            onBlur={(e) => {
              // Don't close if clicking on dropdown
              setIsFocused(false);
              setTimeout(() => setIsOpen(false), 200);
            }}
            placeholder="Search ingredient..."
            disabled={disabled}
            className="pl-9"
          />
        </div>

        {/* Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-baby-powder border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((ingredient, index) => (
              <button
                key={ingredient.id}
                type="button"
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                  index === selectedIndex ? "bg-gray-100" : ""
                }`}
                onClick={() => handleSuggestionSelect(ingredient)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{ingredient.name}</span>
                  {ingredient.defaultUnitId && (
                    <span className="text-xs text-gray-500">
                      default: {ingredient.defaultUnitId}
                    </span>
                  )}
                </div>
                {ingredient.category && (
                  <div className="text-xs text-gray-500 capitalize">
                    {ingredient.category}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
