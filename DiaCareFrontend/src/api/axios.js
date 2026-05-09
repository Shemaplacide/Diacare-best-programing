import axios from 'axios'
import { authStore } from '../store/authStore'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8085/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = authStore.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status  = err.response?.status
    const url     = err.config?.url ?? ''
    const isAuthEndpoint = url.includes('/auth/')

    // Only clear session and redirect on 401/403 from protected endpoints,
    // NOT from /auth/login or /auth/register (those are expected failures)
    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      authStore.clear()
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')) {
        window.location.replace('/login')
      }
    }

    return Promise.reject(err)
  }
)

export default api
