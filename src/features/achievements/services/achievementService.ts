import { supabase } from '@shared/lib/supabase/client'
import type { Achievement, UserAchievement, AchievementWithStatus } from '../types'
import type { Database, Json } from '@shared/lib/supabase/database.types'

type Mission = Database['public']['Tables']['missions']['Row']
type MissionCompletion = Database['public']['Tables']['mission_completions']['Row']

export async function fetchAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function fetchUserAchievements(userId: string): Promise<UserAchievement[]> {
  const { data, error } = await supabase.from('user_achievements').select('*').eq('user_id', userId)

  if (error) throw error
  return data
}

export async function fetchAchievementsWithStatus(
  userId: string
): Promise<AchievementWithStatus[]> {
  const [achievements, userAchievements] = await Promise.all([
    fetchAchievements(),
    fetchUserAchievements(userId),
  ])

  const unlockedMap = new Map(userAchievements.map((ua) => [ua.achievement_id, ua.unlocked_at]))

  return achievements.map((a) => ({
    ...a,
    unlocked: unlockedMap.has(a.id),
    unlocked_at: unlockedMap.get(a.id) ?? null,
  }))
}

async function unlockAchievement(userId: string, achievementId: string): Promise<void> {
  const { error } = await supabase
    .from('user_achievements')
    .insert({ user_id: userId, achievement_id: achievementId })

  if (error && error.code !== '23505') throw error
}

export async function createAutoAchievements(mission: Mission): Promise<void> {
  const achievements: Array<{
    id: string
    name_key: string
    description_key: string
    icon: string
    category: string
    condition_type: string
    condition_value: Json
  }> = []

  if (mission.type === 'one_time') {
    achievements.push({
      id: `auto_${mission.id}`,
      name_key: 'auto_one_time',
      description_key: 'auto_one_time_desc',
      icon: '✓',
      category: 'auto',
      condition_type: 'auto_one_time',
      condition_value: { mission_id: mission.id, mission_title: mission.title },
    })
  } else {
    for (const threshold of [10, 50, 100]) {
      achievements.push({
        id: `auto_weekly_${mission.id}_${threshold}`,
        name_key: 'auto_weekly',
        description_key: 'auto_weekly_desc',
        icon: threshold === 100 ? '🏆' : threshold === 50 ? '🥈' : '🥉',
        category: 'auto',
        condition_type: 'auto_weekly',
        condition_value: {
          mission_id: mission.id,
          mission_title: mission.title,
          threshold,
        },
      })
    }
  }

  for (const a of achievements) {
    const { error } = await supabase.from('achievements').insert(a)
    if (error && error.code !== '23505') throw error
  }
}

export async function evaluateAchievements(userId: string): Promise<string[]> {
  const [achievements, userAchievements, missions, completions] = await Promise.all([
    fetchAchievements(),
    fetchUserAchievements(userId),
    fetchAllUserMissions(userId),
    fetchAllUserCompletions(userId),
  ])

  const owned = new Set(userAchievements.map((ua) => ua.achievement_id))
  const newlyUnlocked: string[] = []

  for (const achievement of achievements) {
    if (owned.has(achievement.id)) continue

    const condition = (achievement.condition_value ?? {}) as Record<string, unknown>
    let earned = false

    switch (achievement.condition_type) {
      case 'completed_total':
        earned = countCompleted(missions) >= (condition.threshold as number)
        break

      case 'completed_one_time':
        earned = countCompletedByType(missions, 'one_time') >= (condition.threshold as number)
        break

      case 'weekly_count':
        earned = getMaxWeeklyCount(missions) >= (condition.threshold as number)
        break

      case 'rarity_count':
        earned =
          countCompletedByRarity(missions, condition.rarity as string) >=
          (condition.threshold as number)
        break

      case 'unique_tags':
        earned = countUniqueTags(missions) >= (condition.threshold as number)
        break

      case 'time_of_day': {
        const lastCompletion = completions[0]
        if (!lastCompletion?.created_at) break
        const hour = new Date(lastCompletion.created_at).getHours()
        if (condition.before_hour !== undefined) {
          earned = hour < (condition.before_hour as number)
        } else if (condition.after_hour !== undefined) {
          earned = hour >= (condition.after_hour as number) && hour < 5
        }
        break
      }

      case 'completions_in_day': {
        earned = getMaxCompletionsInDay(completions) >= (condition.threshold as number)
        break
      }

      case 'photos_count':
        earned = countPhotos(completions) >= (condition.threshold as number)
        break

      case 'public_approved':
        earned = countPublicApproved(missions) >= (condition.threshold as number)
        break

      case 'auto_one_time': {
        const mission = missions.find((m) => m.id === condition.mission_id)
        earned = mission?.status === 'completed'
        break
      }

      case 'auto_weekly': {
        const mission = missions.find((m) => m.id === condition.mission_id)
        earned = (mission?.completion_count ?? 0) >= (condition.threshold as number)
        break
      }

      default:
        break
    }

    if (earned) {
      await unlockAchievement(userId, achievement.id)
      newlyUnlocked.push(achievement.id)
    }
  }

  return newlyUnlocked
}

async function fetchAllUserMissions(userId: string): Promise<Mission[]> {
  const { data, error } = await supabase.from('missions').select('*').eq('user_id', userId)
  if (error) throw error
  return data
}

async function fetchAllUserCompletions(userId: string): Promise<MissionCompletion[]> {
  const { data, error } = await supabase
    .from('mission_completions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

function countCompleted(missions: Mission[]): number {
  return missions.filter((m) => m.status === 'completed').length
}

function countCompletedByType(missions: Mission[], type: string): number {
  return missions.filter((m) => m.status === 'completed' && m.type === type).length
}

function getMaxWeeklyCount(missions: Mission[]): number {
  return Math.max(
    0,
    ...missions.filter((m) => m.type === 'weekly').map((m) => m.completion_count ?? 0)
  )
}

function countCompletedByRarity(missions: Mission[], rarity: string): number {
  return missions.filter((m) => m.status === 'completed' && m.rarity === rarity).length
}

function countUniqueTags(missions: Mission[]): number {
  const tags = new Set<string>()
  for (const m of missions) {
    if (m.status === 'completed') {
      for (const t of m.tags ?? []) tags.add(t)
    }
  }
  return tags.size
}

function getMaxCompletionsInDay(completions: MissionCompletion[]): number {
  const byDay = new Map<string, number>()
  for (const c of completions) {
    if (!c.created_at) continue
    const day = c.created_at.slice(0, 10)
    byDay.set(day, (byDay.get(day) ?? 0) + 1)
  }
  return Math.max(0, ...byDay.values())
}

function countPhotos(completions: MissionCompletion[]): number {
  return completions.filter((c) => c.photo_url).length
}

function countPublicApproved(missions: Mission[]): number {
  return missions.filter((m) => m.is_public && m.public_status === 'approved').length
}
