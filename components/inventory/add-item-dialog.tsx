"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Sparkles, Loader2, Camera, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { ItemFormData } from "@/lib/types"
import { researchProduct } from "@/app/actions/product-research"
import { identifyProductFromPhoto } from "@/app/actions/identify-from-photo"
import { useToast } from "@/hooks/use-toast"

const CATEGORIES = ["Furniture", "Electronics", "Kitchenware", "Clothing", "Books", "Decor", "Tools", "Other"]
const LOCATIONS = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Garage", "Storage", "Office", "Other"]

interface AddItemDialogProps {
  onItemAdded: () => void
}

export function AddItemDialog({ onItemAdded }: AddItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResearching, setIsResearching] = useState(false)
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null)
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<ItemFormData>>({
    name: "",
    description: "",
    category: "",
    location: "",
    quantity: 1,
    weight: null,
    length: null,
    width: null,
    height: null,
    notes: "",
    is_packed: false,
    photo_url: null,
  })

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzingPhoto(true)
    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64Image = event.target?.result as string
        setUploadedPhoto(base64Image)

        try {
          const productName = await identifyProductFromPhoto(base64Image)
          setFormData((prev) => ({
            ...prev,
            name: productName,
          }))

          toast({
            title: "Product identified!",
            description: `Found: ${productName}. Click Auto-fill to get specifications.`,
          })
        } catch (error) {
          console.error("Error identifying product:", error)
          toast({
            title: "Identification failed",
            description: "Could not identify the product. Please enter the name manually.",
            variant: "destructive",
          })
        } finally {
          setIsAnalyzingPhoto(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error uploading photo:", error)
      setIsAnalyzingPhoto(false)
      toast({
        title: "Upload failed",
        description: "Could not process the image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const clearPhoto = () => {
    setUploadedPhoto(null)
  }

  const handleAIResearch = async () => {
    if (!formData.name?.trim()) {
      toast({
        title: "Enter product name",
        description: "Please enter a product name first (e.g., 'IKEA Besta TV Unit')",
        variant: "destructive",
      })
      return
    }

    setIsResearching(true)
    try {
      const productInfo = await researchProduct(formData.name)

      setFormData((prev) => ({
        ...prev,
        name: productInfo.name || prev.name,
        description: productInfo.description || prev.description,
        category: productInfo.category || prev.category,
        weight: productInfo.weight ?? prev.weight,
        length: productInfo.dimensions.length ?? prev.length,
        width: productInfo.dimensions.width ?? prev.width,
        height: productInfo.dimensions.height ?? prev.height,
        can_disassemble: productInfo.canDisassemble ?? prev.can_disassemble,
      }))

      toast({
        title: "Product info found!",
        description: "Fields have been auto-filled with product specifications.",
      })
    } catch (error) {
      console.error("Error researching product:", error)
      toast({
        title: "Research failed",
        description: "Could not find product information. Please enter details manually.",
        variant: "destructive",
      })
    } finally {
      setIsResearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      let photoUrl = formData.photo_url
      if (uploadedPhoto) {
        photoUrl = uploadedPhoto
      }

      const { error } = await supabase.from("items").insert({
        ...formData,
        photo_url: photoUrl,
        user_id: user.id,
      })

      if (error) throw error

      setOpen(false)
      setUploadedPhoto(null)
      setFormData({
        name: "",
        description: "",
        category: "",
        location: "",
        quantity: 1,
        weight: null,
        length: null,
        width: null,
        height: null,
        notes: "",
        is_packed: false,
        photo_url: null,
      })
      onItemAdded()
    } catch (error) {
      console.error("Error adding item:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>Add an item to your moving inventory</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Product Photo (Optional)</Label>
              {uploadedPhoto ? (
                <div className="relative">
                  <img
                    src={uploadedPhoto || "/placeholder.svg"}
                    alt="Uploaded product"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={clearPhoto}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isAnalyzingPhoto}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 w-full bg-transparent"
                    onClick={() => document.getElementById("photo-upload")?.click()}
                    disabled={isAnalyzingPhoto}
                  >
                    {isAnalyzingPhoto ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing photo...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4" />
                        Upload Photo to Auto-Identify
                      </>
                    )}
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Upload a photo and we'll identify the item and help you find specifications
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Item Name *</Label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., IKEA Besta TV Unit or product URL"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAIResearch}
                  disabled={isResearching || !formData.name?.trim()}
                  className="gap-2 shrink-0"
                >
                  {isResearching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Researching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Auto-fill
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a product name or URL and click Auto-fill to research dimensions and weight
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add details about the item"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  required
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
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
                <Label htmlFor="location">Location *</Label>
                <Select
                  required
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value ? Number.parseFloat(e.target.value) : null })
                  }
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="length">Length (in)</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.01"
                  value={formData.length || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, length: e.target.value ? Number.parseFloat(e.target.value) : null })
                  }
                  placeholder="Optional"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="width">Width (in)</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.01"
                  value={formData.width || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, width: e.target.value ? Number.parseFloat(e.target.value) : null })
                  }
                  placeholder="Optional"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="height">Height (in)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.01"
                  value={formData.height || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value ? Number.parseFloat(e.target.value) : null })
                  }
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or instructions"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
