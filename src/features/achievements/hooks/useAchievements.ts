import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@features/auth/store/useAuthStore'
import { fetchAchievementsWithStatus, evaluateAchievements } from '../services/achievementService'

export function useAchievements() {
  const { user } = useAuthStore()

  const query = useQuery({
    queryKey: ['achievements', user?.id],
    queryFn: () => fetchAchievementsWithStatus(user!.id),
    enabled: !!user?.id,
  })

  const catalog = (query.data ?? []).filter((a) => a.category === 'catalog')
  const auto = (query.data ?? []).filter((a) => a.category === 'auto')

  return {
    catalog,
    auto,
    all: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    evaluate: () => (user ? evaluateAchievements(user.id) : Promise.resolve([])),
  }
}
