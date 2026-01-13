"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import type { ItemWithLocation, ItemFormData } from "@/lib/types"
import { LocationSelector } from "./location-selector"

const CATEGORIES = ["Furniture", "Electronics", "Kitchenware", "Clothing", "Books", "Decor", "Tools", "Other"]

interface EditItemDialogProps {
  item: ItemWithLocation
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function EditItemDialog({ item, open, onOpenChange, onUpdate }: EditItemDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<ItemFormData>>({})

  useEffect(() => {
    if (open) {
      setFormData({
        name: item.name,
        description: item.description,
        category: item.category,
        location: item.location,
        location_id: item.location_id,
        quantity: item.quantity,
        weight: item.weight,
        length: item.length,
        width: item.width,
        height: item.height,
        notes: item.notes,
        is_packed: item.is_packed,
        photo_url: item.photo_url,
      })
    }
  }, [open, item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("items").update(formData).eq("id", item.id)

      if (error) throw error

      onOpenChange(false)
      onUpdate()
    } catch (error) {
      console.error("Error updating item:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>Update the item details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Item Name *</Label>
              <Input
                id="edit-name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  required
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-location">Location</Label>
                <LocationSelector
                  value={formData.location_id}
                  onChange={(locationId) => setFormData({ ...formData, location_id: locationId })}
                  placeholder="Select location..."
                  allowCreate={true}
                  allowUnassigned={true}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-weight">Weight (lbs)</Label>
                <Input
                  id="edit-weight"
                  type="number"
                  step="0.01"
                  value={formData.weight || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value ? Number.parseFloat(e.target.value) : null })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-length">Length (in)</Label>
                <Input
                  id="edit-length"
                  type="number"
                  step="0.01"
                  value={formData.length || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, length: e.target.value ? Number.parseFloat(e.target.value) : null })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-width">Width (in)</Label>
                <Input
                  id="edit-width"
                  type="number"
                  step="0.01"
                  value={formData.width || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, width: e.target.value ? Number.parseFloat(e.target.value) : null })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-height">Height (in)</Label>
                <Input
                  id="edit-height"
                  type="number"
                  step="0.01"
                  value={formData.height || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value ? Number.parseFloat(e.target.value) : null })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
