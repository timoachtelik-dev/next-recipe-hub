"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { RecipeWithDetails } from "@/types";
import { RecipeListView } from "@/components/recipe/recipe-list-view";

export function NavbarSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<RecipeWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch results
  const fetchResults = useCallback(async () => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: debouncedQuery,
        limit: "8",
      });

      const response = await fetch(`/api/recipes?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch recipes");

      const data = await response.json();
      setResults(data.recipes);
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === "Enter") {
        handleSubmit(e);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex === -1 || selectedIndex === results.length) {
          handleSubmit(e);
        } else if (selectedIndex >= 0 && selectedIndex < results.length) {
          router.push(`/recipes/${results[selectedIndex].slug}`);
          setIsOpen(false);
          setQuery("");
          inputRef.current?.blur();
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/recipes?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setQuery("");
      inputRef.current?.blur();
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          ref={inputRef}
          type="search"
          placeholder="Search recipes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-4"
          autoComplete="off"
        />
        {isLoading ? (
          <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4 animate-spin" />
        ) : (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4 pointer-events-none" />
        )}
      </form>

      {/* Results Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-baby-powder rounded-lg shadow-xl border border-gray-200 max-h-[80vh] overflow-y-auto z-50">
          {results.length === 0 && !isLoading && (
            <div className="p-6 text-center text-gray-500">
              <Search className="size-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No recipes found</p>
              <p className="text-xs text-gray-400 mt-1">Try different keywords</p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <RecipeListView 
                recipes={results} 
                variant="compact" 
                onItemClick={handleResultClick}
                selectedIndex={selectedIndex}
              />

              {/* View All Results Link */}
              <Link
                href={`/recipes?q=${encodeURIComponent(query)}`}
                onClick={() => handleResultClick()}
                className={`block p-3 text-center text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors border-t border-gray-100 ${
                  selectedIndex === results.length ? "bg-orange-50" : ""
                }`}
              >
                View all results for &quot;{query}&quot;
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

