"use server";

import { createClient } from "@/lib/supabase/server";
import type { Location, LocationFormData } from "@/lib/types";
import { dbLogger } from "@/lib/logger";

/**
 * Get all locations for the current user, sorted by sort_order.
 */
export async function getLocations(): Promise<Location[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    dbLogger.error({ error }, "Error fetching locations");
    throw new Error("Failed to load locations");
  }

  return data || [];
}

/**
 * Get a single location by ID.
 * Returns null if not found or not owned by current user.
 */
export async function getLocationById(id: string): Promise<Location | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    dbLogger.error({ error }, "Error fetching location");
    throw new Error("Failed to load location");
  }

  return data;
}

/**
 * Create a new location for the current user.
 */
export async function createLocation(
  data: LocationFormData
): Promise<Location> {
  const supabase = await createClient();

  // Validate input
  const name = data.name?.trim();
  if (!name) {
    throw new Error("Location name is required");
  }
  if (name.length > 50) {
    throw new Error("Location name must be 50 characters or less");
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

  // Get max sort_order for new location
  const { data: maxOrderData } = await supabase
    .from("locations")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const nextSortOrder = (maxOrderData?.sort_order ?? -1) + 1;

  // Insert location
  const { data: location, error } = await supabase
    .from("locations")
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
      throw new Error("A location with this name already exists");
    }
    dbLogger.error({ error }, "Error creating location");
    throw new Error("Failed to create location");
  }

  return location;
}

/**
 * Update an existing location.
 */
export async function updateLocation(
  id: string,
  data: Partial<LocationFormData>
): Promise<Location> {
  const supabase = await createClient();

  // Validate name if provided
  if (data.name !== undefined) {
    const name = data.name?.trim();
    if (!name) {
      throw new Error("Location name is required");
    }
    if (name.length > 50) {
      throw new Error("Location name must be 50 characters or less");
    }
    data.name = name;
  }

  // Validate color format if provided
  if (data.color && !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
    throw new Error("Invalid color format. Use hex format like #FF5733");
  }

  const { data: location, error } = await supabase
    .from("locations")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("A location with this name already exists");
    }
    if (error.code === "PGRST116") {
      throw new Error("Location not found");
    }
    dbLogger.error({ error }, "Error updating location");
    throw new Error("Failed to update location");
  }

  return location;
}

/**
 * Delete a location, optionally reassigning items to another location.
 *
 * @param id - Location ID to delete
 * @param reassignToId - If provided, move items to this location. If null/undefined, items become unassigned.
 */
export async function deleteLocation(
  id: string,
  reassignToId?: string | null
): Promise<void> {
  const supabase = await createClient();

  // Prevent reassigning to self
  if (reassignToId === id) {
    throw new Error("Cannot reassign items to the location being deleted");
  }

  // Verify reassign target exists if provided
  if (reassignToId) {
    const { data: targetLocation } = await supabase
      .from("locations")
      .select("id")
      .eq("id", reassignToId)
      .single();

    if (!targetLocation) {
      throw new Error("Target location not found");
    }
  }

  // Reassign items if target provided (otherwise ON DELETE SET NULL handles it)
  if (reassignToId) {
    const { error: reassignError } = await supabase
      .from("items")
      .update({ location_id: reassignToId })
      .eq("location_id", id);

    if (reassignError) {
      dbLogger.error({ error: reassignError }, "Error reassigning items");
      throw new Error("Failed to reassign items");
    }
  }

  // Delete the location
  const { error } = await supabase.from("locations").delete().eq("id", id);

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("Location not found");
    }
    dbLogger.error({ error }, "Error deleting location");
    throw new Error("Failed to delete location");
  }
}

/**
 * Reorder locations by updating their sort_order.
 *
 * @param orderedIds - Array of location IDs in desired order
 */
export async function reorderLocations(orderedIds: string[]): Promise<void> {
  const supabase = await createClient();

  // Update each location's sort_order based on array index
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("locations")
      .update({ sort_order: index, updated_at: new Date().toISOString() })
      .eq("id", id)
  );

  const results = await Promise.all(updates);

  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    dbLogger.error({ errors }, "Errors reordering locations");
    throw new Error("Failed to reorder locations");
  }
}

/**
 * Get item counts per location.
 *
 * @returns Record mapping location_id to count (includes "unassigned" key for null location_id)
 */
export async function getLocationItemCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("items")
    .select("location_id");

  if (error) {
    dbLogger.error({ error }, "Error fetching item counts");
    throw new Error("Failed to load item counts");
  }

  // Count items per location_id
  const counts: Record<string, number> = {};
  for (const item of data || []) {
    const key = item.location_id || "unassigned";
    counts[key] = (counts[key] || 0) + 1;
  }

  return counts;
}

/**
 * Default locations to seed for new users.
 */
const DEFAULT_LOCATIONS = [
  { name: "Living Room", icon: "🛋️" },
  { name: "Bedroom", icon: "🛏️" },
  { name: "Kitchen", icon: "🍳" },
  { name: "Bathroom", icon: "🚿" },
  { name: "Dining Room", icon: "🍽️" },
  { name: "Office", icon: "💼" },
  { name: "Garage", icon: "🚗" },
  { name: "Storage", icon: "📦" },
  { name: "Outdoor", icon: "🌳" },
] as const;

/**
 * Seed default locations if user has none.
 * This is idempotent - safe to call multiple times.
 *
 * @returns The user's locations (either existing or newly created defaults)
 */
export async function seedDefaultLocationsIfNeeded(): Promise<Location[]> {
  const supabase = await createClient();

  // Check if user already has locations
  const existing = await getLocations();
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

  // Batch insert all default locations
  const locationsToInsert = DEFAULT_LOCATIONS.map((loc, index) => ({
    user_id: user.id,
    name: loc.name,
    icon: loc.icon,
    color: null,
    sort_order: index,
  }));

  const { data, error } = await supabase
    .from("locations")
    .insert(locationsToInsert)
    .select();

  if (error) {
    dbLogger.error({ error }, "Error seeding default locations");
    throw new Error("Failed to create default locations");
  }

  dbLogger.info({ count: data.length, userId: user.id }, "Seeded default locations");
  return data;
}
