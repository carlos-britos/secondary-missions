import { supabase } from '@shared/lib/supabase/client'
import type { UserProfile, UserProfileUpdate } from '../types'

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

export async function updateUserProfile(
  userId: string,
  updates: UserProfileUpdate
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function checkUsernameAvailability(
  username: string,
  currentUserId?: string
): Promise<boolean> {
  let query = supabase.from('users').select('id').eq('username', username)

  if (currentUserId) {
    query = query.neq('id', currentUserId)
  }

  const { data, error } = await query

  if (error) throw error
  return !data || data.length === 0
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}
