"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Category } from "@/lib/types"
import { createCategory, updateCategory } from "@/app/actions/categories"

interface CategoryEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Category to edit, or null for create mode */
  category: Category | null
  /** Called after successful save */
  onSave: () => void
}

const DEFAULT_ICONS = ["📦", "🪑", "📱", "🍳", "👕", "📚", "🖼️", "🔧", "⚽", "🎮", "🎵", "💊"]

export function CategoryEditModal({
  open,
  onOpenChange,
  category,
  onSave,
}: CategoryEditModalProps) {
  const isEditMode = category !== null
  const [name, setName] = useState("")
  const [icon, setIcon] = useState("📦")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      if (category) {
        setName(category.name)
        setIcon(category.icon || "📦")
      } else {
        setName("")
        setIcon("📦")
      }
      setError(null)
    }
  }, [open, category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError("Name is required")
      return
    }

    if (trimmedName.length > 50) {
      setError("Name must be 50 characters or less")
      return
    }

    setIsLoading(true)
    try {
      if (isEditMode && category) {
        await updateCategory(category.id, {
          name: trimmedName,
          icon: icon || null,
        })
      } else {
        await createCategory({
          name: trimmedName,
          icon: icon || null,
          color: null,
        })
      }
      onSave()
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save category"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Category" : "Add Category"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the category name and icon."
              : "Create a new category to organize your items."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name Input */}
            <div className="grid gap-2">
              <Label htmlFor="category-name">Name *</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Furniture"
                maxLength={50}
                autoFocus
              />
            </div>

            {/* Icon Selection */}
            <div className="grid gap-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`
                      w-10 h-10 text-xl rounded-md border-2 transition-colors
                      flex items-center justify-center
                      ${icon === emoji
                        ? "border-primary bg-primary/10"
                        : "border-transparent hover:border-muted-foreground/30 hover:bg-muted"
                      }
                    `}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Or type a custom emoji:
              </p>
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value.slice(0, 2))}
                placeholder="📦"
                className="w-20 text-center text-xl"
                maxLength={2}
              />
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditMode ? (
                "Save Changes"
              ) : (
                "Create Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
