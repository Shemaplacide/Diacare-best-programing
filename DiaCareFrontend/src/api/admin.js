import api from './axios'

// Dashboard
export const getAdminDashboard  = ()     => api.get('/admin/dashboard')
export const getActivityLogs    = ()     => api.get('/admin/activity-logs')

// Patients
export const getAllPatients      = ()     => api.get('/admin/patients')
export const deletePatient       = (id)   => api.delete(`/admin/patients/${id}`)
export const createPatient       = (data) => api.post('/auth/register', data)
export const updatePatient       = (id, data) => api.put(`/admin/patients/${id}`, data)

// Staff (Doctors + Admins)
export const getAllStaff          = ()     => api.get('/admin/staff')
export const createStaff         = (data) => api.post('/admin/staff', data)
export const updateStaff         = (publicId, data) => api.put(`/admin/staff/${publicId}`, data)
export const deleteStaff         = (publicId) => api.delete(`/admin/staff/${publicId}`)
export const deactivateUser      = (publicId) => api.put(`/admin/users/${publicId}/deactivate`)
export const activateUser        = (publicId) => api.put(`/admin/users/${publicId}/activate`)

// Doctors (still used for appointment form dropdowns)
export const getAllDoctors        = ()     => api.get('/doctors/all')
export const updateDoctor         = (publicId, data) => api.put(`/admin/doctors/${publicId}`, data)
export const deleteDoctor         = (publicId) => api.delete(`/admin/doctors/${publicId}`)

// Appointments
export const getAllAppointments  = ()     => api.get('/admin/appointments')
export const createAppointment   = (data) => api.post('/admin/appointments', data)
export const deleteAppointment   = (id)   => api.delete(`/admin/appointments/${id}`)
export const updateApptStatus    = (id, status) =>
  api.put(`/appointments/${id}/status`, JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } })

// Glucose
export const getAllGlucose       = ()     => api.get('/admin/glucose')
export const createGlucose       = (data) => api.post('/admin/glucose', data)
export const deleteGlucose       = (id)   => api.delete(`/admin/glucose/${id}`)

// Metrics / Lab
export const getAllMetrics        = ()     => api.get('/admin/metrics')
export const createMetrics       = (data) => api.post('/admin/metrics', data)
