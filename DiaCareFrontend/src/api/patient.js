import api from './axios'

export const getMyProfile    = ()           => api.get('/patients/me')
export const updateMyProfile = (publicId, data) => api.put(`/patients/${publicId}`, data)
