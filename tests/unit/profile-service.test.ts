import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSingle = vi.fn()
const mockNeq = vi.fn()

function createQueryChain() {
  const chain: Record<string, unknown> = {}
  chain.select = vi.fn().mockReturnValue(chain)
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.neq = mockNeq.mockReturnValue(chain)
  chain.single = mockSingle
  chain.update = vi.fn().mockReturnValue(chain)
  chain.then = undefined
  return chain
}

const mockChain = createQueryChain()

vi.mock('@shared/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => mockChain),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/avatar.jpg' },
        }),
      })),
    },
  },
}))

describe('profileService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchUserProfile returns null when no profile found', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116' },
    })

    const { fetchUserProfile } = await import('../../src/features/auth/services/profileService')
    const result = await fetchUserProfile('non-existent-id')
    expect(result).toBeNull()
  })

  it('fetchUserProfile returns profile data', async () => {
    const mockProfile = {
      id: '123',
      username: 'testuser',
      avatar_url: null,
      bio: null,
      language: 'es',
      is_admin: false,
      onboarding_completed: false,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    }

    mockSingle.mockResolvedValue({ data: mockProfile, error: null })

    const { fetchUserProfile } = await import('../../src/features/auth/services/profileService')
    const result = await fetchUserProfile('123')
    expect(result).toEqual(mockProfile)
  })

  it('fetchUserProfile throws on unexpected errors', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: 'UNKNOWN', message: 'unexpected' },
    })

    const { fetchUserProfile } = await import('../../src/features/auth/services/profileService')
    await expect(fetchUserProfile('123')).rejects.toEqual({
      code: 'UNKNOWN',
      message: 'unexpected',
    })
  })
})
