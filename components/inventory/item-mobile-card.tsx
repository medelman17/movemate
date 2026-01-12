"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Package, MapPin, Ruler, Weight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Item } from "@/lib/types"
import { EditItemDialog } from "./edit-item-dialog"

interface ItemMobileCardProps {
  item: Item
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

  return (
    <>
      <Card className="relative">
        <CardContent className="p-2.5">
          <div className="absolute top-2 right-2 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
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

          <div className="pr-8">
            <h3 className="font-semibold text-sm leading-tight mb-1">{item.name}</h3>
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">{item.description}</p>
            )}

            <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 mb-2">
              <div className="flex items-center gap-1.5 text-xs">
                <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Qty:</span>
                <span className="font-medium">{item.quantity}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs min-w-0">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate font-medium">{item.location}</span>
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

            <div className="flex flex-wrap gap-1">
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
      </Card>

      <EditItemDialog item={item} open={isEditOpen} onOpenChange={setIsEditOpen} onUpdate={onUpdate} />
    </>
  )
}
