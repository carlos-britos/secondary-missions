import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@features/auth/store/useAuthStore'
import {
  fetchPendingMissions,
  approveMission,
  rejectMission,
  fetchUserNotifications,
  markNotificationsRead,
} from '../services/moderationService'

export function useModeration() {
  const queryClient = useQueryClient()

  const pendingQuery = useQuery({
    queryKey: ['moderation', 'pending'],
    queryFn: fetchPendingMissions,
  })

  const approveMut = useMutation({
    mutationFn: approveMission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation'] })
      queryClient.invalidateQueries({ queryKey: ['explore'] })
    },
  })

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => rejectMission(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation'] })
    },
  })

  return {
    pendingMissions: pendingQuery.data ?? [],
    isLoading: pendingQuery.isLoading,
    error: pendingQuery.error,
    approve: approveMut.mutateAsync,
    isApproving: approveMut.isPending,
    reject: rejectMut.mutateAsync,
    isRejecting: rejectMut.isPending,
  }
}

export function useNotifications() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const notificationsQuery = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => fetchUserNotifications(user!.id),
    enabled: !!user?.id,
    refetchInterval: 30000,
  })

  const markReadMut = useMutation({
    mutationFn: () => markNotificationsRead(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
    },
  })

  const unreadCount = (notificationsQuery.data ?? []).filter((n) => !n.is_read).length

  return {
    notifications: notificationsQuery.data ?? [],
    unreadCount,
    markAllRead: markReadMut.mutateAsync,
  }
}
