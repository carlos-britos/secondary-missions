import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@features/auth/store/useAuthStore'

export function GuestGuard() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) return null

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return <Outlet />
}
