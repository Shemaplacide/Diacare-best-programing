import api from './axios'

export const getAllDoctors = () => api.get('/doctors/all')
