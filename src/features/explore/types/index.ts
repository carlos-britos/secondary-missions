import type { Database } from '@shared/lib/supabase/database.types'

export type MissionRarity = Database['public']['Enums']['mission_rarity']
export type MissionType = Database['public']['Enums']['mission_type']

export type ExploreSortBy = 'recent' | 'most_adopted' | 'random'

export interface ExploreFilters {
  search: string
  rarity: MissionRarity | null
  type: MissionType | null
  tags: string[]
  sortBy: ExploreSortBy
}

export interface PublicMission {
  id: string
  title: string
  description: string | null
  type: MissionType
  rarity: MissionRarity
  tags: string[] | null
  expires_at: string | null
  adoption_count: number
  created_at: string | null
  user_id: string
  author_username: string | null
}
