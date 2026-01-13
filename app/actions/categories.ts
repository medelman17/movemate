"use server";

import { createClient } from "@/lib/supabase/server";
import type { Category, CategoryFormData } from "@/lib/types";
import { dbLogger } from "@/lib/logger";

/**
 * Get all categories for the current user, sorted by sort_order.
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    dbLogger.error({ error }, "Error fetching categories");
    throw new Error("Failed to load categories");
  }

  return data || [];
}

/**
 * Get a single category by ID.
 * Returns null if not found or not owned by current user.
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    dbLogger.error({ error }, "Error fetching category");
    throw new Error("Failed to load category");
  }

  return data;
}

/**
 * Create a new category for the current user.
 */
export async function createCategory(
  data: CategoryFormData
): Promise<Category> {
  const supabase = await createClient();

  // Validate input
  const name = data.name?.trim();
  if (!name) {
    throw new Error("Category name is required");
  }
  if (name.length > 50) {
    throw new Error("Category name must be 50 characters or less");
  }

  // Validate color format if provided
  if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
    throw new Error("Invalid color format. Use hex format like #FF5733");
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  // Get max sort_order for new category
  const { data: maxOrderData } = await supabase
    .from("categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const nextSortOrder = (maxOrderData?.sort_order ?? -1) + 1;

  // Insert category
  const { data: category, error } = await supabase
    .from("categories")
    .insert({
      user_id: user.id,
      name,
      icon: data.icon || null,
      color: data.color || null,
      sort_order: nextSortOrder,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // Unique constraint violation
      throw new Error("A category with this name already exists");
    }
    dbLogger.error({ error }, "Error creating category");
    throw new Error("Failed to create category");
  }

  return category;
}

/**
 * Update an existing category.
 */
export async function updateCategory(
  id: string,
  data: Partial<CategoryFormData>
): Promise<Category> {
  const supabase = await createClient();

  // Validate name if provided
  if (data.name !== undefined) {
    const name = data.name?.trim();
    if (!name) {
      throw new Error("Category name is required");
    }
    if (name.length > 50) {
      throw new Error("Category name must be 50 characters or less");
    }
    data.name = name;
  }

  // Validate color format if provided
  if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
    throw new Error("Invalid color format. Use hex format like #FF5733");
  }

  const { data: category, error } = await supabase
    .from("categories")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("A category with this name already exists");
    }
    if (error.code === "PGRST116") {
      throw new Error("Category not found");
    }
    dbLogger.error({ error }, "Error updating category");
    throw new Error("Failed to update category");
  }

  return category;
}

/**
 * Delete a category, optionally reassigning items to another category.
 *
 * @param id - Category ID to delete
 * @param reassignToId - If provided, move items to this category. If null/undefined, items become unassigned.
 */
export async function deleteCategory(
  id: string,
  reassignToId?: string | null
): Promise<void> {
  const supabase = await createClient();

  // Prevent reassigning to self
  if (reassignToId === id) {
    throw new Error("Cannot reassign items to the category being deleted");
  }

  // Verify reassign target exists if provided
  if (reassignToId) {
    const { data: targetCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("id", reassignToId)
      .single();

    if (!targetCategory) {
      throw new Error("Target category not found");
    }
  }

  // Reassign items if target provided (otherwise ON DELETE SET NULL handles it)
  if (reassignToId) {
    const { error: reassignError } = await supabase
      .from("items")
      .update({ category_id: reassignToId })
      .eq("category_id", id);

    if (reassignError) {
      dbLogger.error({ error: reassignError }, "Error reassigning items");
      throw new Error("Failed to reassign items");
    }
  }

  // Delete the category
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("Category not found");
    }
    dbLogger.error({ error }, "Error deleting category");
    throw new Error("Failed to delete category");
  }
}

/**
 * Reorder categories by updating their sort_order.
 *
 * @param orderedIds - Array of category IDs in desired order
 */
export async function reorderCategories(orderedIds: string[]): Promise<void> {
  const supabase = await createClient();

  // Update each category's sort_order based on array index
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("categories")
      .update({ sort_order: index, updated_at: new Date().toISOString() })
      .eq("id", id)
  );

  const results = await Promise.all(updates);

  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    dbLogger.error({ errors }, "Errors reordering categories");
    throw new Error("Failed to reorder categories");
  }
}

/**
 * Get item counts per category.
 *
 * @returns Record mapping category_id to count (includes "unassigned" key for null category_id)
 */
export async function getCategoryItemCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("items")
    .select("category_id");

  if (error) {
    dbLogger.error({ error }, "Error fetching item counts");
    throw new Error("Failed to load item counts");
  }

  // Count items per category_id
  const counts: Record<string, number> = {};
  for (const item of data || []) {
    const key = item.category_id || "unassigned";
    counts[key] = (counts[key] || 0) + 1;
  }

  return counts;
}

/**
 * Default categories to seed for new users.
 * Icons are general-purpose emoji representing each category.
 */
const DEFAULT_CATEGORIES = [
  { name: "Furniture", icon: "🪑" },
  { name: "Electronics", icon: "📱" },
  { name: "Kitchenware", icon: "🍳" },
  { name: "Clothing", icon: "👕" },
  { name: "Books", icon: "📚" },
  { name: "Decor", icon: "🖼️" },
  { name: "Tools", icon: "🔧" },
  { name: "Sports & Outdoors", icon: "⚽" },
  { name: "Toys & Games", icon: "🎮" },
  { name: "Other", icon: "📦" },
] as const;

/**
 * Seed default categories if user has none.
 * This is idempotent - safe to call multiple times.
 *
 * @returns The user's categories (either existing or newly created defaults)
 */
export async function seedDefaultCategoriesIfNeeded(): Promise<Category[]> {
  const supabase = await createClient();

  // Check if user already has categories
  const existing = await getCategories();
  if (existing.length > 0) {
    return existing;
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  // Batch insert all default categories
  const categoriesToInsert = DEFAULT_CATEGORIES.map((cat, index) => ({
    user_id: user.id,
    name: cat.name,
    icon: cat.icon,
    color: null,
    sort_order: index,
  }));

  const { data, error } = await supabase
    .from("categories")
    .insert(categoriesToInsert)
    .select();

  if (error) {
    dbLogger.error({ error }, "Error seeding default categories");
    throw new Error("Failed to create default categories");
  }

  dbLogger.info({ count: data.length, userId: user.id }, "Seeded default categories");
  return data;
}
