import { useMutation } from '@tanstack/react-query'
import { changePassword, deleteUserAccount } from '../services/settingsService'

export function useSettings() {
  const passwordMutation = useMutation({
    mutationFn: (newPassword: string) => changePassword(newPassword),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteUserAccount(),
  })

  return {
    changePassword: passwordMutation.mutateAsync,
    isChangingPassword: passwordMutation.isPending,
    passwordError: passwordMutation.error,
    deleteAccount: deleteMutation.mutateAsync,
    isDeletingAccount: deleteMutation.isPending,
    deleteError: deleteMutation.error,
  }
}
