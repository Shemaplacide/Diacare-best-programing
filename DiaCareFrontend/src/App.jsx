import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { useState, useEffect } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import PageLoader from './components/ui/PageLoader'

import AuthGuard    from './gaurd/AuthGuard'
import LandingPage  from './pages/LandingPage'

// Auth
import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'

// Admin
import AppLayout    from './layout/AppLayout'
import Dashboard    from './pages/admin/Dashboard'
import Patients     from './pages/admin/Patients'
import Staff       from './pages/admin/Staff'
import GlucoseLog   from './pages/admin/GlucoseLog'
import LabResults   from './pages/admin/LabResults'
import Appointments from './pages/admin/Appointments'
import Reports      from './pages/admin/Reports'
import Settings     from './pages/admin/Settings'
<<<<<<< HEAD
=======
import AdminChat    from './pages/admin/Chat'
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

// Doctor
import DoctorLayout       from './layout/DoctorLayout'
import DoctorDashboard    from './pages/doctor/Dashboard'
import MyPatients         from './pages/doctor/MyPatients'
import DoctorGlucoseLog   from './pages/doctor/GlucoseLog'
import DoctorAppointments from './pages/doctor/Appointments'
import DoctorLabResults   from './pages/doctor/LabResults'
import PatientCare        from './pages/doctor/PatientCare'
<<<<<<< HEAD
=======
import DoctorChat         from './pages/doctor/Chat'
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

// Patient
import PatientLayout        from './layout/PatientLayout'
import PatientDashboard     from './pages/patient/Dashboard'
import PatientGlucoseLog    from './pages/patient/GlucoseLog'
import PatientAppointments  from './pages/patient/Appointments'
import PatientPrescriptions from './pages/patient/Prescriptions'
import PatientMealPlans     from './pages/patient/MealPlans'
import PatientLabResults    from './pages/patient/LabResults'
import PatientSettings      from './pages/patient/Settings'
<<<<<<< HEAD
=======
import PatientChat          from './pages/patient/Chat'
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

export default function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1800)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <PageLoader />

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route element={<AuthGuard role="ADMIN"><AppLayout /></AuthGuard>}>
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/patients"     element={<Patients />} />
          <Route path="/staff"        element={<Staff />} />
          <Route path="/glucose"      element={<GlucoseLog />} />
          <Route path="/reports"      element={<Reports />} />
          <Route path="/lab"          element={<LabResults />} />
          <Route path="/appointments" element={<Appointments />} />
<<<<<<< HEAD
=======
          <Route path="/chat"         element={<AdminChat />} />
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9
          <Route path="/settings"     element={<Settings />} />
        </Route>

        {/* Doctor */}
        <Route path="/doctor" element={<AuthGuard role="DOCTOR"><DoctorLayout /></AuthGuard>}>
          <Route index               element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="dashboard"    element={<DoctorDashboard />} />
          <Route path="patients"     element={<MyPatients />} />
          <Route path="glucose"      element={<DoctorGlucoseLog />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patient-care" element={<PatientCare />} />
          <Route path="lab"          element={<DoctorLabResults />} />
<<<<<<< HEAD
=======
          <Route path="chat"         element={<DoctorChat />} />
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9
          <Route path="settings"     element={<Settings />} />
        </Route>

        {/* Patient */}
        <Route path="/patient" element={<AuthGuard role="PATIENT"><PatientLayout /></AuthGuard>}>
          <Route index                element={<Navigate to="/patient/dashboard" replace />} />
          <Route path="dashboard"     element={<PatientDashboard />} />
          <Route path="glucose"       element={<PatientGlucoseLog />} />
          <Route path="appointments"  element={<PatientAppointments />} />
          <Route path="prescriptions" element={<PatientPrescriptions />} />
          <Route path="meal-plans"    element={<PatientMealPlans />} />
          <Route path="lab"           element={<PatientLabResults />} />
<<<<<<< HEAD
=======
          <Route path="chat"          element={<PatientChat />} />
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9
          <Route path="settings"      element={<PatientSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
    </BrowserRouter>
  )
}
