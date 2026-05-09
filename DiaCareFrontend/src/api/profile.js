import api from './axios'

export const getMe         = ()     => api.get('/auth/me')
export const updateMe      = (data) => api.put('/auth/me', data)
export const changePassword = (data) => api.put('/auth/me/password', data)
