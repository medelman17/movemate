export interface Item {
  id: string
  user_id: string
  name: string
  description: string | null
  category: string
  location: string
  location_id: string | null
  quantity: number
  weight: number | null
  length: number | null
  width: number | null
  height: number | null
  can_disassemble: boolean
  is_fragile: boolean
  photo_url: string | null
  notes: string | null
  is_packed: boolean
  created_at: string
  updated_at: string
}

export type ItemFormData = Omit<Item, "id" | "user_id" | "created_at" | "updated_at">

/**
 * User-defined location for organizing inventory items.
 */
export interface Location {
  id: string
  user_id: string
  name: string
  icon: string | null
  color: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type LocationFormData = Pick<Location, "name" | "icon" | "color">

/**
 * Item with expanded location data (from JOIN).
 */
export interface ItemWithLocation extends Item {
  location_obj?: Location | null
}
