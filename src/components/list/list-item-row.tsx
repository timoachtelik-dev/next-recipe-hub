"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { ShoppingListItem } from "@prisma/client";

interface ListItemRowProps {
    item: ShoppingListItem & {
        ingredient: {
            id: string;
            name: string;
        };
    };
    onToggle: (itemId: string) => void;
    onDelete: (itemId: string) => void;
}

export function ListItemRow({ item, onToggle, onDelete }: ListItemRowProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete(item.id);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
            <Checkbox
                checked={item.checked}
                onCheckedChange={() => onToggle(item.id)}
                className="flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
                <div className={`font-medium ${item.checked ? "line-through text-gray-500" : ""}`}>
                    {item.qty} {item.unit} {item.ingredient.name}
                </div>
                {item.notes && (
                    <div className="text-sm text-gray-600 mt-1">
                        {item.notes}
                    </div>
                )}
            </div>

            <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
