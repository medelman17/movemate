"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, Loader2, Tag } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Category } from "@/lib/types"
import {
  getCategories,
  createCategory,
  seedDefaultCategoriesIfNeeded,
} from "@/app/actions/categories"

interface CategorySelectorProps {
  value?: string | null
  onChange: (categoryId: string | null) => void
  disabled?: boolean
  placeholder?: string
  allowCreate?: boolean
  allowUnassigned?: boolean
  className?: string
}

export function CategorySelector({
  value,
  onChange,
  disabled = false,
  placeholder = "Select category...",
  allowCreate = true,
  allowUnassigned = true,
  className,
}: CategorySelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [categories, setCategories] = React.useState<Category[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isCreating, setIsCreating] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  // Load categories on mount
  React.useEffect(() => {
    async function loadCategories() {
      try {
        setIsLoading(true)
        // This will seed defaults if user has none
        const data = await seedDefaultCategoriesIfNeeded()
        setCategories(data)
      } catch (error) {
        console.error("Failed to load categories:", error)
        // Try getting categories without seeding as fallback
        try {
          const data = await getCategories()
          setCategories(data)
        } catch {
          // Silently fail - empty categories
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadCategories()
  }, [])

  // Find selected category
  const selectedCategory = categories.find((cat) => cat.id === value)

  // Filter categories based on search
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  // Check if search value matches any existing category
  const exactMatch = categories.some(
    (cat) => cat.name.toLowerCase() === searchValue.toLowerCase()
  )
  const showCreateOption =
    allowCreate && searchValue.trim() && !exactMatch && !isCreating

  // Handle creating new category
  const handleCreate = async () => {
    if (!searchValue.trim() || isCreating) return

    try {
      setIsCreating(true)
      const newCategory = await createCategory({
        name: searchValue.trim(),
        icon: "📦",
        color: null,
      })
      setCategories((prev) => [...prev, newCategory])
      onChange(newCategory.id)
      setSearchValue("")
      setOpen(false)
    } catch (error) {
      console.error("Failed to create category:", error)
    } finally {
      setIsCreating(false)
    }
  }

  // Handle selection
  const handleSelect = (categoryId: string | null) => {
    onChange(categoryId)
    setOpen(false)
    setSearchValue("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </span>
          ) : selectedCategory ? (
            <span className="flex items-center gap-2 truncate">
              <span>{selectedCategory.icon || "📦"}</span>
              <span className="truncate">{selectedCategory.name}</span>
            </span>
          ) : value === null && allowUnassigned ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span>Uncategorized</span>
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search categories..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {filteredCategories.length === 0 && !showCreateOption && (
              <CommandEmpty>No categories found.</CommandEmpty>
            )}

            {allowUnassigned && (
              <CommandGroup>
                <CommandItem
                  value="uncategorized"
                  onSelect={() => handleSelect(null)}
                >
                  <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Uncategorized</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === null ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              </CommandGroup>
            )}

            {filteredCategories.length > 0 && (
              <>
                {allowUnassigned && <CommandSeparator />}
                <CommandGroup heading="Categories">
                  {filteredCategories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.id}
                      onSelect={() => handleSelect(category.id)}
                    >
                      <span className="mr-2">{category.icon || "📦"}</span>
                      <span>{category.name}</span>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === category.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {showCreateOption && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleCreate}
                    disabled={isCreating}
                    className="text-primary"
                  >
                    {isCreating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    <span>Create &quot;{searchValue.trim()}&quot;</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
