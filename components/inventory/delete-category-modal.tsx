"use client"

import { useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Category } from "@/lib/types"
import { deleteCategory } from "@/app/actions/categories"

interface DeleteCategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Category to delete */
  category: Category
  /** Number of items in this category */
  itemCount: number
  /** Other categories to reassign to */
  otherCategories: Category[]
  /** Called after successful delete */
  onDeleted: () => void
}

export function DeleteCategoryModal({
  open,
  onOpenChange,
  category,
  itemCount,
  otherCategories,
  onDeleted,
}: DeleteCategoryModalProps) {
  const [reassignOption, setReassignOption] = useState<"move" | "unassign">("unassign")
  const [reassignToId, setReassignToId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasItems = itemCount > 0

  const handleDelete = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const targetId = reassignOption === "move" && reassignToId ? reassignToId : null
      await deleteCategory(category.id, targetId)
      onDeleted()
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete category"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete "{category.name}"?
          </DialogTitle>
          <DialogDescription>
            {hasItems ? (
              <>
                This category has <strong>{itemCount}</strong> {itemCount === 1 ? "item" : "items"}.
                Choose what to do with them.
              </>
            ) : (
              "This category has no items and can be safely deleted."
            )}
          </DialogDescription>
        </DialogHeader>

        {hasItems && (
          <div className="py-4">
            <RadioGroup
              value={reassignOption}
              onValueChange={(v) => setReassignOption(v as "move" | "unassign")}
              className="space-y-3"
            >
              {/* Move to another category */}
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="move" id="move" className="mt-1" />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="move" className="font-medium cursor-pointer">
                    Move items to another category
                  </Label>
                  {reassignOption === "move" && (
                    <Select value={reassignToId} onValueChange={setReassignToId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {otherCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              <span>{cat.icon || "📦"}</span>
                              <span>{cat.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Leave uncategorized */}
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="unassign" id="unassign" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="unassign" className="font-medium cursor-pointer">
                    Leave items uncategorized
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Items will have no category until you assign them again.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || (hasItems && reassignOption === "move" && !reassignToId)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Category"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
