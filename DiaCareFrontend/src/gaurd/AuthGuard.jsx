import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { authStore } from '../store/authStore'

/**
 * Protects a route group.
 * - If not authenticated → redirect to /login
 * - If role is specified and doesn't match → redirect to the user's home
 * - Otherwise → render children (layout with <Outlet />) or <Outlet /> directly
 */
export default function AuthGuard({ children, role }) {
  const location = useLocation()

  if (!authStore.isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role && authStore.getRole() !== role) {
    return <Navigate to={authStore.getHomePath()} replace />
  }

  return children ?? <Outlet />
}
