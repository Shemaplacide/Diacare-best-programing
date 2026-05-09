import api from './axios'

// Dashboard
export const getDoctorDashboard  = ()     => api.get('/doctors/dashboard')
export const getDoctorProfile    = ()     => api.get('/doctors/me')

// Patients
export const getMyPatients       = ()     => api.get('/doctors/my-patients')

// Appointments
export const getMyAppointments   = ()     => api.get('/appointments/my')
export const updateApptStatus    = (id, status) =>
  api.put(`/appointments/${id}/status`, JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } })
export const rescheduleAppt      = (id, newDate) =>
  api.put(`/appointments/${id}/reschedule`, newDate, { headers: { 'Content-Type': 'application/json' } })
export const cancelAppt          = (id)   => api.delete(`/appointments/${id}`)

// Glucose — /glucose/all is accessible to DOCTOR role
export const getAllGlucose        = ()     => api.get('/glucose/all')

// Prescriptions
export const getMyPrescriptions  = ()     => api.get('/prescriptions/my')
export const createPrescription  = (data) => api.post('/prescriptions', data)
export const deletePrescription  = (id)   => api.delete(`/prescriptions/${id}`)

// Meal Plans
export const getMyMealPlans      = ()     => api.get('/meal-plans/my')
export const createMealPlan      = (data) => api.post('/meal-plans', data)
export const deleteMealPlan      = (id)   => api.delete(`/meal-plans/${id}`)

// Metrics / Lab
export const getMyMetrics        = ()           => api.get('/metrics/history')
export const getAllMetrics        = ()           => api.get('/metrics/all')
export const recordMetrics       = (patientPublicId, data) => api.post(`/metrics/for-patient/${patientPublicId}`, data)
