import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { logout } from '../api/auth'
import { authStore } from '../store/authStore'

export function useSignOut() {
  const navigate = useNavigate()

  return async () => {
    try {
      await logout()
    } catch {
      // silently ignore — backend may already have invalidated the session
    } finally {
      authStore.clear()
      toast.info('You have been signed out')
      navigate('/login', { replace: true })
    }
  }
}
