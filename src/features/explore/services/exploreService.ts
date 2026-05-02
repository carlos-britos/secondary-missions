import { supabase } from '@shared/lib/supabase/client'
import type { PublicMission, ExploreFilters } from '../types'

export async function fetchPublicMissions(filters: ExploreFilters): Promise<PublicMission[]> {
  let query = supabase
    .from('missions')
    .select(
      'id, title, description, type, rarity, tags, expires_at, adoption_count, created_at, user_id, users!inner(username)'
    )
    .eq('is_public', true)
    .eq('public_status', 'approved')

  if (filters.search.trim()) {
    const term = `%${filters.search.trim()}%`
    query = query.or(`title.ilike.${term},description.ilike.${term}`)
  }

  if (filters.rarity) {
    query = query.eq('rarity', filters.rarity)
  }

  if (filters.type) {
    query = query.eq('type', filters.type)
  }

  if (filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags)
  }

  if (filters.sortBy === 'recent') {
    query = query.order('created_at', { ascending: false })
  } else if (filters.sortBy === 'most_adopted') {
    query = query.order('adoption_count', { ascending: false })
  }

  const { data, error } = await query.limit(50)

  if (error) throw error

  const missions: PublicMission[] = (data ?? []).map((row: Record<string, unknown>) => {
    const users = row.users as { username: string | null } | null
    return {
      id: row.id as string,
      title: row.title as string,
      description: row.description as string | null,
      type: row.type as PublicMission['type'],
      rarity: row.rarity as PublicMission['rarity'],
      tags: row.tags as string[] | null,
      expires_at: row.expires_at as string | null,
      adoption_count: (row.adoption_count as number) ?? 0,
      created_at: row.created_at as string | null,
      user_id: row.user_id as string,
      author_username: users?.username ?? null,
    }
  })

  if (filters.sortBy === 'random') {
    for (let i = missions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = missions[i]!
      missions[i] = missions[j]!
      missions[j] = tmp
    }
  }

  return missions
}

export async function fetchGlobalTags(): Promise<string[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('tags')
    .eq('is_public', true)
    .eq('public_status', 'approved')
    .not('tags', 'eq', '{}')

  if (error) throw error

  const tagSet = new Set<string>()
  for (const row of data ?? []) {
    for (const tag of row.tags ?? []) {
      tagSet.add(tag)
    }
  }
  return Array.from(tagSet).sort()
}

export async function adoptMission(sourceMission: PublicMission, userId: string): Promise<void> {
  const { error: insertError } = await supabase.from('missions').insert({
    user_id: userId,
    title: sourceMission.title,
    description: sourceMission.description,
    type: sourceMission.type,
    rarity: sourceMission.rarity,
    tags: sourceMission.tags ?? [],
    is_public: false,
    public_status: 'draft' as const,
    status: 'active' as const,
  })

  if (insertError) throw insertError

  await supabase.rpc('increment_adoption_count', {
    mission_id_input: sourceMission.id,
  })
}
