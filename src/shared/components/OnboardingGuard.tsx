import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@features/auth/store/useAuthStore'

export function OnboardingGuard() {
  const { profile, isLoading } = useAuthStore()

  if (isLoading) return null

  if (!profile?.username) return <Navigate to="/setup" replace />

  if (!profile.onboarding_completed) return <Navigate to="/onboarding" replace />

  return <Outlet />
}
