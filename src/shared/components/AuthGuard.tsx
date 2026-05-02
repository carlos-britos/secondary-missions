import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@features/auth/store/useAuthStore'

export function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) return null

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <Outlet />
}
