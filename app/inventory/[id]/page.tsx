"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Ruler,
  Weight,
  MapPin,
  Tag,
  BoxIcon,
  AlertTriangle
} from "lucide-react"
import type { ItemWithLocation } from "@/lib/types"
import { EditItemDialog } from "@/components/inventory/edit-item-dialog"

export default function ItemDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [item, setItem] = useState<ItemWithLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadItem = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("items")
          .select("*, locations(*)")
          .eq("id", id)
          .single()

        if (error) throw error

        if (data) {
          // Transform to include location_obj
          const itemWithLocation: ItemWithLocation = {
            ...data,
            location_obj: data.locations,
          }
          setItem(itemWithLocation)
        }
      } catch (error) {
        console.error("Error loading item:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadItem()
  }, [id])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return

    setIsDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("items").delete().eq("id", id)

      if (error) throw error
      router.push("/")
    } catch (error) {
      console.error("Error deleting item:", error)
      setIsDeleting(false)
    }
  }

  const handleUpdate = () => {
    // Reload the item after update
    const loadItem = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("items")
          .select("*, locations(*)")
          .eq("id", id)
          .single()

        if (error) throw error

        if (data) {
          const itemWithLocation: ItemWithLocation = {
            ...data,
            location_obj: data.locations,
          }
          setItem(itemWithLocation)
        }
      } catch (error) {
        console.error("Error loading item:", error)
      }
    }

    loadItem()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BoxIcon className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading item details...</p>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BoxIcon className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Item not found</h2>
          <p className="text-muted-foreground mb-4">The item you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory
          </Button>
        </div>
      </div>
    )
  }

  const dimensions =
    item.length && item.width && item.height
      ? `${item.length.toFixed(2)} × ${item.width.toFixed(2)} × ${item.height.toFixed(2)}"`
      : null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <Button variant="ghost" onClick={() => router.push("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Inventory
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Item Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
            {item.description && (
              <p className="text-lg text-muted-foreground">{item.description}</p>
            )}
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={item.is_packed ? "default" : "secondary"}>
              {item.is_packed ? "Packed" : "Not Packed"}
            </Badge>
            {item.is_fragile && (
              <Badge variant="outline" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Fragile
              </Badge>
            )}
            {item.can_disassemble && (
              <Badge variant="outline">
                Can Disassemble
              </Badge>
            )}
          </div>

          {/* Photo */}
          {item.photo_url && (
            <Card>
              <CardHeader>
                <CardTitle>Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={item.photo_url}
                  alt={item.name}
                  className="w-full max-w-2xl rounded-lg object-cover"
                />
              </CardContent>
            </Card>
          )}

          {/* Details Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-medium">{item.quantity}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{item.category}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <div className="flex items-center gap-2">
                      {item.location_obj?.icon && (
                        <span className="text-lg">{item.location_obj.icon}</span>
                      )}
                      <p className="font-medium">
                        {item.location_obj?.name || item.location}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Measurements */}
            <Card>
              <CardHeader>
                <CardTitle>Measurements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dimensions ? (
                  <>
                    <div className="flex items-start gap-3">
                      <Ruler className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Dimensions (L × W × H)</p>
                        <p className="font-medium font-mono">{dimensions}</p>
                      </div>
                    </div>
                    <Separator />
                  </>
                ) : null}

                {item.weight ? (
                  <div className="flex items-start gap-3">
                    <Weight className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Weight</p>
                      <p className="font-medium">{item.weight.toFixed(2)} lbs</p>
                    </div>
                  </div>
                ) : null}

                {!dimensions && !item.weight && (
                  <p className="text-sm text-muted-foreground">No measurements recorded</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {item.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{item.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(item.created_at).toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{new Date(item.updated_at).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <EditItemDialog
        item={item}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onUpdate={handleUpdate}
      />
    </div>
  )
}
