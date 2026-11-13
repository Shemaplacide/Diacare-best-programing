import axios from 'axios'
import { authStore } from '../store/authStore'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8085/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  // A sleeping free-tier API can take about a minute to start
  timeout: 90_000,
})

// ── Slow-server notice ────────────────────────────────────────────────────────
// After SLOW_AFTER_MS without an answer we tell the UI the server may be waking.
const SLOW_AFTER_MS = 4000
let slowRequests = 0

export const API_SLOW_EVENT = 'diacare:api-slow'

function setSlow(delta) {
  slowRequests = Math.max(0, slowRequests + delta)
  window.dispatchEvent(new CustomEvent(API_SLOW_EVENT, { detail: { slow: slowRequests > 0 } }))
}

function finish(config) {
  if (!config) return
  clearTimeout(config._slowTimer)
  if (config._markedSlow) {
    config._markedSlow = false
    setSlow(-1)
  }
}

/** True when the request failed because the server could not be reached or is restarting. */
export function isServerUnavailable(err) {
  const status = err?.response?.status
  return !err?.response || status === 502 || status === 503 || status === 504
}

// Start the API early so it is awake by the time the user signs in.
export function warmUpApi() {
  return api.get('/health', { _silent: true }).catch(() => {})
}

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = authStore.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (!config._silent) {
    config._slowTimer = setTimeout(() => {
      config._markedSlow = true
      setSlow(1)
    }, SLOW_AFTER_MS)
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (res) => { finish(res.config); return res },
  (err) => {
    finish(err.config)
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
