import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity, Calendar, Pill, FlaskConical, ArrowRight, AlertTriangle, Utensils } from 'lucide-react'
import { StatusBadge, GLUCOSE_STATUS, classifyGlucose } from '../../constants/status'
import { authStore } from '../../store/authStore'
import { getMyReadings, getMyTrend } from '../../api/glucose'
import { getMyAppointments } from '../../api/appointments'
import { getMyPrescriptions } from '../../api/prescriptions'

const QUICK_ACTIONS = [
  { label: 'Log Glucose',   icon: <Activity size={18} />,    color: '#16A34A', bg: '#F0FDF4', href: '/patient/glucose'       },
  { label: 'Appointments',  icon: <Calendar size={18} />,    color: '#0A4174', bg: '#EFF6F8', href: '/patient/appointments'  },
  { label: 'Prescriptions', icon: <Pill size={18} />,        color: '#7C3AED', bg: '#F5F3FF', href: '/patient/prescriptions' },
  { label: 'Meal Plans',    icon: <Utensils size={18} />,    color: '#D97706', bg: '#FFFBEB', href: '/patient/meal-plans'    },
  { label: 'Lab Results',   icon: <FlaskConical size={18} />, color: '#0891B2', bg: '#ECFEFF', href: '/patient/lab'           },
]

function GlucoseTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-bold text-[#1E293B] mb-1">{label}</p>
      <p className="m-0 text-[#16A34A] font-semibold">{payload[0]?.value} mg/dL</p>
    </div>
  )
}

