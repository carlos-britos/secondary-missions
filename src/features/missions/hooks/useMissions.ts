import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@features/auth/store/useAuthStore'
import {
  fetchUserMissions,
  createMission,
  updateMission,
  deleteMission,
  completeMission,
  incrementMissionCount,
  archiveMission,
} from '../services/missionService'
import { createAutoAchievements } from '@features/achievements'
import type { MissionInsert, MissionUpdate } from '../types'
import type { CompletionPayload } from '../services/missionService'

export function useMissions() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['missions', user?.id] })

  const missionsQuery = useQuery({
    queryKey: ['missions', user?.id],
    queryFn: () => fetchUserMissions(user!.id),
    enabled: !!user?.id,
  })

  const createMut = useMutation({
    mutationFn: async (data: Omit<MissionInsert, 'user_id'>) => {
      const mission = await createMission({ ...data, user_id: user!.id })
      createAutoAchievements(mission).catch(() => {})
      return mission
    },
    onSuccess: invalidate,
  })

  const updateMut = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: MissionUpdate }) =>
      updateMission(id, updates),
    onSuccess: invalidate,
  })

  const deleteMut = useMutation({
    mutationFn: deleteMission,
    onSuccess: invalidate,
  })

  const completeMut = useMutation({
    mutationFn: (payload: Omit<CompletionPayload, 'userId'>) =>
      completeMission({ ...payload, userId: user!.id }),
    onSuccess: invalidate,
  })

  const incrementMut = useMutation({
    mutationFn: (payload: Omit<CompletionPayload, 'userId'>) =>
      incrementMissionCount({ ...payload, userId: user!.id }),
    onSuccess: invalidate,
  })

  const archiveMut = useMutation({
    mutationFn: archiveMission,
    onSuccess: invalidate,
  })

  return {
    missions: missionsQuery.data ?? [],
    isLoading: missionsQuery.isLoading,
    error: missionsQuery.error,
    createMission: createMut.mutateAsync,
    isCreating: createMut.isPending,
    updateMission: updateMut.mutateAsync,
    isUpdating: updateMut.isPending,
    deleteMission: deleteMut.mutateAsync,
    isDeleting: deleteMut.isPending,
    completeMission: completeMut.mutateAsync,
    isCompleting: completeMut.isPending,
    incrementCount: incrementMut.mutateAsync,
    isIncrementing: incrementMut.isPending,
    archiveMission: archiveMut.mutateAsync,
    isArchiving: archiveMut.isPending,
  }
}
