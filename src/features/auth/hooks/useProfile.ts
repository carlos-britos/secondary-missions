import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/useAuthStore'
import { fetchUserProfile, updateUserProfile, uploadAvatar } from '../services/profileService'
import type { UserProfileUpdate } from '../types'

export function useProfile() {
  const { user, setProfile } = useAuthStore()
  const queryClient = useQueryClient()

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchUserProfile(user!.id),
    enabled: !!user?.id,
  })

  const updateMutation = useMutation({
    mutationFn: (updates: UserProfileUpdate) => updateUserProfile(user!.id, updates),
    onSuccess: (data) => {
      setProfile(data)
      queryClient.setQueryData(['profile', user?.id], data)
    },
  })

  const avatarMutation = useMutation({
    mutationFn: (file: File) => uploadAvatar(user!.id, file),
    onSuccess: async (publicUrl) => {
      await updateMutation.mutateAsync({ avatar_url: publicUrl })
    },
  })

  return {
    profile: profileQuery.data ?? null,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    uploadAvatar: avatarMutation.mutateAsync,
    isUploadingAvatar: avatarMutation.isPending,
  }
}
