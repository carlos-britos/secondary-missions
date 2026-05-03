import { supabase } from '@shared/lib/supabase/client'
import type { PendingMission, Notification } from '../types'

export async function fetchPendingMissions(): Promise<PendingMission[]> {
  const { data, error } = await supabase
    .from('missions')
    .select(
      'id, title, description, type, rarity, tags, public_status, created_at, updated_at, user_id, users!inner(username)'
    )
    .eq('is_public', true)
    .eq('public_status', 'pending')
    .order('updated_at', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row: Record<string, unknown>) => {
    const users = row.users as { username: string | null } | null
    return {
      id: row.id as string,
      title: row.title as string,
      description: row.description as string | null,
      type: row.type as PendingMission['type'],
      rarity: row.rarity as PendingMission['rarity'],
      tags: row.tags as string[] | null,
      public_status: row.public_status as PendingMission['public_status'],
      created_at: row.created_at as string | null,
      updated_at: row.updated_at as string | null,
      user_id: row.user_id as string,
      author_username: users?.username ?? null,
    }
  })
}

export async function approveMission(missionId: string): Promise<void> {
  const { error } = await supabase.rpc('approve_mission', { p_mission_id: missionId })
  if (error) throw error
}

export async function rejectMission(missionId: string, reason?: string): Promise<void> {
  const { error } = await supabase.rpc('reject_mission', {
    p_mission_id: missionId,
    p_reason: reason ?? null,
  })
  if (error) throw error
}

export async function fetchUserNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data ?? []
}

export async function markNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) throw error
}
