import { Route } from "react-router-dom";
import RequireAuth from "../gaurd/RequireAuth";
import AppLayout from "../layout/AppLayout";

import Dashboard from "../pages/admin/Dashboard";
import Patients from "../pages/admin/Patients";
import Doctors from "../pages/admin/Doctors";
import GlucoseLog from "../pages/admin/GlucoseLog";
import LabResults from "../pages/admin/LabResults";
import Appointments from "../pages/admin/Appointments";
import Reports from "../pages/admin/Reports";
import Settings from "../pages/admin/Settings";

export default function AdminRoutes() {
  return (
    <Route
      element={
        <RequireAuth allowedRoles={["ADMIN"]}>
          <AppLayout />
        </RequireAuth>
      }
    >
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/patients" element={<Patients />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/glucose" element={<GlucoseLog />} />
      <Route path="/lab" element={<LabResults />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/settings" element={<Settings />} />
    </Route>
  );
}
