"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Trash2, Archive } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface BulkActionsBarProps {
  selectedIds: string[]
  onClearSelection: () => void
  onUpdate: () => void
}

export function BulkActionsBar({ selectedIds, onClearSelection, onUpdate }: BulkActionsBarProps) {
  const handleBulkPack = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("items").update({ is_packed: true }).in("id", selectedIds)

      if (error) throw error
      onUpdate()
      onClearSelection()
    } catch (error) {
      console.error("Error packing items:", error)
    }
  }

  const handleBulkUnpack = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("items").update({ is_packed: false }).in("id", selectedIds)

      if (error) throw error
      onUpdate()
      onClearSelection()
    } catch (error) {
      console.error("Error unpacking items:", error)
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("items").delete().in("id", selectedIds)

      if (error) throw error
      onUpdate()
      onClearSelection()
    } catch (error) {
      console.error("Error deleting items:", error)
    }
  }

  if (selectedIds.length === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 animate-in slide-in-from-bottom-5">
      <div className="rounded-full border bg-card shadow-lg px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedIds.length} selected</Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClearSelection}>
              <X className="h-4 w-4" />
              <span className="sr-only">Clear selection</span>
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBulkPack} className="gap-2 bg-transparent">
              <Archive className="h-4 w-4" />
              Mark as Packed
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkUnpack} className="gap-2 bg-transparent">
              <Archive className="h-4 w-4" />
              Mark as Unpacked
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
