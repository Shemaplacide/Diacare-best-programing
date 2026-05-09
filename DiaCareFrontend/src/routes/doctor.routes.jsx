import { Route, Navigate } from "react-router-dom";
import RequireAuth from "../gaurd/RequireAuth";
import DoctorLayout from "../layout/DoctorLayout";

import DoctorDashboard from "../pages/doctor/Dashboard";
import MyPatients from "../pages/doctor/MyPatients";
import DoctorGlucoseLog from "../pages/doctor/GlucoseLog";
import DoctorAppointments from "../pages/doctor/Appointments";
import DoctorLabResults from "../pages/doctor/LabResults";
import PatientCare from "../pages/doctor/PatientCare";
import Settings from "../pages/admin/Settings";

export default function DoctorRoutes() {
  return (
    <Route
      path="/doctor"
      element={
        <RequireAuth allowedRoles={["DOCTOR"]}>
          <DoctorLayout />
        </RequireAuth>
      }
    >
      <Route index element={<Navigate to="/doctor/dashboard" replace />} />
      <Route path="dashboard" element={<DoctorDashboard />} />
      <Route path="patients" element={<MyPatients />} />
      <Route path="glucose" element={<DoctorGlucoseLog />} />
      <Route path="appointments" element={<DoctorAppointments />} />
      <Route path="patient-care" element={<PatientCare />} />
      <Route path="lab" element={<DoctorLabResults />} />
      <Route path="settings" element={<Settings />} />
    </Route>
  );
}
