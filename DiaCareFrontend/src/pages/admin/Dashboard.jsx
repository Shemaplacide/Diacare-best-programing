import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  Users, Stethoscope, Activity, Calendar, FileText,
  TrendingUp, ArrowRight, AlertTriangle,
  UserPlus, FlaskConical, Clock, CheckCircle,
} from 'lucide-react'
import { StatusBadge, APPOINTMENT_STATUS } from '../../constants/status'
import { authStore } from '../../store/authStore'
import { getAdminDashboard, getAllAppointments, getAllPatients, getAllGlucose } from '../../api/admin'
import { toast } from 'react-toastify'

const QUICK_ACTIONS = [
  { label: 'Add Patient',    icon: <UserPlus size={18} />,     color: '#0A4174', bg: '#EFF6F8', href: '/patients'     },
  { label: 'Add Staff',      icon: <Stethoscope size={18} />,  color: '#16A34A', bg: '#F0FDF4', href: '/staff'        },
  { label: 'Log Glucose',    icon: <Activity size={18} />,     color: '#D97706', bg: '#FFFBEB', href: '/glucose'      },
  { label: 'Schedule Appt',  icon: <Calendar size={18} />,     color: '#7C3AED', bg: '#F5F3FF', href: '/appointments' },
  { label: 'Add Lab Result', icon: <FlaskConical size={18} />, color: '#0891B2', bg: '#ECFEFF', href: '/lab'          },
  { label: 'View Reports',   icon: <FileText size={18} />,     color: '#64748B', bg: '#F1F5F9', href: '/reports'      },
]

const PIE_COLORS = { PENDING: '#D97706', CONFIRMED: '#0A4174', COMPLETED: '#16A34A', CANCELLED: '#DC2626' }

function GlucoseTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-bold text-[#1E293B] mb-1">{label}</p>
      <p className="m-0 text-[#0A4174] font-semibold">{payload[0]?.value} mmol/L avg</p>
    </div>
  )
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="m-0 font-semibold text-[#1E293B]">{payload[0].name}: {payload[0].value}</p>
    </div>
  )
}

// Build last-7-days glucose trend from raw readings
function buildGlucoseTrend(readings) {
  const days = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    days[key] = { day: key, values: [] }
  }
  readings.forEach(r => {
    if (!r.recordedAt) return
    const d = new Date(r.recordedAt)
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (days[key]) days[key].values.push(r.value)
  })
  return Object.values(days).map(d => ({
    day: d.day,
    avg: d.values.length ? +(d.values.reduce((a, b) => a + b, 0) / d.values.length).toFixed(1) : null,
  }))
}

// Build appointment status distribution for pie chart
function buildApptDist(appts) {
  const counts = {}
  appts.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1 })
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