export default function PatientDashboard() {
  const navigate = useNavigate()
  const user     = authStore.getUser()
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const [readings,     setReadings]     = useState([])
  const [trend,        setTrend]        = useState(null)
  const [appointments, setAppointments] = useState([])
  const [prescriptions,setPrescriptions]= useState([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    Promise.all([getMyReadings(), getMyTrend(), getMyAppointments(), getMyPrescriptions()])
      .then(([r, t, a, p]) => {
        setReadings(r.data)
        setTrend(t.data)
        setAppointments(a.data)
        setPrescriptions(p.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const recentReadings = readings.slice(0, 5)
  const upcomingAppts  = appointments
    .filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED')
    .slice(0, 3)
  const activeRx = prescriptions.filter(p => p.status === 'ACTIVE').slice(0, 3)
  const critical  = recentReadings.filter(r => ['CRITICAL', 'LOW'].includes(classifyGlucose(r.value)))

  // Build 7-day trend from trend data or readings
  const trendData = trend?.recentReadings
    ? trend.recentReadings.slice(0, 7).map((r, i) => ({
        day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i % 7],
        value: r.value,
      }))
    : []

  const lastGlucose = recentReadings[0]
  const activeRxCount = activeRx.length

  const stats = [
    { label: 'Last Glucose', value: lastGlucose ? `${lastGlucose.value}` : '—', unit: 'mg/dL', icon: <Activity size={20} />, bg: 'linear-gradient(135deg,#16A34A,#4ade80)' },
    { label: 'Avg 7-day',    value: trend?.averageLast7Days ?? '—',              unit: 'mg/dL', icon: <FlaskConical size={20} />, bg: 'linear-gradient(135deg,#0A4174,#49769F)' },
    { label: 'Next Appt',    value: upcomingAppts[0] ? upcomingAppts[0].appointmentDate?.split('T')[0] : 'None', unit: '', icon: <Calendar size={20} />, bg: 'linear-gradient(135deg,#D97706,#fbbf24)' },
    { label: 'Active Meds',  value: activeRxCount,                               unit: 'meds',  icon: <Pill size={20} />, bg: 'linear-gradient(135deg,#7C3AED,#a78bfa)' },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-[#0A4174] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight m-0">
            {greeting}, {user?.name?.split(' ')[0] ?? 'Patient'}
          </h1>
          <p className="text-sm text-[#64748B] mt-1 m-0">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {critical.length > 0 && (
          <div className="flex items-center gap-2 bg-[#FFF1F0] border border-[#DC2626]/20 text-[#DC2626] px-4 py-2 rounded-xl text-sm font-semibold">
            <AlertTriangle size={15} /> {critical.length} critical reading{critical.length > 1 ? 's' : ''} — contact your doctor
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="relative rounded-2xl overflow-hidden p-5 flex flex-col gap-4" style={{ background: s.bg }}>
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -right-2 w-28 h-28 rounded-full bg-white/5" />
            <div className="relative z-10 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">{s.icon}</div>
            <div className="relative z-10">
              <p className="m-0 text-3xl font-bold text-white font-mono">{s.value} <span className="text-base font-normal">{s.unit}</span></p>
              <p className="m-0 text-sm font-semibold text-white/90 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

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

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Glucose trend + recent readings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <div className="mb-4">
            <p className="m-0 font-bold text-[#1E293B]">My Glucose — 7-day Trend</p>
            <p className="m-0 text-xs text-[#64748B] mt-0.5">
              Avg: {trend?.averageLast7Days ?? '—'} mg/dL · Risk: <span className="font-semibold">{trend?.riskLevel ?? '—'}</span>
            </p>
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="patGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#16A34A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[60, 200]} />
                <Tooltip content={<GlucoseTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#16A34A" strokeWidth={2.5} fill="url(#patGrad)"
                  dot={{ r: 3, fill: '#16A34A', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-sm text-[#94A3B8]">No trend data yet</div>
          )}

          <div className="mt-4 pt-4 border-t border-[#E2E8F0]">
            <p className="m-0 text-xs font-bold text-[#64748B] uppercase tracking-wide mb-3">Recent Readings</p>
            {recentReadings.length === 0
              ? <p className="text-sm text-[#94A3B8]">No readings yet</p>
              : recentReadings.map(r => {
                  const level = classifyGlucose(r.value)
                  const s = GLUCOSE_STATUS[level]
                  return (
                    <div key={r.id} className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
                        <Activity size={14} style={{ color: s.color }} />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-bold font-mono" style={{ color: s.color }}>{r.value} mg/dL</span>
                        <span className="text-xs text-[#94A3B8] ml-2">{r.mealContext?.replace('_', ' ')}</span>
                      </div>
                      <span className="text-xs text-[#94A3B8]">{r.recordedAt?.replace('T', ' ').slice(0, 16)}</span>
                      <StatusBadge status={level} map={GLUCOSE_STATUS} />
                    </div>
                  )
                })
            }
            <button onClick={() => navigate('/patient/glucose')}
              className="flex items-center gap-1 text-xs font-semibold text-[#0A4174] bg-transparent border-0 cursor-pointer hover:underline mt-2">
              View all readings <ArrowRight size={11} />
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Upcoming appointments */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <p className="m-0 font-bold text-[#1E293B] mb-3">Upcoming Appointments</p>
            {upcomingAppts.length === 0
              ? <p className="m-0 text-sm text-[#94A3B8]">No upcoming appointments</p>
              : upcomingAppts.map(a => {
                  const date = a.appointmentDate?.split('T')[0] ?? ''
                  const time = a.appointmentDate?.split('T')[1]?.slice(0, 5) ?? ''
                  return (
                    <div key={a.id} className="flex items-center gap-3 py-2.5 border-b border-[#E2E8F0] last:border-0">
                      <div className="w-10 h-10 rounded-xl bg-[#EFF6F8] flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-[#0A4174] leading-none">{date.split('-')[2]}</span>
                        <span className="text-xs text-[#64748B] leading-none">{date.split('-')[1]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="m-0 text-sm font-semibold text-[#1E293B] truncate">{a.notes || 'Appointment'}</p>
                        <p className="m-0 text-xs text-[#64748B]">{time}</p>
                      </div>
                    </div>
                  )
                })
            }
            <button onClick={() => navigate('/patient/appointments')}
              className="flex items-center gap-1 text-xs font-semibold text-[#0A4174] bg-transparent border-0 cursor-pointer hover:underline mt-3">
              Manage appointments <ArrowRight size={11} />
            </button>
          </div>

          {/* Active medications */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <p className="m-0 font-bold text-[#1E293B] mb-3">Active Medications</p>
            {activeRx.length === 0
              ? <p className="m-0 text-sm text-[#94A3B8]">No active prescriptions</p>
              : activeRx.map(rx => (
                  <div key={rx.id} className="flex items-start gap-3 py-2.5 border-b border-[#E2E8F0] last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] flex items-center justify-center shrink-0">
                      <Pill size={14} className="text-[#7C3AED]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="m-0 text-sm font-bold text-[#1E293B]">{rx.medication} <span className="font-normal text-[#64748B] text-xs">· {rx.dosage}</span></p>
                      <p className="m-0 text-xs text-[#64748B]">{rx.frequency}</p>
                      <p className="m-0 text-xs text-[#94A3B8] mt-0.5">{rx.instructions}</p>
                    </div>
                  </div>
                ))
            }
            <button onClick={() => navigate('/patient/prescriptions')}
              className="flex items-center gap-1 text-xs font-semibold text-[#0A4174] bg-transparent border-0 cursor-pointer hover:underline mt-3">
              View all prescriptions <ArrowRight size={11} />
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
