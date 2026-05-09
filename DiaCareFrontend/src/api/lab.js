import api from './axios'

export const getMyLabResults = () => api.get('/metrics/history')
export const getLatestMetrics = () => api.get('/metrics/latest')
export const recordMetrics   = (data) => api.post('/metrics', data)
