import { supabase } from '@shared/lib/supabase/client'

export async function changePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function deleteUserAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_user_account')
  if (error) throw error
}
