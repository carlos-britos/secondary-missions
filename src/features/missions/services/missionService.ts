import { supabase } from '@shared/lib/supabase/client'
import type { Mission, MissionInsert, MissionUpdate } from '../types'

export async function fetchUserMissions(userId: string): Promise<Mission[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function fetchMission(id: string): Promise<Mission> {
  const { data, error } = await supabase.from('missions').select('*').eq('id', id).single()

  if (error) throw error
  return data
}

export async function createMission(mission: MissionInsert): Promise<Mission> {
  const { data, error } = await supabase.from('missions').insert(mission).select().single()

  if (error) throw error
  return data
}

export async function updateMission(id: string, updates: MissionUpdate): Promise<Mission> {
  const { data, error } = await supabase
    .from('missions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMission(id: string): Promise<void> {
  const { error } = await supabase.from('missions').delete().eq('id', id)

  if (error) throw error
}

export interface CompletionPayload {
  missionId: string
  userId: string
  note?: string
  photo?: File
}

async function uploadCompletionPhoto(
  userId: string,
  missionId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${missionId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage.from('completion-photos').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage.from('completion-photos').getPublicUrl(path)

  return publicUrl
}

export async function completeMission(payload: CompletionPayload): Promise<Mission> {
  const { missionId, userId, note, photo } = payload

  let photoUrl: string | null = null
  if (photo) {
    photoUrl = await uploadCompletionPhoto(userId, missionId, photo)
  }

  const { error: completionError } = await supabase.from('mission_completions').insert({
    mission_id: missionId,
    user_id: userId,
    note: note || null,
    photo_url: photoUrl,
  })
  if (completionError) throw completionError

  const { data, error } = await supabase
    .from('missions')
    .update({
      status: 'completed' as const,
      completed_at: new Date().toISOString(),
      completion_count: 1,
    })
    .eq('id', missionId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function incrementMissionCount(payload: CompletionPayload): Promise<Mission> {
  const { missionId, userId, note, photo } = payload

  let photoUrl: string | null = null
  if (photo) {
    photoUrl = await uploadCompletionPhoto(userId, missionId, photo)
  }

  const { error: completionError } = await supabase.from('mission_completions').insert({
    mission_id: missionId,
    user_id: userId,
    note: note || null,
    photo_url: photoUrl,
  })
  if (completionError) throw completionError

  const { error: rpcError } = await supabase.rpc('increment_completion_count', {
    mission_id_input: missionId,
  })
  if (rpcError) throw rpcError

  const { data, error } = await supabase.from('missions').select().eq('id', missionId).single()

  if (error) throw error
  return data
}

export async function archiveMission(id: string): Promise<Mission> {
  const { data, error } = await supabase
    .from('missions')
    .update({ status: 'completed' as const, completed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
