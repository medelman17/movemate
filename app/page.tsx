"use client"

import { TableCell } from "@/components/ui/table"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LogOut, Search, Download, Truck, Scale, BoxIcon } from "lucide-react"
import { AddItemDialog } from "@/components/inventory/add-item-dialog"
import { ItemTableRow } from "@/components/inventory/item-table-row"
import { ItemMobileCard } from "@/components/inventory/item-mobile-card"
import { BulkActionsBar } from "@/components/inventory/bulk-actions-bar"
import type { Item } from "@/lib/types"
import { useRouter } from "next/navigation"

const AUTO_LOGIN_ENABLED = true
const TEST_USER_EMAIL = "test@movemate.com"
const TEST_USER_PASSWORD = "testpassword123"

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [packedFilter, setPackedFilter] = useState<string>("all")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndAutoLogin = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session && AUTO_LOGIN_ENABLED) {
        console.log("[v0] No session found, attempting auto-login with test user")
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email: TEST_USER_EMAIL,
            password: TEST_USER_PASSWORD,
          })
          if (error) {
            console.log("[v0] Auto-login failed:", error.message)
            router.push("/auth/login")
          } else {
            console.log("[v0] Auto-login successful")
          }
        } catch (error) {
          console.error("[v0] Auto-login error:", error)
          router.push("/auth/login")
        }
      } else if (!session) {
        router.push("/auth/login")
      }
    }

    checkAuthAndAutoLogin()
  }, [router])

  const loadItems = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("items").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (error) {
      console.error("Error loading items:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  useEffect(() => {
    let filtered = items

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter)
    }

    if (locationFilter !== "all") {
      filtered = filtered.filter((item) => item.location === locationFilter)
    }

    if (packedFilter !== "all") {
      filtered = filtered.filter((item) => (packedFilter === "packed" ? item.is_packed : !item.is_packed))
    }

    setFilteredItems(filtered)
  }, [items, searchQuery, categoryFilter, locationFilter, packedFilter])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const handleSelectionChange = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id))
    }
  }

  const handleClearSelection = () => {
    setSelectedIds([])
  }

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Description",
      "Quantity",
      "Category",
      "Location",
      "Dimensions",
      "Weight",
      "Fragile",
      "Status",
    ]
    const rows = items.map((item) => [
      item.name,
      item.description || "",
      item.quantity,
      item.category,
      item.location,
      item.length && item.width && item.height ? `${item.length}×${item.width}×${item.height}` : "",
      item.weight || "",
      item.is_fragile ? "Yes" : "No",
      item.is_packed ? "Packed" : "Not Packed",
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "inventory.csv"
    a.click()
  }

  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0)
  const totalVolume = items.reduce((sum, item) => {
    if (item.length && item.width && item.height) {
      return sum + ((item.length * item.width * item.height) / 1728) * item.quantity // Convert to cubic feet and multiply by quantity
    }
    return sum
  }, 0)

  const categories = Array.from(new Set(items.map((item) => item.category)))
  const locations = Array.from(new Set(items.map((item) => item.location)))

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="rounded-xl bg-primary p-2 sm:p-2.5 shrink-0">
                <BoxIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-xl font-bold leading-tight">MoveMate Inventory</h1>
                <p className="text-xs text-muted-foreground">Track metrics & volume</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={items.length === 0}
                className="hidden sm:flex bg-transparent"
              >
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleExportCSV}
                disabled={items.length === 0}
                className="sm:hidden h-9 w-9"
              >
                <Download className="h-4 w-4" />
              </Button>
              <AddItemDialog onItemAdded={loadItems} />
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-9 w-9 sm:h-10 sm:w-10">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="grid gap-2 sm:gap-4 grid-cols-3 mb-4 sm:mb-8">
          <div className="rounded-lg sm:rounded-xl border bg-card p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="rounded-md sm:rounded-lg bg-primary/10 p-1.5 sm:p-3 shrink-0">
                <BoxIcon className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-xl sm:text-3xl font-bold">{items.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg sm:rounded-xl border bg-card p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="rounded-md sm:rounded-lg bg-orange-500/10 p-1.5 sm:p-3 shrink-0">
                <Truck className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Est. Volume</p>
                <p className="text-xl sm:text-3xl font-bold">
                  {totalVolume.toFixed(2)} <span className="text-xs sm:text-lg text-muted-foreground">ft³</span>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg sm:rounded-xl border bg-card p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <div className="rounded-md sm:rounded-lg bg-emerald-500/10 p-1.5 sm:p-3 shrink-0">
                <Scale className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Weight</p>
                <p className="text-xl sm:text-3xl font-bold">
                  {totalWeight.toFixed(2)} <span className="text-xs sm:text-lg text-muted-foreground">lbs</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <Input
              placeholder="Search items, rooms, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="sm:hidden space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
              Loading your inventory...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <BoxIcon className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/20 mb-3" />
              <h3 className="text-base sm:text-lg font-semibold mb-1">
                {items.length === 0 ? "No items found." : "No matching items."}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {items.length === 0 ? 'Click "Add Item" to start your inventory.' : "Try adjusting your search."}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <ItemMobileCard
                key={item.id}
                item={item}
                onUpdate={loadItems}
                isSelected={selectedIds.includes(item.id)}
                onSelectionChange={handleSelectionChange}
              />
            ))
          )}
        </div>

        <div className="hidden sm:block rounded-xl border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="font-semibold text-muted-foreground uppercase text-xs min-w-[300px]">
                    Item Details
                  </TableHead>
                  <TableHead className="text-center font-semibold text-muted-foreground uppercase text-xs w-[80px]">
                    Qty
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground uppercase text-xs min-w-[180px]">
                    Room & Category
                  </TableHead>
                  <TableHead className="text-center font-semibold text-muted-foreground uppercase text-xs w-[150px]">
                    Dimensions (in)
                  </TableHead>
                  <TableHead className="text-center font-semibold text-muted-foreground uppercase text-xs w-[100px]">
                    Weight
                  </TableHead>
                  <TableHead className="text-center font-semibold text-muted-foreground uppercase text-xs w-[120px]">
                    Disassemble?
                  </TableHead>
                  <TableHead className="font-semibold text-muted-foreground uppercase text-xs w-[120px]">
                    Status
                  </TableHead>
                  <TableHead className="text-center font-semibold text-muted-foreground uppercase text-xs w-[80px]">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-64 text-center text-muted-foreground">
                      Loading your inventory...
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-64">
                      <div className="flex flex-col items-center justify-center text-center">
                        <BoxIcon className="h-16 w-16 text-muted-foreground/20 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {items.length === 0 ? "No items found." : "No matching items."}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {items.length === 0
                            ? 'Click "Add Item" to start your inventory.'
                            : "Try adjusting your search."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <ItemTableRow
                      key={item.id}
                      item={item}
                      onUpdate={loadItems}
                      isSelected={selectedIds.includes(item.id)}
                      onSelectionChange={handleSelectionChange}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <BulkActionsBar selectedIds={selectedIds} onClearSelection={handleClearSelection} onUpdate={loadItems} />
    </div>
  )
}
