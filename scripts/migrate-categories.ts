#!/usr/bin/env npx tsx
/**
 * Migrate text-based category strings to structured category records.
 *
 * This script:
 * 1. Finds all unique category strings per user
 * 2. Creates category records with guessed icons
 * 3. Updates items with category_id foreign key
 *
 * Usage:
 *   npx tsx scripts/migrate-categories.ts --dry-run
 *   npx tsx scripts/migrate-categories.ts
 *
 * Environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (for admin access)
 */

import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

// Load environment variables from .env.local
config({ path: ".env.local" })

// Icon mapping for common category names
const ICON_MAP: Record<string, string> = {
  // Furniture
  "furniture": "🪑",
  "chair": "🪑",
  "table": "🪑",
  "sofa": "🛋️",
  "couch": "🛋️",
  "bed": "🛏️",
  "desk": "🪑",

  // Electronics
  "electronics": "📱",
  "electronic": "📱",
  "computer": "💻",
  "phone": "📱",
  "tv": "📺",
  "television": "📺",
  "audio": "🎵",
  "camera": "📷",

  // Kitchen
  "kitchenware": "🍳",
  "kitchen": "🍳",
  "cookware": "🍳",
  "appliance": "🍳",
  "dishes": "🍽️",

  // Clothing
  "clothing": "👕",
  "clothes": "👕",
  "apparel": "👕",
  "shoes": "👟",
  "accessories": "👜",

  // Books & Media
  "books": "📚",
  "book": "📚",
  "media": "📀",
  "movies": "🎬",
  "music": "🎵",

  // Decor
  "decor": "🖼️",
  "decoration": "🖼️",
  "art": "🎨",
  "plants": "🪴",
  "lighting": "💡",

  // Tools
  "tools": "🔧",
  "tool": "🔧",
  "hardware": "🔩",
  "garden": "🌱",

  // Sports & Outdoors
  "sports": "⚽",
  "sport": "⚽",
  "outdoors": "🏕️",
  "outdoor": "🏕️",
  "fitness": "🏋️",
  "exercise": "🏋️",

  // Toys & Games
  "toys": "🎮",
  "toy": "🧸",
  "games": "🎮",
  "game": "🎮",

  // Other
  "other": "📦",
  "misc": "📦",
  "miscellaneous": "📦",
  "storage": "📦",
}

function guessIcon(categoryName: string): string {
  const normalized = categoryName.toLowerCase().trim()

  // Exact match
  const exactMatch = ICON_MAP[normalized]
  if (exactMatch) {
    return exactMatch
  }

  // Partial match
  for (const [key, icon] of Object.entries(ICON_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return icon
    }
  }

  // Default
  return "📦"
}

interface MigrationStats {
  usersProcessed: number
  categoriesCreated: number
  itemsUpdated: number
  itemsSkipped: number
  errors: string[]
}

async function migrateCategories(dryRun: boolean): Promise<MigrationStats> {
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

  console.log("\n🔄 Migrating text categories to structured records...\n")
  console.log(`   Mode: ${dryRun ? "DRY RUN" : "LIVE"}\n`)

  const stats: MigrationStats = {
    usersProcessed: 0,
    categoriesCreated: 0,
    itemsUpdated: 0,
    itemsSkipped: 0,
    errors: [],
  }

  // Step 1: Get all items with text categories (no category_id set)
  const { data: items, error: itemsError } = await supabase
    .from("items")
    .select("id, user_id, category")
    .is("category_id", null)
    .not("category", "is", null)
    .neq("category", "")

  if (itemsError) {
    console.error("Error fetching items:", itemsError)
    process.exit(1)
  }

  if (!items || items.length === 0) {
    console.log("   No items with text categories to migrate.\n")
    return stats
  }

  console.log(`   Found ${items.length} items with text categories\n`)

  // Step 2: Group items by user and unique category name
  const userCategoryMap = new Map<string, Map<string, string[]>>()

  for (const item of items) {
    if (!item.user_id || !item.category) continue

    if (!userCategoryMap.has(item.user_id)) {
      userCategoryMap.set(item.user_id, new Map())
    }

    const categoryName = item.category.trim()
    const userCategories = userCategoryMap.get(item.user_id)!

    if (!userCategories.has(categoryName)) {
      userCategories.set(categoryName, [])
    }
    userCategories.get(categoryName)!.push(item.id)
  }

  console.log(`   Processing ${userCategoryMap.size} users...\n`)

  // Step 3: For each user, create category records and update items
  for (const [userId, categoryItems] of userCategoryMap) {
    stats.usersProcessed++
    console.log(`   👤 User ${userId.slice(0, 8)}...`)

    // Get existing categories for this user
    const { data: existingCategories } = await supabase
      .from("categories")
      .select("id, name")
      .eq("user_id", userId)

    const existingCategoryMap = new Map<string, string>()
    for (const cat of existingCategories || []) {
      existingCategoryMap.set(cat.name.toLowerCase(), cat.id)
    }

    // Get max sort_order for this user
    const { data: maxOrderData } = await supabase
      .from("categories")
      .select("sort_order")
      .eq("user_id", userId)
      .order("sort_order", { ascending: false })
      .limit(1)

    let nextSortOrder = (maxOrderData?.[0]?.sort_order ?? -1) + 1

    for (const [categoryName, itemIds] of categoryItems) {
      const normalizedName = categoryName.toLowerCase()

      // Check if category already exists (case-insensitive)
      let categoryId = existingCategoryMap.get(normalizedName)

      if (!categoryId) {
        // Create new category
        const icon = guessIcon(categoryName)
        console.log(`      📦 Creating "${categoryName}" (${icon})`)

        if (!dryRun) {
          const { data: newCategory, error: createError } = await supabase
            .from("categories")
            .insert({
              user_id: userId,
              name: categoryName,
              icon,
              sort_order: nextSortOrder++,
            })
            .select("id")
            .single()

          if (createError) {
            stats.errors.push(`Failed to create category "${categoryName}": ${createError.message}`)
            console.log(`         ❌ Error: ${createError.message}`)
            continue
          }

          categoryId = newCategory.id
        } else {
          categoryId = "dry-run-id"
        }

        stats.categoriesCreated++
        existingCategoryMap.set(normalizedName, categoryId!)
      } else {
        console.log(`      ✓ Using existing "${categoryName}"`)
      }

      // Update items with category_id
      console.log(`         Updating ${itemIds.length} items...`)

      if (!dryRun) {
        const { error: updateError } = await supabase
          .from("items")
          .update({ category_id: categoryId })
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

migrateCategories(dryRun)
  .then((stats) => {
    console.log("\n📊 Migration Summary:")
    console.log(`   Users processed: ${stats.usersProcessed}`)
    console.log(`   Categories created: ${stats.categoriesCreated}`)
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
