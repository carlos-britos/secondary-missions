import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@features/auth/store/useAuthStore'

export function AdminGuard() {
  const { profile, isLoading } = useAuthStore()

  if (isLoading) return null

  if (!profile?.is_admin) return <Navigate to="/dashboard" replace />

  return <Outlet />
}
