"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, GripVertical, Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Location } from "@/lib/types"
import { getLocations, getLocationItemCounts, reorderLocations } from "@/app/actions/locations"
import { LocationEditModal } from "@/components/inventory/location-edit-modal"
import { DeleteLocationModal } from "@/components/inventory/delete-location-modal"

// dnd-kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface SortableLocationItemProps {
  location: Location
  itemCount: number
  onEdit: (location: Location) => void
  onDelete: (location: Location) => void
}

function SortableLocationItem({
  location,
  itemCount,
  onEdit,
  onDelete,
}: SortableLocationItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: location.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-3 p-3 rounded-lg border bg-card transition-colors
        ${isDragging ? "opacity-50 shadow-lg z-50" : "hover:bg-accent/50"}
      `}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Icon */}
      <span className="text-xl shrink-0">
        {location.icon || "📍"}
      </span>

      {/* Name & Count */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{location.name}</p>
        <p className="text-sm text-muted-foreground">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(location)}
          className="h-8 w-8"
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit {location.name}</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(location)}
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete {location.name}</span>
        </Button>
      </div>
    </div>
  )
}

export default function LocationsSettingsPage() {
  const router = useRouter()
  const [locations, setLocations] = useState<Location[]>([])
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null)

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [locationsData, countsData] = await Promise.all([
        getLocations(),
        getLocationItemCounts(),
      ])
      setLocations(locationsData)
      setItemCounts(countsData)
    } catch (error) {
      console.error("Failed to load locations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAddNew = () => {
    setEditingLocation(null)
    setIsModalOpen(true)
  }

  const handleEdit = (location: Location) => {
    setEditingLocation(location)
    setIsModalOpen(true)
  }

  const handleDelete = (location: Location) => {
    setDeletingLocation(location)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = locations.findIndex((loc) => loc.id === active.id)
      const newIndex = locations.findIndex((loc) => loc.id === over.id)

      // Optimistic update
      const newLocations = arrayMove(locations, oldIndex, newIndex)
      setLocations(newLocations)

      // Persist to server
      try {
        await reorderLocations(newLocations.map((loc) => loc.id))
      } catch (error) {
        console.error("Failed to reorder locations:", error)
        // Revert on error
        loadData()
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to inventory</span>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Locations</h1>
              <p className="text-sm text-muted-foreground">
                Manage where your items are stored
              </p>
            </div>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Location</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Locations</CardTitle>
            <CardDescription>
              Drag to reorder. Locations appear in this order in the selector.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No locations yet. Add your first location to get started.
                </p>
                <Button onClick={handleAddNew} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={locations.map((loc) => loc.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {locations.map((location) => (
                      <SortableLocationItem
                        key={location.id}
                        location={location}
                        itemCount={itemCounts[location.id] || 0}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* Help text */}
        <p className="text-sm text-muted-foreground text-center mt-6">
          Tip: You can also create new locations directly from the item form.
        </p>
      </main>

      <LocationEditModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        location={editingLocation}
        onSave={loadData}
      />

      {deletingLocation && (
        <DeleteLocationModal
          open={true}
          onOpenChange={(open) => !open && setDeletingLocation(null)}
          location={deletingLocation}
          itemCount={itemCounts[deletingLocation.id] || 0}
          otherLocations={locations.filter((l) => l.id !== deletingLocation.id)}
          onDeleted={loadData}
        />
      )}
    </div>
  )
}
