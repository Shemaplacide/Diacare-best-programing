import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, Activity, Calendar, AlertTriangle, ArrowRight, TrendingUp, UserPlus, FlaskConical, Pill, CheckCircle, Clock } from 'lucide-react'
import { StatusBadge, GLUCOSE_STATUS, APPOINTMENT_STATUS } from '../../constants/status'
import { authStore } from '../../store/authStore'
import { getDoctorDashboard, getMyAppointments } from '../../api/doctorApi'
import { toast } from 'react-toastify'

const QUICK_ACTIONS = [
  { label: 'My Patients',   icon: <UserPlus size={18} />,     color: '#0A4174', bg: '#EFF6F8', href: '/doctor/patients'     },
  { label: 'Log Glucose',   icon: <Activity size={18} />,     color: '#D97706', bg: '#FFFBEB', href: '/doctor/glucose'      },
  { label: 'Appointments',  icon: <Calendar size={18} />,     color: '#16A34A', bg: '#F0FDF4', href: '/doctor/appointments' },
  { label: 'Patient Care',  icon: <Pill size={18} />,         color: '#7C3AED', bg: '#F5F3FF', href: '/doctor/patient-care' },
  { label: 'Lab Results',   icon: <FlaskConical size={18} />, color: '#0891B2', bg: '#ECFEFF', href: '/doctor/lab'          },
]

function GlucoseTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-bold text-[#1E293B] mb-1">{label}</p>
      <p className="m-0 text-[#0A4174] font-semibold">{payload[0]?.value} mmol/L avg</p>
    </div>
  )
}

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const user     = authStore.getUser()
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const [dashboard, setDashboard] = useState(null)
  const [appts,     setAppts]     = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([getDoctorDashboard(), getMyAppointments()])
      .then(([d, a]) => {
        setDashboard(d.data)
        setAppts(a.data)
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const todayAppts = appts.filter(a => a.appointmentDate?.split('T')[0] === today)
  const upcoming   = appts.filter(a => (a.status === 'PENDING' || a.status === 'CONFIRMED') && a.appointmentDate?.split('T')[0] >= today)
  const alerts     = dashboard?.criticalAlerts ?? []

  const statCards = dashboard ? [
    { label: 'My Patients',      value: dashboard.totalPatients,      icon: <Users size={20} />,        bg: 'linear-gradient(135deg,#0A4174,#49769F)' },
    { label: "Today's Appts",    value: dashboard.todayAppointments,  icon: <Calendar size={20} />,     bg: 'linear-gradient(135deg,#16A34A,#4ade80)' },
    { label: 'Pending',          value: dashboard.pendingAppointments,icon: <Clock size={20} />,        bg: 'linear-gradient(135deg,#D97706,#fbbf24)' },
    { label: 'Critical Alerts',  value: alerts.length,                icon: <AlertTriangle size={20} />,bg: 'linear-gradient(135deg,#DC2626,#f87171)' },
  ] : []

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight m-0">
            {greeting}, {user?.name?.split(' ')[0] ?? 'Doctor'}
          </h1>
          <p className="text-sm text-[#64748B] mt-1 m-0">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {alerts.length > 0 && (
          <div className="flex items-center gap-2 bg-[#FFF1F0] border border-[#DC2626]/20 text-[#DC2626] px-4 py-2 rounded-xl text-sm font-semibold">
            <AlertTriangle size={15} />
            {alerts.length} patient{alerts.length > 1 ? 's' : ''} need attention
          </div>
        )}
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="rounded-2xl h-32 bg-[#F1F5F9] animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map(s => (
            <div key={s.label} className="relative rounded-2xl overflow-hidden p-5 flex flex-col gap-4" style={{ background: s.bg }}>
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -right-2 w-28 h-28 rounded-full bg-white/5" />
              <div className="relative z-10 flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">{s.icon}</div>
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg bg-white/20 text-white">
                  <TrendingUp size={11} /> Live
                </span>
              </div>
              <div className="relative z-10">
                <p className="m-0 text-3xl font-bold text-white font-mono">{s.value}</p>
                <p className="m-0 text-sm font-semibold text-white/90 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <p className="m-0 font-bold text-[#1E293B] mb-4">Quick Actions</p>
        <div className="grid grid-cols-5 gap-3">
          {QUICK_ACTIONS.map(q => (
            <button key={q.label} onClick={() => navigate(q.href)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[#E2E8F0] hover:border-transparent hover:shadow-md transition-all cursor-pointer bg-transparent group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: q.bg, color: q.color }}>
                {q.icon}
              </div>
              <span className="text-xs font-semibold text-[#64748B] text-center">{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Critical alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
            <AlertTriangle size={16} className="text-[#DC2626]" />
            <p className="m-0 font-bold text-[#1E293B]">Critical Glucose Alerts</p>
          </div>
          <div className="flex flex-col divide-y divide-[#E2E8F0]">
            {alerts.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-[#F8FAFB] transition">
                <div className="w-9 h-9 rounded-full bg-[#FFF1F0] flex items-center justify-center text-xs font-bold text-[#DC2626] shrink-0">
                  {a.patientName?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-sm font-semibold text-[#1E293B]">{a.patientName}</p>
                  <p className="m-0 text-xs text-[#64748B]">{a.recordedAt?.slice(0, 16)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="m-0 font-mono font-bold text-[#DC2626]">{a.value} {a.unit}</p>
                  <p className="m-0 text-xs text-[#DC2626]">{a.alertType}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's schedule + upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
            <p className="m-0 font-bold text-[#1E293B]">Today's Schedule</p>
            <span className="text-xs text-[#64748B]">{todayAppts.length} appointments</span>
          </div>
          {loading ? (
            <div className="p-5 text-sm text-[#94A3B8]">Loading...</div>
          ) : todayAppts.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#94A3B8]">No appointments today</div>
          ) : (
            <div className="flex flex-col divide-y divide-[#E2E8F0]">
              {todayAppts.slice(0, 6).map(a => (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#F8FAFB] transition cursor-pointer"
                  onClick={() => navigate('/doctor/appointments')}>
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0"
                    style={{ backgroundColor: a.status === 'COMPLETED' ? '#F0FDF4' : '#EFF6F8' }}>
                    <span className="text-xs font-bold leading-none" style={{ color: a.status === 'COMPLETED' ? '#16A34A' : '#0A4174' }}>
                      {a.appointmentDate?.split('T')[1]?.slice(0, 5)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-sm font-semibold text-[#1E293B] truncate">{a.patient?.user?.username ?? 'Patient'}</p>
                    <p className="m-0 text-xs text-[#64748B] truncate">{a.notes || 'Appointment'}</p>
                  </div>
                  {a.status === 'COMPLETED'
                    ? <CheckCircle size={16} className="text-[#16A34A] shrink-0" />
                    : <Clock size={16} className="text-[#94A3B8] shrink-0" />
                  }
                </div>
              ))}
            </div>
          )}
          <div className="px-5 py-3 border-t border-[#E2E8F0]">
            <button onClick={() => navigate('/doctor/appointments')}
              className="flex items-center gap-1 text-xs font-semibold text-[#0A4174] bg-transparent border-0 cursor-pointer hover:underline">
              Manage appointments <ArrowRight size={11} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
            <p className="m-0 font-bold text-[#1E293B]">Upcoming Appointments</p>
            <span className="text-xs text-[#64748B]">{upcoming.length} pending</span>
          </div>
          {loading ? (
            <div className="p-5 text-sm text-[#94A3B8]">Loading...</div>
          ) : upcoming.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#94A3B8]">No upcoming appointments</div>
          ) : (
            <div className="flex flex-col divide-y divide-[#E2E8F0]">
              {upcoming.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#F8FAFB] transition cursor-pointer"
                  onClick={() => navigate('/doctor/appointments')}>
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6F8] flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[#0A4174] leading-none">{a.appointmentDate?.split('T')[0]?.split('-')[2]}</span>
                    <span className="text-xs text-[#64748B] leading-none">{a.appointmentDate?.split('T')[0]?.split('-')[1]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-sm font-semibold text-[#1E293B] truncate">{a.patient?.user?.username ?? 'Patient'}</p>
                    <p className="m-0 text-xs text-[#64748B]">{a.appointmentDate?.split('T')[1]?.slice(0, 5)} · {a.notes || 'Appointment'}</p>
                  </div>
                  <StatusBadge status={a.status} map={APPOINTMENT_STATUS} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
