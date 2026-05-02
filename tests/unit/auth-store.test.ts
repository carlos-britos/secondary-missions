import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@shared/lib/supabase/auth', () => ({
  getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  onAuthStateChange: vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  }),
}))

vi.mock('../../src/features/auth/services/profileService', () => ({
  fetchUserProfile: vi.fn().mockResolvedValue(null),
}))

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('starts with default state', async () => {
    const { useAuthStore } = await import('../../src/features/auth/store/useAuthStore')
    const state = useAuthStore.getState()

    expect(state.user).toBeNull()
    expect(state.profile).toBeNull()
    expect(state.isLoading).toBe(true)
    expect(state.isAuthenticated).toBe(false)
  })

  it('setUser updates user and isAuthenticated', async () => {
    const { useAuthStore } = await import('../../src/features/auth/store/useAuthStore')
    const mockUser = { id: '123', email: 'test@test.com' } as never

    useAuthStore.getState().setUser(mockUser)

    expect(useAuthStore.getState().user).toBe(mockUser)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('clearAuth resets all state', async () => {
    const { useAuthStore } = await import('../../src/features/auth/store/useAuthStore')
    const mockUser = { id: '123', email: 'test@test.com' } as never
    const mockProfile = { id: '123', username: 'test' } as never

    useAuthStore.getState().setUser(mockUser)
    useAuthStore.getState().setProfile(mockProfile)
    useAuthStore.getState().clearAuth()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.profile).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
  })
})
