import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { authStore } from '../store/authStore'

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
