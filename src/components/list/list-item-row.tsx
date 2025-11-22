"use client";

import { useState, useRef, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import type { ShoppingListItem } from "@prisma/client";

interface ListItemRowProps {
    item: ShoppingListItem;
    onToggle: (itemId: string) => void;
    onDelete: (itemId: string) => void;
    onUpdate: (itemId: string, text: string) => Promise<void>;
}

export function ListItemRow({ item, onToggle, onDelete, onUpdate }: ListItemRowProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(item.text);
    const [isSaving, setIsSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when entering edit mode
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            // Position cursor at the end
            const length = inputRef.current.value.length;
            inputRef.current.setSelectionRange(length, length);
        }
    }, [isEditing]);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete(item.id);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSave = async () => {
        if (!editText.trim() || editText.trim() === item.text) {
            setIsEditing(false);
            setEditText(item.text);
            return;
        }

        setIsSaving(true);
        try {
            await onUpdate(item.id, editText.trim());
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update item:", error);
            setEditText(item.text); // Revert on error
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
        } else if (e.key === "Escape") {
            setIsEditing(false);
            setEditText(item.text);
        }
    };

    return (
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-baby-powder border-gray-200 hover:bg-gray-50">
            <Checkbox
                checked={item.checked}
                onCheckedChange={() => onToggle(item.id)}
                className="flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <Input
                        ref={inputRef}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        disabled={isSaving}
                        className="h-8 text-sm text-black"
                    />
                ) : (
                    <div 
                        className={`font-medium cursor-pointer hover:text-outline transition-colors ${
                            item.checked ? "line-through text-gray-500" : ""
                        }`}
                        onClick={() => !item.checked && setIsEditing(true)}
                    >
                        {item.text}
                    </div>
                )}
            </div>

            <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
            >
                <Trash2 className="size-4" />
            </Button>
        </div>
    );
}
