"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { CardContent } from "@/components/ui/card"
import { SwipeableCard } from "@/components/ui/swipeable-card"
import { Edit, Trash2, Package, Ruler, Weight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { ItemWithLocation } from "@/lib/types"
import { EditItemDialog } from "./edit-item-dialog"

interface ItemMobileCardProps {
  item: ItemWithLocation
  onUpdate: () => void
  isSelected?: boolean
  onSelectionChange?: (id: string, selected: boolean) => void
}

export function ItemMobileCard({ item, onUpdate }: ItemMobileCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return

    setIsDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("items").delete().eq("id", item.id)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error("Error deleting item:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const dimensions =
    item.length && item.width && item.height
      ? `${item.length.toFixed(2)} × ${item.width.toFixed(2)} × ${item.height.toFixed(2)}"`
      : null

  const leftActions = [
    {
      icon: <Edit className="h-5 w-5" />,
      label: "Edit",
      onClick: () => setIsEditOpen(true),
      className: "bg-blue-500",
    },
  ]

  const rightActions = [
    {
      icon: <Trash2 className="h-5 w-5" />,
      label: "Delete",
      onClick: handleDelete,
      className: "bg-destructive",
    },
  ]

  return (
    <>
      <SwipeableCard
        leftActions={leftActions}
        rightActions={rightActions}
        disabled={isDeleting}
      >
        <CardContent className="p-3 sm:p-4 border rounded-xl bg-card">
          <div>
            <h3 className="font-semibold text-sm leading-snug mb-0.5">{item.name}</h3>
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2.5">{item.description}</p>
            )}

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-2.5">
              <div className="flex items-center gap-1.5 text-xs">
                <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Qty:</span>
                <span className="font-medium">{item.quantity}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs min-w-0">
                <span className="shrink-0">{item.location_obj?.icon || "📍"}</span>
                <span className="truncate font-medium">
                  {item.location_obj?.name || item.location || "Unassigned"}
                </span>
              </div>
              {dimensions && (
                <div className="flex items-center gap-1.5 text-xs col-span-2">
                  <Ruler className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium font-mono text-[11px]">{dimensions}</span>
                </div>
              )}
              {item.weight && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Weight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium">{item.weight.toFixed(2)} lbs</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-xs px-2 py-0.5 h-5">
                {item.category}
              </Badge>
              <Badge variant={item.is_packed ? "default" : "secondary"} className="text-xs px-2 py-0.5 h-5">
                {item.is_packed ? "Packed" : "Not Packed"}
              </Badge>
              {item.is_fragile && (
                <Badge variant="outline" className="text-xs px-2 py-0.5 h-5">
                  Fragile
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </SwipeableCard>

      <EditItemDialog item={item} open={isEditOpen} onOpenChange={setIsEditOpen} onUpdate={onUpdate} />
    </>
  )
}
