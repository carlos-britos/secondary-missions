import type { Database } from '@shared/lib/supabase/database.types'

export type MissionRarity = Database['public']['Enums']['mission_rarity']
export type MissionType = Database['public']['Enums']['mission_type']
export type PublicStatus = Database['public']['Enums']['public_status']

export interface PendingMission {
  id: string
  title: string
  description: string | null
  type: MissionType
  rarity: MissionRarity
  tags: string[] | null
  public_status: PublicStatus
  created_at: string | null
  updated_at: string | null
  user_id: string
  author_username: string | null
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string | null
  mission_id: string | null
  is_read: boolean
  created_at: string | null
}
