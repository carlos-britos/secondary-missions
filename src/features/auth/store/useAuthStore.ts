import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@shared/lib/supabase/client'
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

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        const user = session?.user ?? null
        set({ user, isAuthenticated: !!user })
        if (user) {
          await fetchProfile(user.id)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (get().isLoading) {
          set({ isLoading: false })
        }
      })

    const {
      data: { subscription },
    } = onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') return

      const user = session?.user ?? null

      if (event === 'SIGNED_OUT') {
        get().clearAuth()
        return
      }

      set({ user, isAuthenticated: !!user })

      if (user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        await fetchProfile(user.id)
      }
    })

    return () => subscription.unsubscribe()
  },
}))
