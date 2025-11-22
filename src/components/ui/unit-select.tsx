"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface Unit {
  id: string;
  label: string;
  category: string;
}

interface UnitSelectProps {
  value: string;
  onChange: (unitId: string) => void;
  disabled?: boolean;
  className?: string;
}

export function UnitSelect({ value, onChange, disabled = false, className = "" }: UnitSelectProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUnits() {
      try {
        const response = await fetch("/api/units");
        if (response.ok) {
          const data = await response.json();
          setUnits(data);
        }
      } catch (error) {
        console.error("Failed to fetch units:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUnits();
  }, []);

  const selectedUnit = units.find(u => u.id === value);
  
  // Group units by category
  const groupedUnits = units.reduce((acc, unit) => {
    if (!acc[unit.category]) acc[unit.category] = [];
    acc[unit.category].push(unit);
    return acc;
  }, {} as Record<string, Unit[]>);

  const categoryOrder = ["volume", "weight", "count", "special", "other"];
  const categoryLabels: Record<string, string> = {
    volume: "Volume",
    weight: "Weight",
    count: "Count",
    special: "Special",
    other: "Other",
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        type="button"
        variant="outline"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className="w-full justify-between h-10"
      >
        <span className="truncate">{selectedUnit?.label || "Select unit"}</span>
        <ChevronDown className="size-4 opacity-50" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 w-full mt-1 bg-baby-powder border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {categoryOrder.map(category => {
              const categoryUnits = groupedUnits[category];
              if (!categoryUnits || categoryUnits.length === 0) return null;
              
              return (
                <div key={category}>
                  <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                    {categoryLabels[category] || category}
                  </div>
                  {categoryUnits.map(unit => (
                    <button
                      key={unit.id}
                      type="button"
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                        value === unit.id ? "bg-orange-50 text-orange-700 font-medium" : ""
                      }`}
                      onClick={() => {
                        onChange(unit.id);
                        setIsOpen(false);
                      }}
                    >
                      {unit.label}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

