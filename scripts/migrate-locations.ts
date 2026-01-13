#!/usr/bin/env npx tsx
/**
 * Migrate text-based location strings to structured location records.
 *
 * This script:
 * 1. Finds all unique location strings per user
 * 2. Creates location records with guessed icons
 * 3. Updates items with location_id foreign key
 *
 * Usage:
 *   npx tsx scripts/migrate-locations.ts --dry-run
 *   npx tsx scripts/migrate-locations.ts
 *
 * Environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (for admin access)
 */

import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

// Load environment variables from .env.local
config({ path: ".env.local" })

// Icon mapping for common room names
const ICON_MAP: Record<string, string> = {
  // Living spaces
  "living room": "🛋️",
  "living": "🛋️",
  "lounge": "🛋️",
  "family room": "🛋️",
  "den": "🛋️",

  // Bedrooms
  "bedroom": "🛏️",
  "master bedroom": "🛏️",
  "guest bedroom": "🛏️",
  "kids room": "🛏️",
  "nursery": "🛏️",

  // Kitchen & dining
  "kitchen": "🍳",
  "dining room": "🍽️",
  "dining": "🍽️",
  "pantry": "🍳",

  // Bathrooms
  "bathroom": "🚿",
  "bath": "🚿",
  "master bath": "🚿",
  "half bath": "🚿",
  "powder room": "🚿",

  // Office & work
  "office": "💼",
  "home office": "💼",
  "study": "💼",
  "workspace": "💼",

  // Storage & utility
  "garage": "🚗",
  "storage": "📦",
  "attic": "📦",
  "basement": "📦",
  "closet": "📦",
  "laundry": "🧺",
  "laundry room": "🧺",
  "utility room": "🔧",

  // Outdoor
  "patio": "🌳",
  "deck": "🌳",
  "yard": "🌳",
  "garden": "🌳",
  "balcony": "🌳",
  "porch": "🏠",

  // Other
  "hallway": "🚪",
  "entryway": "🚪",
  "foyer": "🚪",
  "mudroom": "🚪",
}

function guessIcon(locationName: string): string {
  const normalized = locationName.toLowerCase().trim()

  // Exact match
  if (ICON_MAP[normalized]) {
    return ICON_MAP[normalized]
  }

  // Partial match
  for (const [key, icon] of Object.entries(ICON_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return icon
    }
  }

  // Default
  return "📍"
}

interface MigrationStats {
  usersProcessed: number
  locationsCreated: number
  itemsUpdated: number
  itemsSkipped: number
  errors: string[]
}

async function migrateLocations(dryRun: boolean): Promise<MigrationStats> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    process.exit(1)
  }

  // Create admin client with service role key
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log("\n🔄 Migrating text locations to structured records...\n")
  console.log(`   Mode: ${dryRun ? "DRY RUN" : "LIVE"}\n`)

  const stats: MigrationStats = {
    usersProcessed: 0,
    locationsCreated: 0,
    itemsUpdated: 0,
    itemsSkipped: 0,
    errors: [],
  }

  // Step 1: Get all items with text locations (no location_id set)
  const { data: items, error: itemsError } = await supabase
    .from("items")
    .select("id, user_id, location")
    .is("location_id", null)
    .not("location", "is", null)
    .neq("location", "")

  if (itemsError) {
    console.error("Error fetching items:", itemsError)
    process.exit(1)
  }

  if (!items || items.length === 0) {
    console.log("   No items with text locations to migrate.\n")
    return stats
  }

  console.log(`   Found ${items.length} items with text locations\n`)

  // Step 2: Group items by user and unique location name
  const userLocationMap = new Map<string, Map<string, string[]>>()

  for (const item of items) {
    if (!item.user_id || !item.location) continue

    if (!userLocationMap.has(item.user_id)) {
      userLocationMap.set(item.user_id, new Map())
    }

    const locationName = item.location.trim()
    const userLocations = userLocationMap.get(item.user_id)!

    if (!userLocations.has(locationName)) {
      userLocations.set(locationName, [])
    }
    userLocations.get(locationName)!.push(item.id)
  }

  console.log(`   Processing ${userLocationMap.size} users...\n`)

  // Step 3: For each user, create location records and update items
  for (const [userId, locationItems] of userLocationMap) {
    stats.usersProcessed++
    console.log(`   👤 User ${userId.slice(0, 8)}...`)

    // Get existing locations for this user
    const { data: existingLocations } = await supabase
      .from("locations")
      .select("id, name")
      .eq("user_id", userId)

    const existingLocationMap = new Map<string, string>()
    for (const loc of existingLocations || []) {
      existingLocationMap.set(loc.name.toLowerCase(), loc.id)
    }

    // Get max sort_order for this user
    const { data: maxOrderData } = await supabase
      .from("locations")
      .select("sort_order")
      .eq("user_id", userId)
      .order("sort_order", { ascending: false })
      .limit(1)

    let nextSortOrder = (maxOrderData?.[0]?.sort_order ?? -1) + 1

    for (const [locationName, itemIds] of locationItems) {
      const normalizedName = locationName.toLowerCase()

      // Check if location already exists (case-insensitive)
      let locationId = existingLocationMap.get(normalizedName)

      if (!locationId) {
        // Create new location
        const icon = guessIcon(locationName)
        console.log(`      📍 Creating "${locationName}" (${icon})`)

        if (!dryRun) {
          const { data: newLocation, error: createError } = await supabase
            .from("locations")
            .insert({
              user_id: userId,
              name: locationName,
              icon,
              sort_order: nextSortOrder++,
            })
            .select("id")
            .single()

          if (createError) {
            stats.errors.push(`Failed to create location "${locationName}": ${createError.message}`)
            console.log(`         ❌ Error: ${createError.message}`)
            continue
          }

          locationId = newLocation.id
        } else {
          locationId = "dry-run-id"
        }

        stats.locationsCreated++
        existingLocationMap.set(normalizedName, locationId)
      } else {
        console.log(`      ✓ Using existing "${locationName}"`)
      }

      // Update items with location_id
      console.log(`         Updating ${itemIds.length} items...`)

      if (!dryRun) {
        const { error: updateError } = await supabase
          .from("items")
          .update({ location_id: locationId })
          .in("id", itemIds)

        if (updateError) {
          stats.errors.push(`Failed to update items: ${updateError.message}`)
          console.log(`         ❌ Error: ${updateError.message}`)
          stats.itemsSkipped += itemIds.length
          continue
        }
      }

      stats.itemsUpdated += itemIds.length
    }
  }

  return stats
}

// Parse CLI arguments
const args = process.argv.slice(2)
const dryRun = args.includes("--dry-run")

migrateLocations(dryRun)
  .then((stats) => {
    console.log("\n📊 Migration Summary:")
    console.log(`   Users processed: ${stats.usersProcessed}`)
    console.log(`   Locations created: ${stats.locationsCreated}`)
    console.log(`   Items updated: ${stats.itemsUpdated}`)
    console.log(`   Items skipped: ${stats.itemsSkipped}`)

    if (stats.errors.length > 0) {
      console.log(`\n❌ Errors (${stats.errors.length}):`)
      for (const error of stats.errors) {
        console.log(`   - ${error}`)
      }
    }

    console.log()
  })
  .catch((error) => {
    console.error("Fatal error:", error)
    process.exit(1)
  })
