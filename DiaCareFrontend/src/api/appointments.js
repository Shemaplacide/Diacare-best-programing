import api from './axios'

export const getMyAppointments = ()              => api.get('/appointments/my')
export const bookAppointment   = (data)          => api.post('/appointments', data)
export const reschedule        = (id, newDate)   => api.put(`/appointments/${id}/reschedule`, newDate, { headers: { 'Content-Type': 'application/json' } })
export const cancelAppointment = (id)            => api.delete(`/appointments/${id}`)
export const updateStatus      = (id, status)    => api.put(`/appointments/${id}/status`, JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } })
