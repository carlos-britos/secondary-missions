import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { onAuthStateChange } from '@shared/lib/supabase/auth'
import { fetchUserProfile } from '../services/profileService'
import type { UserProfile } from '../types'

interface AuthStore {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  fetchProfile: (userId: string) => Promise<void>
  clearAuth: () => void
  initialize: () => () => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setProfile: (profile) => set({ profile }),

  fetchProfile: async (userId) => {
    try {
      const profile = await fetchUserProfile(userId)
      set({ profile })
    } catch {
      set({ profile: null })
    }
  },

  clearAuth: () =>
    set({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  initialize: () => {
    const { fetchProfile } = get()

    const {
      data: { subscription },
    } = onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null
      set({ user, isAuthenticated: !!user })

      if (
        user &&
        (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')
      ) {
        await fetchProfile(user.id)
      }

      if (event === 'SIGNED_OUT') {
        get().clearAuth()
      }

      if (get().isLoading) {
        set({ isLoading: false })
      }
    })

    return () => subscription.unsubscribe()
  },
}))
