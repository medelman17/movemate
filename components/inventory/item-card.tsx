"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreVertical, Trash2, PackageIcon, Weight, Ruler } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { ItemWithLocation } from "@/lib/types"
import { EditItemDialog } from "./edit-item-dialog"
import { LocationBadge } from "./location-badge"

interface ItemCardProps {
  item: ItemWithLocation
  onUpdate: () => void
  isSelected?: boolean
  onSelectionChange?: (id: string, selected: boolean) => void
}

export function ItemCard({ item, onUpdate, isSelected = false, onSelectionChange }: ItemCardProps) {
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

  const handlePackToggle = async (checked: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("items").update({ is_packed: checked }).eq("id", item.id)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error("Error updating item:", error)
    }
  }

  const volume = item.length && item.width && item.height ? (item.length * item.width * item.height).toFixed(2) : null

  return (
    <>
      <Card className={`hover:shadow-md transition-shadow ${isSelected ? "ring-2 ring-primary" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {onSelectionChange && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => onSelectionChange(item.id, checked === true)}
                  className="mt-1"
                  aria-label="Select item"
                />
              )}
              <Checkbox
                checked={item.is_packed}
                onCheckedChange={handlePackToggle}
                className="mt-1"
                aria-label="Mark as packed"
              />
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg line-clamp-1">{item.name}</CardTitle>
                {item.description && (
                  <CardDescription className="line-clamp-2 mt-1">{item.description}</CardDescription>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <PackageIcon className="h-3 w-3" />
              {item.category}
            </Badge>
            <LocationBadge
              location={item.location_obj}
              fallbackText={item.location}
            />
            {item.quantity > 1 && <Badge variant="outline">Qty: {item.quantity}</Badge>}
          </div>

          {(item.weight || volume) && (
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {item.weight && (
                <div className="flex items-center gap-1">
                  <Weight className="h-4 w-4" />
                  <span>{item.weight} lbs</span>
                </div>
              )}
              {volume && (
                <div className="flex items-center gap-1">
                  <Ruler className="h-4 w-4" />
                  <span>
                    {item.length} × {item.width} × {item.height} in ({volume} in³)
                  </span>
                </div>
              )}
            </div>
          )}

          {item.notes && <p className="text-sm text-muted-foreground line-clamp-2 pt-2 border-t">{item.notes}</p>}
        </CardContent>
      </Card>

      <EditItemDialog item={item} open={isEditOpen} onOpenChange={setIsEditOpen} onUpdate={onUpdate} />
    </>
  )
}
