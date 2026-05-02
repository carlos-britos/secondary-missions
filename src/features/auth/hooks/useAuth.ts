import { useCallback } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { signIn, signUp, signOut } from '@shared/lib/supabase/auth'

export function useAuth() {
  const { user, profile, isLoading, isAuthenticated } = useAuthStore()

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await signIn(email, password)
    if (error) throw error
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const { error } = await signUp(email, password)
    if (error) throw error
  }, [])

  const logout = useCallback(async () => {
    const { error } = await signOut()
    if (error) throw error
  }, [])

  return {
    user,
    profile,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  }
}
