"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus, Loader2, MapPin } from "lucide-react"

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
import type { Location } from "@/lib/types"
import {
  getLocations,
  createLocation,
  seedDefaultLocationsIfNeeded,
} from "@/app/actions/locations"

interface LocationSelectorProps {
  value?: string | null
  onChange: (locationId: string | null) => void
  disabled?: boolean
  placeholder?: string
  allowCreate?: boolean
  allowUnassigned?: boolean
  className?: string
}

export function LocationSelector({
  value,
  onChange,
  disabled = false,
  placeholder = "Select location...",
  allowCreate = true,
  allowUnassigned = true,
  className,
}: LocationSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [locations, setLocations] = React.useState<Location[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isCreating, setIsCreating] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  // Load locations on mount
  React.useEffect(() => {
    async function loadLocations() {
      try {
        setIsLoading(true)
        // This will seed defaults if user has none
        const data = await seedDefaultLocationsIfNeeded()
        setLocations(data)
      } catch (error) {
        console.error("Failed to load locations:", error)
        // Try getting locations without seeding as fallback
        try {
          const data = await getLocations()
          setLocations(data)
        } catch {
          // Silently fail - empty locations
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadLocations()
  }, [])

  // Find selected location
  const selectedLocation = locations.find((loc) => loc.id === value)

  // Filter locations based on search
  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  // Check if search value matches any existing location
  const exactMatch = locations.some(
    (loc) => loc.name.toLowerCase() === searchValue.toLowerCase()
  )
  const showCreateOption =
    allowCreate && searchValue.trim() && !exactMatch && !isCreating

  // Handle creating new location
  const handleCreate = async () => {
    if (!searchValue.trim() || isCreating) return

    try {
      setIsCreating(true)
      const newLocation = await createLocation({
        name: searchValue.trim(),
        icon: "📍",
        color: null,
      })
      setLocations((prev) => [...prev, newLocation])
      onChange(newLocation.id)
      setSearchValue("")
      setOpen(false)
    } catch (error) {
      console.error("Failed to create location:", error)
    } finally {
      setIsCreating(false)
    }
  }

  // Handle selection
  const handleSelect = (locationId: string | null) => {
    onChange(locationId)
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
          ) : selectedLocation ? (
            <span className="flex items-center gap-2 truncate">
              <span>{selectedLocation.icon || "📍"}</span>
              <span className="truncate">{selectedLocation.name}</span>
            </span>
          ) : value === null && allowUnassigned ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Unassigned</span>
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
            placeholder="Search locations..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {filteredLocations.length === 0 && !showCreateOption && (
              <CommandEmpty>No locations found.</CommandEmpty>
            )}

            {allowUnassigned && (
              <CommandGroup>
                <CommandItem
                  value="unassigned"
                  onSelect={() => handleSelect(null)}
                >
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Unassigned</span>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === null ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              </CommandGroup>
            )}

            {filteredLocations.length > 0 && (
              <>
                {allowUnassigned && <CommandSeparator />}
                <CommandGroup heading="Locations">
                  {filteredLocations.map((location) => (
                    <CommandItem
                      key={location.id}
                      value={location.id}
                      onSelect={() => handleSelect(location.id)}
                    >
                      <span className="mr-2">{location.icon || "📍"}</span>
                      <span>{location.name}</span>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          value === location.id ? "opacity-100" : "opacity-0"
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
