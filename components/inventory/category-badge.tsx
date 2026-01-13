"use client"

import { Badge } from "@/components/ui/badge"
import { Tag } from "lucide-react"
import type { Category } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CategoryBadgeProps {
  /** The category object from the joined query */
  category: Category | null | undefined
  /** Fallback text category if no category_id (legacy data) */
  fallbackText?: string | null
  /** Whether to show the icon (default: true) */
  showIcon?: boolean
  /** Size variant */
  size?: "sm" | "md"
  /** Additional class names */
  className?: string
}

/**
 * Displays a category with its icon, falling back to text if no structured category.
 * Handles uncategorized items gracefully.
 */
export function CategoryBadge({
  category,
  fallbackText,
  showIcon = true,
  size = "md",
  className,
}: CategoryBadgeProps) {
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-xs"

  // If we have a structured category, use it
  if (category) {
    return (
      <Badge variant="outline" className={cn("gap-1", sizeClasses, className)}>
        {showIcon && <span className="shrink-0">{category.icon || "📦"}</span>}
        <span className="truncate">{category.name}</span>
      </Badge>
    )
  }

  // Fallback to legacy text category
  if (fallbackText) {
    return (
      <Badge variant="outline" className={cn("gap-1", sizeClasses, className)}>
        {showIcon && <Tag className="h-3 w-3 shrink-0" />}
        <span className="truncate">{fallbackText}</span>
      </Badge>
    )
  }

  // Uncategorized
  return (
    <Badge variant="secondary" className={cn("gap-1 text-muted-foreground", sizeClasses, className)}>
      {showIcon && <Tag className="h-3 w-3 shrink-0" />}
      <span>Uncategorized</span>
    </Badge>
  )
}
