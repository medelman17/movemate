export interface Item {
  id: string
  user_id: string
  name: string
  description: string | null
  category: string
  location: string
  quantity: number
  weight: number | null
  length: number | null
  width: number | null
  height: number | null
  can_disassemble: boolean
  photo_url: string | null
  notes: string | null
  is_packed: boolean
  created_at: string
  updated_at: string
}

export type ItemFormData = Omit<Item, "id" | "user_id" | "created_at" | "updated_at">
