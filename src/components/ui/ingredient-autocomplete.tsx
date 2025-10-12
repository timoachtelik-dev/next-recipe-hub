"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, ChevronDown, Loader2 } from "lucide-react";
import { parseIngredient, formatIngredient, type ParsedIngredient } from "@/lib/ingredient-parser";

interface Ingredient {
  id: string;
  name: string;
  category?: string;
  aliases?: string[];
}

interface IngredientAutocompleteProps {
  value?: string;
  onChange: (value: string) => void;
  onParsedChange?: (parsed: ParsedIngredient) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showParsedPreview?: boolean;
}

export function IngredientAutocomplete({
  value = "",
  onChange,
  onParsedChange,
  placeholder = "Enter ingredient (e.g., '2 cups flour')",
  className = "",
  disabled = false,
  showParsedPreview = true,
}: IngredientAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [parsedIngredient, setParsedIngredient] = useState<ParsedIngredient | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Parse the current value when it changes
  useEffect(() => {
    if (value) {
      const parsed = parseIngredient(value);
      setParsedIngredient(parsed);
      onParsedChange?.(parsed);
    } else {
      setParsedIngredient(null);
    }
  }, [value, onParsedChange]);

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/ingredients?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const ingredients = await response.json();
        setSuggestions(ingredients);
      }
    } catch (error) {
      console.error("Failed to fetch ingredients:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (isOpen && value) {
      debounceTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [value, isOpen, fetchSuggestions]);

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
    if (value) {
      fetchSuggestions(value);
    }
  };

  // Handle input blur
  const handleBlur = (e: React.FocusEvent) => {
    // Don't close if clicking on dropdown
    if (dropdownRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (ingredient: Ingredient) => {
    const newValue = ingredient.name;
    setIsOpen(false);
    setSelectedIndex(-1);
    onChange(newValue);
    // Ensure the input value is updated immediately
    if (inputRef.current) {
      inputRef.current.value = newValue;
    }
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        setIsOpen(false);
        return;
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          setIsOpen(false);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      case "Tab":
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          e.preventDefault();
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
    }
  };

  // Clear the input
  const handleClear = () => {
    onChange("");
    setParsedIngredient(null);
    onParsedChange?.({ qty: 1, unit: "piece", name: "", raw: "" });
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-20 pl-4"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          )}
          {value && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-900"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <ChevronDown 
            className={`h-4 w-4 text-gray-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`} 
          />
        </div>
      </div>

      {/* Parsed ingredient preview */}
      {showParsedPreview && parsedIngredient && parsedIngredient.name && (
        <div className="mt-2 bg-white flex flex-wrap gap-1">
          {parsedIngredient.qty > 0 && (
            <Badge variant="outline" className="ingredient-badge">
              {parsedIngredient.qty} {parsedIngredient.unit}
            </Badge>
          )}
          <Badge variant="outline" className="ingredient-badge">
            {parsedIngredient.name}
          </Badge>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute bg-white z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.length > 0 ? (
            <div className="py-1">
              {suggestions.map((ingredient, index) => (
                <button
                  key={ingredient.id}
                  type="button"
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none ${
                    index === selectedIndex ? "bg-gray-100 text-gray-900" : ""
                  }`}
                  onClick={() => handleSuggestionSelect(ingredient)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <span>{ingredient.name}</span>
                    {ingredient.category && (
                      <span className="text-xs text-gray-500 capitalize">
                        {ingredient.category}
                      </span>
                    )}
                  </div>
                  {ingredient.aliases && ingredient.aliases.length > 0 && (
                    <div className="text-xs text-gray-500">
                      Also: {ingredient.aliases.slice(0, 2).join(", ")}
                      {ingredient.aliases.length > 2 && "..."}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : value && !isLoading ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No ingredients found. Type to add a new ingredient.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
