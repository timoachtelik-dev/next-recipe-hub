"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { FilterPanel } from "./filter-panel";

function SearchBarContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Scroll to recipes section with search query
      const element = document.getElementById('recipes');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search recipes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="button" variant="outline" onClick={() => setShowFilters(true)}>
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button type="submit">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>
      
      <FilterPanel 
        open={showFilters} 
        onOpenChange={setShowFilters}
        onApplyFilters={() => {
          // Scroll to recipes section when filters are applied
          const element = document.getElementById('recipes');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />
    </div>
  );
}

export function SearchBar() {
  return (
    <Suspense fallback={<div className="h-12 bg-gray-200 rounded animate-pulse" />}>
      <SearchBarContent />
    </Suspense>
  );
}