export default function Dashboard() {
  const navigate = useNavigate()
  const user     = authStore.getUser()
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const [stats,    setStats]    = useState(null)
  const [appts,    setAppts]    = useState([])
  const [patients, setPatients] = useState([])
  const [glucose,  setGlucose]  = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([getAdminDashboard(), getAllAppointments(), getAllPatients(), getAllGlucose()])
      .then(([s, a, p, g]) => {
        setStats(s.data)
        setAppts(a.data)
        setPatients(p.data)
        setGlucose(g.data)
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const statCards = stats ? [
    { label: 'Total Patients',     value: stats.totalPatients,     icon: <Users size={22} />,          bg: 'linear-gradient(135deg,#0A4174,#49769F)' },
    { label: 'Active Staff',      value: stats.totalDoctors,      icon: <Stethoscope size={22} />,    bg: 'linear-gradient(135deg,#16A34A,#4ade80)' },
    { label: 'Total Appointments', value: stats.totalAppointments, icon: <Calendar size={22} />,       bg: 'linear-gradient(135deg,#7C3AED,#a78bfa)' },
    { label: 'Critical Alerts',    value: stats.criticalGlucose,   icon: <AlertTriangle size={22} />,  bg: 'linear-gradient(135deg,#DC2626,#f87171)' },
  ] : []

  const glucoseTrend = buildGlucoseTrend(glucose)
  const apptDist     = buildApptDist(appts)

  const today        = new Date().toISOString().split('T')[0]
  const recentAppts  = [...appts]
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
    .slice(0, 6)
  const recentPats   = [...patients]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight m-0">
            {greeting}, {user?.name?.split(' ')[0] ?? 'Admin'}
          </h1>
          <p className="text-sm text-[#64748B] mt-1 m-0">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {stats?.criticalGlucose > 0 && (
          <div className="flex items-center gap-2 bg-[#FFF1F0] border border-[#DC2626]/20 text-[#DC2626] px-4 py-2 rounded-xl text-sm font-semibold">
            <AlertTriangle size={15} />
            {stats.criticalGlucose} critical glucose alert{stats.criticalGlucose > 1 ? 's' : ''} in last 24h
          </div>
        )}
      </div>

      {/* Stat cards */}
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
                <p className="m-0 text-3xl font-bold text-white font-mono">{Number(s.value).toLocaleString()}</p>
                <p className="m-0 text-sm font-semibold text-white/90 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <p className="m-0 font-bold text-[#1E293B] mb-4">Quick Actions</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map(q => (
            <button key={q.label} onClick={() => navigate(q.href)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[#E2E8F0] hover:border-transparent hover:shadow-md transition-all cursor-pointer bg-transparent group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: q.bg, color: q.color }}>
                {q.icon}
              </div>
              <span className="text-xs font-semibold text-[#64748B] text-center leading-tight">{q.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Glucose trend — spans 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="m-0 font-bold text-[#1E293B]">Glucose Trend (7 days)</p>
            <button onClick={() => navigate('/glucose')}
              className="flex items-center gap-1 text-xs font-semibold text-[#0A4174] bg-transparent border-0 cursor-pointer hover:underline">
              View all <ArrowRight size={11} />
            </button>
          </div>
          {loading ? (
            <div className="h-48 bg-[#F1F5F9] rounded-xl animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={glucoseTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0A4174" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0A4174" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<GlucoseTooltip />} />
                <Area type="monotone" dataKey="avg" stroke="#0A4174" strokeWidth={2.5}
                  fill="url(#glucoseGrad)" dot={{ r: 3, fill: '#0A4174' }} connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Appointment distribution pie */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="m-0 font-bold text-[#1E293B]">Appointments</p>
            <button onClick={() => navigate('/appointments')}
              className="flex items-center gap-1 text-xs font-semibold text-[#0A4174] bg-transparent border-0 cursor-pointer hover:underline">
              View all <ArrowRight size={11} />
            </button>
          </div>
          {loading ? (
            <div className="h-48 bg-[#F1F5F9] rounded-xl animate-pulse" />
          ) : apptDist.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-[#94A3B8]">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={apptDist} cx="50%" cy="45%" innerRadius={50} outerRadius={75}
                  paddingAngle={3} dataKey="value">
                  {apptDist.map((entry) => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name] ?? '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 11, color: '#64748B' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent appointments */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
            <p className="m-0 font-bold text-[#1E293B]">Recent Appointments</p>
            <span className="text-xs text-[#64748B]">{appts.length} total</span>
          </div>
          {loading ? (
            <div className="p-5 text-sm text-[#94A3B8]">Loading...</div>
          ) : recentAppts.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#94A3B8]">No appointments yet</div>
          ) : (
            <div className="flex flex-col divide-y divide-[#E2E8F0]">
              {recentAppts.map(a => (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#F8FAFB] transition cursor-pointer"
                  onClick={() => navigate('/appointments')}>
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6F8] flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[#0A4174] leading-none">
                      {a.appointmentDate?.split('T')[0]?.split('-')[2]}
                    </span>
                    <span className="text-xs text-[#64748B] leading-none">
                      {a.appointmentDate?.split('T')[0]?.split('-')[1]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-sm font-semibold text-[#1E293B] truncate">
                      {a.patient?.user?.username ?? '—'}
                    </p>
                    <p className="m-0 text-xs text-[#64748B] truncate">
                      Dr. {a.doctor?.user?.username ?? '—'} · {a.appointmentDate?.split('T')[1]?.slice(0, 5)}
                    </p>
                  </div>
                  <StatusBadge status={a.status} map={APPOINTMENT_STATUS} />
                </div>
              ))}
            </div>
          )}
          <div className="px-5 py-3 border-t border-[#E2E8F0]">
            <button onClick={() => navigate('/appointments')}
              className="flex items-center gap-1 text-xs font-semibold text-[#0A4174] bg-transparent border-0 cursor-pointer hover:underline">
              Manage appointments <ArrowRight size={11} />
            </button>
          </div>
        </div>

        {/* Recent patients */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
            <p className="m-0 font-bold text-[#1E293B]">Recent Patients</p>
            <span className="text-xs text-[#64748B]">{patients.length} total</span>
          </div>
          {loading ? (
            <div className="p-5 text-sm text-[#94A3B8]">Loading...</div>
          ) : recentPats.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#94A3B8]">No patients yet</div>
          ) : (
            <div className="flex flex-col divide-y divide-[#E2E8F0]">
              {recentPats.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#F8FAFB] transition cursor-pointer"
                  onClick={() => navigate('/patients')}>
                  <div className="w-9 h-9 rounded-full bg-[#EFF6F8] flex items-center justify-center text-xs font-bold text-[#0A4174] shrink-0">
                    {p.user?.username?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-sm font-semibold text-[#1E293B] truncate">{p.user?.username}</p>
                    <p className="m-0 text-xs text-[#64748B] truncate">{p.diabetesType} · {p.user?.email}</p>
                  </div>
                  <span className="text-xs text-[#94A3B8] shrink-0">
                    {p.createdAt?.split('T')[0]}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="px-5 py-3 border-t border-[#E2E8F0]">
            <button onClick={() => navigate('/patients')}
              className="flex items-center gap-1 text-xs font-semibold text-[#0A4174] bg-transparent border-0 cursor-pointer hover:underline">
              Manage patients <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </div>

      {/* Today summary strip */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Today's Appointments", value: stats.todayAppointments, color: '#0A4174', bg: '#EFF6F8' },
            { label: 'Total Patients',        value: stats.totalPatients,     color: '#16A34A', bg: '#F0FDF4' },
            { label: 'Critical Alerts (24h)', value: stats.criticalGlucose,  color: '#DC2626', bg: '#FFF1F0' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 flex items-center gap-4"
              style={{ borderLeft: `4px solid ${s.color}` }}>
              <div>
                <p className="m-0 text-3xl font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
                <p className="m-0 text-sm text-[#64748B] mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
