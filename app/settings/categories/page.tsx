"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, GripVertical, Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Category } from "@/lib/types"
import { getCategories, getCategoryItemCounts, reorderCategories } from "@/app/actions/categories"
import { CategoryEditModal } from "@/components/inventory/category-edit-modal"
import { DeleteCategoryModal } from "@/components/inventory/delete-category-modal"

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

interface SortableCategoryItemProps {
  category: Category
  itemCount: number
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

function SortableCategoryItem({
  category,
  itemCount,
  onEdit,
  onDelete,
}: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

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
        {category.icon || "📦"}
      </span>

      {/* Name & Count */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{category.name}</p>
        <p className="text-sm text-muted-foreground">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(category)}
          className="h-8 w-8"
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit {category.name}</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(category)}
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete {category.name}</span>
        </Button>
      </div>
    </div>
  )
}

export default function CategoriesSettingsPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

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
      const [categoriesData, countsData] = await Promise.all([
        getCategories(),
        getCategoryItemCounts(),
      ])
      setCategories(categoriesData)
      setItemCounts(countsData)
    } catch (error) {
      console.error("Failed to load categories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAddNew = () => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleDelete = (category: Category) => {
    setDeletingCategory(category)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id)
      const newIndex = categories.findIndex((cat) => cat.id === over.id)

      // Optimistic update
      const newCategories = arrayMove(categories, oldIndex, newIndex)
      setCategories(newCategories)

      // Persist to server
      try {
        await reorderCategories(newCategories.map((cat) => cat.id))
      } catch (error) {
        console.error("Failed to reorder categories:", error)
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
              <h1 className="text-xl font-bold">Categories</h1>
              <p className="text-sm text-muted-foreground">
                Manage how your items are categorized
              </p>
            </div>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Category</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Categories</CardTitle>
            <CardDescription>
              Drag to reorder. Categories appear in this order in the selector.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No categories yet. Add your first category to get started.
                </p>
                <Button onClick={handleAddNew} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={categories.map((cat) => cat.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <SortableCategoryItem
                        key={category.id}
                        category={category}
                        itemCount={itemCounts[category.id] || 0}
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
          Tip: You can also create new categories directly from the item form.
        </p>
      </main>

      <CategoryEditModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        category={editingCategory}
        onSave={loadData}
      />

      {deletingCategory && (
        <DeleteCategoryModal
          open={true}
          onOpenChange={(open) => !open && setDeletingCategory(null)}
          category={deletingCategory}
          itemCount={itemCounts[deletingCategory.id] || 0}
          otherCategories={categories.filter((c) => c.id !== deletingCategory.id)}
          onDeleted={loadData}
        />
      )}
    </div>
  )
}
