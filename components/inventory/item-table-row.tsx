"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { ItemWithLocation } from "@/lib/types"
import { EditItemDialog } from "./edit-item-dialog"
import { TableCell, TableRow } from "@/components/ui/table"
import { LocationBadge } from "./location-badge"

interface ItemTableRowProps {
  item: ItemWithLocation
  onUpdate: () => void
  isSelected?: boolean
  onSelectionChange?: (id: string, selected: boolean) => void
}

export function ItemTableRow({ item, onUpdate, isSelected = false, onSelectionChange }: ItemTableRowProps) {
  const router = useRouter()
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
      ? `${item.length.toFixed(2)} × ${item.width.toFixed(2)} × ${item.height.toFixed(2)}`
      : "-"

  return (
    <>
      <TableRow className={isSelected ? "bg-muted/50" : ""}>
        <TableCell className="w-12">
          {onSelectionChange && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelectionChange(item.id, checked === true)}
              aria-label="Select item"
            />
          )}
        </TableCell>
        <TableCell className="max-w-[300px]">
          <div
            className="cursor-pointer hover:text-primary transition-colors"
            onClick={() => router.push(`/inventory/${item.id}`)}
          >
            <div className="font-medium truncate">{item.name}</div>
            {item.description && (
              <div className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{item.description}</div>
            )}
          </div>
        </TableCell>
        <TableCell className="text-center">{item.quantity}</TableCell>
        <TableCell>
          <div className="space-y-1">
            <LocationBadge
              location={item.location_obj}
              fallbackText={item.location}
              size="sm"
            />
            <div className="text-sm text-muted-foreground">{item.category}</div>
          </div>
        </TableCell>
        <TableCell className="text-center font-mono text-sm">{dimensions}</TableCell>
        <TableCell className="text-center">{item.weight ? `${item.weight.toFixed(2)} lbs` : "-"}</TableCell>
        <TableCell className="text-center">
          {item.is_fragile ? (
            <Badge variant="outline" className="text-xs">
              Yes
            </Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell>
          <Badge variant={item.is_packed ? "default" : "secondary"} className="text-xs">
            {item.is_packed ? "Packed" : "Not Packed"}
          </Badge>
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/inventory/${item.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
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
        </TableCell>
      </TableRow>

      <EditItemDialog item={item} open={isEditOpen} onOpenChange={setIsEditOpen} onUpdate={onUpdate} />
    </>
  )
}
