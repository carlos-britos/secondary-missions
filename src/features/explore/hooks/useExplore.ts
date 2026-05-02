import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@features/auth/store/useAuthStore'
import { fetchPublicMissions, fetchGlobalTags, adoptMission } from '../services/exploreService'
import type { ExploreFilters, PublicMission } from '../types'

const defaultFilters: ExploreFilters = {
  search: '',
  rarity: null,
  type: null,
  tags: [],
  sortBy: 'recent',
}

export function useExplore() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState<ExploreFilters>(defaultFilters)

  const missionsQuery = useQuery({
    queryKey: ['explore', filters],
    queryFn: () => fetchPublicMissions(filters),
  })

  const tagsQuery = useQuery({
    queryKey: ['explore-tags'],
    queryFn: fetchGlobalTags,
    staleTime: 1000 * 60 * 5,
  })

  const adoptMut = useMutation({
    mutationFn: (mission: PublicMission) => adoptMission(mission, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['explore'] })
      queryClient.invalidateQueries({ queryKey: ['missions', user?.id] })
    },
  })

  const updateFilter = useCallback(
    <K extends keyof ExploreFilters>(key: K, value: ExploreFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const resetFilters = useCallback(() => setFilters(defaultFilters), [])

  return {
    missions: missionsQuery.data ?? [],
    isLoading: missionsQuery.isLoading,
    error: missionsQuery.error,
    filters,
    updateFilter,
    resetFilters,
    globalTags: tagsQuery.data ?? [],
    adopt: adoptMut.mutateAsync,
    isAdopting: adoptMut.isPending,
  }
}
