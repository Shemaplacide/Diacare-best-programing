import api from './axios'

export const getMyProfile    = ()           => api.get('/patients/me')
export const updateMyProfile = (data) => api.put('/patients/me', data)
export const updatePatientProfile = (publicId, data) => api.put(`/patients/${publicId}`, data)
