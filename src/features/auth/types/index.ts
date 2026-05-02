import type { Database } from '@shared/lib/supabase/database.types'
import type { User } from '@supabase/supabase-js'

export type UserProfile = Database['public']['Tables']['users']['Row']
export type UserProfileUpdate = Database['public']['Tables']['users']['Update']
export type UserLanguage = Database['public']['Enums']['user_language']

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthActions {
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  fetchProfile: (userId: string) => Promise<void>
  clearAuth: () => void
  initialize: () => () => void
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
}

export interface ProfileSetupFormData {
  username: string
  language: UserLanguage
}
