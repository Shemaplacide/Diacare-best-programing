// ── Patient statuses ──────────────────────────────────────────────────────
export const PATIENT_STATUS = {
  ACTIVE:    { label: 'Active',    color: '#16A34A', bg: '#F0FDF4' },
  STABLE:    { label: 'Stable',    color: '#0A4174', bg: '#ECFEFF' },
  CRITICAL:  { label: 'Critical',  color: '#DC2626', bg: '#FFF1F0' },
  INACTIVE:  { label: 'Inactive',  color: '#64748B', bg: '#F1F5F9' },
}

// ── Glucose statuses ──────────────────────────────────────────────────────
export const GLUCOSE_STATUS = {
  NORMAL:    { label: 'Normal',    color: '#16A34A', bg: '#F0FDF4' },  // 70–140 mg/dL
  HIGH:      { label: 'High',      color: '#D97706', bg: '#FFFBEB' },  // 141–299 mg/dL
  CRITICAL:  { label: 'Critical',  color: '#DC2626', bg: '#FFF1F0' },  // 300+ mg/dL
  LOW:       { label: 'Low',       color: '#7C3AED', bg: '#F5F3FF' },  // <70 mg/dL
}

// ── Doctor statuses ───────────────────────────────────────────────────────
export const DOCTOR_STATUS = {
  APPROVED:  { label: 'Approved',  color: '#16A34A', bg: '#F0FDF4' },
  PENDING:   { label: 'Pending',   color: '#D97706', bg: '#FFFBEB' },
  SUSPENDED: { label: 'Suspended', color: '#DC2626', bg: '#FFF1F0' },
}

// ── Appointment statuses ──────────────────────────────────────────────────
export const APPOINTMENT_STATUS = {
  PENDING:   { label: 'Pending',   color: '#D97706', bg: '#FFFBEB' },
  CONFIRMED: { label: 'Confirmed', color: '#0A4174', bg: '#EFF6F8' },
  SCHEDULED: { label: 'Scheduled', color: '#0A4174', bg: '#ECFEFF' },
  COMPLETED: { label: 'Completed', color: '#16A34A', bg: '#F0FDF4' },
  CANCELLED: { label: 'Cancelled', color: '#DC2626', bg: '#FFF1F0' },
  MISSED:    { label: 'Missed',    color: '#64748B', bg: '#F1F5F9' },
}

// ── Lab result statuses ───────────────────────────────────────────────────
export const LAB_STATUS = {
  NORMAL:    { label: 'Normal',    color: '#16A34A', bg: '#F0FDF4' },
  ABNORMAL:  { label: 'Abnormal',  color: '#D97706', bg: '#FFFBEB' },
  CRITICAL:  { label: 'Critical',  color: '#DC2626', bg: '#FFF1F0' },
  PENDING:   { label: 'Pending',   color: '#64748B', bg: '#F1F5F9' },
}

// ── Reusable badge renderer ───────────────────────────────────────────────
export function StatusBadge({ status, map }) {
  const s = map[status] ?? { label: status, color: '#64748B', bg: '#F1F5F9' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
      color: s.color, backgroundColor: s.bg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: s.color, display: 'inline-block' }} />
      {s.label}
    </span>
  )
}

// ── Glucose value classifier ──────────────────────────────────────────────
export function classifyGlucose(value) {
  if (value < 70)  return 'LOW'
  if (value <= 140) return 'NORMAL'
  if (value <= 299) return 'HIGH'
  return 'CRITICAL'
}
