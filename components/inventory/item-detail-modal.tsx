"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Item } from "@/lib/types"
import { Package, MapPin, Ruler, Weight, Wrench, CheckCircle2, Circle } from "lucide-react"

interface ItemDetailModalProps {
  item: Item | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ItemDetailModal({ item, open, onOpenChange }: ItemDetailModalProps) {
  if (!item) return null

  const volume =
    item.length && item.width && item.height ? ((item.length * item.width * item.height) / 1728).toFixed(2) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{item.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {item.photo_url && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden border bg-muted">
              <img
                src={item.photo_url || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {item.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
              <p className="text-sm">{item.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <Badge variant="secondary">{item.category}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <Badge variant="secondary">{item.location}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Quantity</p>
              <p className="text-lg font-semibold">{item.quantity}</p>
            </div>

            {item.weight && (
              <div className="flex items-center gap-2">
                <Weight className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Weight</p>
                  <p className="text-lg font-semibold">{(item.weight * item.quantity).toFixed(2)} lbs</p>
                </div>
              </div>
            )}
          </div>

          {(item.length || item.width || item.height) && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Dimensions</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {item.length && (
                    <div>
                      <p className="text-xs text-muted-foreground">Length</p>
                      <p className="text-base font-medium">{item.length.toFixed(2)}"</p>
                    </div>
                  )}
                  {item.width && (
                    <div>
                      <p className="text-xs text-muted-foreground">Width</p>
                      <p className="text-base font-medium">{item.width.toFixed(2)}"</p>
                    </div>
                  )}
                  {item.height && (
                    <div>
                      <p className="text-xs text-muted-foreground">Height</p>
                      <p className="text-base font-medium">{item.height.toFixed(2)}"</p>
                    </div>
                  )}
                </div>
                {volume && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Total Volume: <span className="font-medium">{volume} ft³</span>
                  </p>
                )}
              </div>
            </>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Disassemble</p>
                <p className="text-sm font-medium">{item.can_disassemble ? "Yes" : "No"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {item.is_packed ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-medium">{item.is_packed ? "Packed" : "Not Packed"}</p>
              </div>
            </div>
          </div>

          {item.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                <p className="text-sm whitespace-pre-wrap">{item.notes}</p>
              </div>
            </>
          )}

          <div className="text-xs text-muted-foreground">
            <p>Created: {new Date(item.created_at).toLocaleDateString()}</p>
            <p>Last Updated: {new Date(item.updated_at).toLocaleDateString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
