import type { Database } from '@shared/lib/supabase/database.types'

export type Achievement = Database['public']['Tables']['achievements']['Row']
export type UserAchievement = Database['public']['Tables']['user_achievements']['Row']

export interface AchievementWithStatus extends Achievement {
  unlocked: boolean
  unlocked_at: string | null
}
