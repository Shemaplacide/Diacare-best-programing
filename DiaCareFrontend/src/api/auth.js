import api from './axios'

/**
 * Login
 * POST /auth/login
 * @param {{ email: string, password: string }} credentials
 */
export const login = (credentials) =>
  api.post('/auth/login', credentials)

/**
 * Register
 * POST /auth/register
 * @param {{
 *   name: string,
 *   email: string,
 *   password: string,
 *   is_doctor?: boolean,
 *   license_number?: string,
 *   specialization?: string,
 *   hospital?: string
 * }} data
 */
export const register = (data) =>
  api.post('/auth/register', data)

/**
 * Logout
 * POST /auth/logout
 */
export const logout = () =>
  api.post('/auth/logout')

/**
 * Refresh access token
 * POST /auth/refresh
 * @param {string} refreshToken
 */
export const refreshToken = (refreshToken) =>
  api.post('/auth/refresh', { refresh_token: refreshToken })

/**
 * Get current authenticated user
 * GET /auth/me
 */
export const getMe = () =>
  api.get('/auth/me')

/**
 * Forgot password — send reset email
 * POST /auth/forgot-password
 * @param {string} email
 */
export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email })

/**
 * Reset password with token
 * POST /auth/reset-password
 * @param {{ token: string, password: string }} data
 */
export const resetPassword = (data) =>
  api.post('/auth/reset-password', data)
