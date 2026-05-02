import type { Database } from '@shared/lib/supabase/database.types'

export type Mission = Database['public']['Tables']['missions']['Row']
export type MissionInsert = Database['public']['Tables']['missions']['Insert']
export type MissionUpdate = Database['public']['Tables']['missions']['Update']

export type MissionType = Database['public']['Enums']['mission_type']
export type MissionRarity = Database['public']['Enums']['mission_rarity']
export type MissionStatus = Database['public']['Enums']['mission_status']
export type PublicStatus = Database['public']['Enums']['public_status']

export interface MissionFormData {
  title: string
  description: string
  type: MissionType
  rarity: MissionRarity
  tags: string[]
  expires_at: string | null
  is_public: boolean
  weekly_reset_day: number | null
}
