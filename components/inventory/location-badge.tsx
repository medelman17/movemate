"use client"

import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import type { Location } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LocationBadgeProps {
  /** The location object from the joined query */
  location: Location | null | undefined
  /** Fallback text location if no location_id (legacy data) */
  fallbackText?: string | null
  /** Whether to show the icon (default: true) */
  showIcon?: boolean
  /** Size variant */
  size?: "sm" | "md"
  /** Additional class names */
  className?: string
}

/**
 * Displays a location with its icon, falling back to text if no structured location.
 * Handles unassigned items gracefully.
 */
export function LocationBadge({
  location,
  fallbackText,
  showIcon = true,
  size = "md",
  className,
}: LocationBadgeProps) {
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-xs"

  // If we have a structured location, use it
  if (location) {
    return (
      <Badge variant="outline" className={cn("gap-1", sizeClasses, className)}>
        {showIcon && <span className="shrink-0">{location.icon || "📍"}</span>}
        <span className="truncate">{location.name}</span>
      </Badge>
    )
  }

  // Fallback to legacy text location
  if (fallbackText) {
    return (
      <Badge variant="outline" className={cn("gap-1", sizeClasses, className)}>
        {showIcon && <MapPin className="h-3 w-3 shrink-0" />}
        <span className="truncate">{fallbackText}</span>
      </Badge>
    )
  }

  // Unassigned
  return (
    <Badge variant="secondary" className={cn("gap-1 text-muted-foreground", sizeClasses, className)}>
      {showIcon && <MapPin className="h-3 w-3 shrink-0" />}
      <span>Unassigned</span>
    </Badge>
  )
}
