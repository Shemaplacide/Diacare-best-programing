import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  Users, Calendar, Activity, FlaskConical, AlertTriangle,
  Download, Loader, TrendingUp, TrendingDown, ArrowRight,
  CheckCircle, Clock, XCircle,
} from 'lucide-react'
import { toast } from 'react-toastify'
import PageHeader from '../../components/ui/PageHeader'
import {
  getAdminDashboard, getAllPatients, getAllAppointments,
  getAllGlucose, getAllMetrics,
} from '../../api/admin'

// ── CSV helpers ───────────────────────────────────────────────────────────────
function toCSV(headers, rows) {
  const esc = (v) => { const s = String(v ?? '').replace(/"/g, '""'); return s.includes(',') || s.includes('\n') ? `"${s}"` : s }
  return [headers.join(','), ...rows.map(r => r.map(esc).join(','))].join('\n')
}
function downloadCSV(name, csv) {
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })),
    download: name,
  })
  a.click()
}

// ── Chart tooltips ────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-lg px-3 py-2 text-xs">
      {label && <p className="font-bold text-[#1E293B] mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="m-0" style={{ color: p.color ?? p.fill }}>
          {p.name}: <strong>{p.value}{unit}</strong>
        </p>
      ))}
    </div>
  )
}

// ── Data builders ─────────────────────────────────────────────────────────────
function buildGlucoseTrend(readings) {
  const map = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const k = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    map[k] = { day: k, values: [] }
  }
  readings.forEach(r => {
    if (!r.recordedAt) return
    const k = new Date(r.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (map[k]) map[k].values.push(r.value)
  })
  return Object.values(map).map(d => ({
    day: d.day,
    avg: d.values.length ? +(d.values.reduce((a, b) => a + b, 0) / d.values.length).toFixed(1) : null,
  }))
}

function buildApptByStatus(appts) {
  const c = {}
  appts.forEach(a => { c[a.status] = (c[a.status] || 0) + 1 })
  return Object.entries(c).map(([name, value]) => ({ name, value }))
}

function buildDiabetesTypes(patients) {
  const c = {}
  patients.forEach(p => { const t = p.diabetesType || 'Unknown'; c[t] = (c[t] || 0) + 1 })
  return Object.entries(c).map(([name, value]) => ({ name, value }))
}

function buildHba1cTrend(metrics) {
  return [...metrics]
    .filter(m => m.hba1c && m.recordedAt)
    .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
    .slice(-20)
    .map(m => ({
      date: m.recordedAt?.slice(0, 10),
      hba1c: m.hba1c,
      patient: m.patient?.user?.username?.split(' ')[0],
    }))
}

function buildApptTimeline(appts) {
  const map = {}
  appts.forEach(a => {
    if (!a.appointmentDate) return
    const k = a.appointmentDate.slice(0, 7)
    if (!map[k]) map[k] = { month: k, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0, PENDING: 0 }
    map[k][a.status] = (map[k][a.status] || 0) + 1
  })
  return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
}

const STATUS_COLORS = { PENDING: '#D97706', CONFIRMED: '#0A4174', COMPLETED: '#16A34A', CANCELLED: '#DC2626' }
const PIE_COLORS    = ['#0A4174', '#16A34A', '#7C3AED', '#D97706', '#0891B2']

const EXPORTS = [
  {
    id: 'patients', label: 'Patients CSV',
    headers: ['Name', 'Email', 'Diabetes Type', 'Gender', 'DOB', 'Target HbA1c', 'Registered'],
    rows: (d) => d.patients.map(p => [p.user?.username, p.user?.email, p.diabetesType, p.gender, p.dateOfBirth, p.targetHbA1c, p.createdAt?.slice(0, 10)]),
  },
  {
    id: 'appointments', label: 'Appointments CSV',
    headers: ['Patient', 'Doctor', 'Date', 'Time', 'Status', 'Notes'],
    rows: (d) => d.appointments.map(a => [a.patient?.user?.username, a.doctor?.user?.username, a.appointmentDate?.split('T')[0], a.appointmentDate?.split('T')[1]?.slice(0, 5), a.status, a.notes]),
  },
  {
    id: 'glucose', label: 'Glucose CSV',
    headers: ['Patient', 'Value', 'Unit', 'Context', 'Recorded At'],
    rows: (d) => d.glucose.map(g => [g.patient?.user?.username, g.value, g.unit, g.mealContext?.replace(/_/g, ' '), g.recordedAt?.replace('T', ' ').slice(0, 16)]),
  },
  {
    id: 'lab', label: 'Lab Results CSV',
    headers: ['Patient', 'HbA1c%', 'Weight kg', 'Height cm', 'BMI', 'BP Sys', 'BP Dia', 'Cholesterol', 'Recorded At'],
    rows: (d) => d.metrics.map(m => [m.patient?.user?.username, m.hba1c, m.weight, m.height, m.bmi, m.bloodPressureSystolic, m.bloodPressureDiastolic, m.cholesterol, m.recordedAt?.replace('T', ' ').slice(0, 16)]),
  },
]

export default function Reports() {
  const navigate   = useNavigate()
  const [stats,    setStats]    = useState(null)
  const [allData,  setAllData]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [exporting, setExporting] = useState(null)

  useEffect(() => {
    Promise.all([getAdminDashboard(), getAllPatients(), getAllAppointments(), getAllGlucose(), getAllMetrics()])
      .then(([s, p, a, g, m]) => {
        setStats(s.data)
        setAllData({ patients: p.data, appointments: a.data, glucose: g.data, metrics: m.data })
      })
      .catch(() => toast.error('Failed to load report data'))
      .finally(() => setLoading(false))
  }, [])

  const handleExport = (exp) => {
    if (!allData) return
    setExporting(exp.id)
    try {
      downloadCSV(`diacare-${exp.id}-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(exp.headers, exp.rows(allData)))
      toast.success(`${exp.label} downloaded`)
    } catch { toast.error('Export failed') }
    finally { setExporting(null) }
  }

  // Derived chart data
  const glucoseTrend   = allData ? buildGlucoseTrend(allData.glucose)          : []
  const apptByStatus   = allData ? buildApptByStatus(allData.appointments)      : []
  const diabetesTypes  = allData ? buildDiabetesTypes(allData.patients)         : []
  const hba1cTrend     = allData ? buildHba1cTrend(allData.metrics)             : []
  const apptTimeline   = allData ? buildApptTimeline(allData.appointments)      : []

  const completionRate = allData
    ? Math.round((allData.appointments.filter(a => a.status === 'COMPLETED').length / (allData.appointments.length || 1)) * 100)
    : 0

  const avgGlucose = allData?.glucose.length
    ? (allData.glucose.reduce((s, r) => s + r.value, 0) / allData.glucose.length).toFixed(1)
    : '—'

  const criticalCount = allData?.glucose.filter(r => r.value >= 13.9 || r.value <= 3.0).length ?? 0

  if (loading) return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-48 bg-[#F1F5F9] rounded-xl animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-[#F1F5F9] animate-pulse" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-64 rounded-2xl bg-[#F1F5F9] animate-pulse" />)}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <PageHeader
        title="Reports & Analytics"
        subtitle="System-wide health insights and data exports"
        actions={
          <div className="flex gap-2 flex-wrap">
            {EXPORTS.map(exp => (
              <button key={exp.id} onClick={() => handleExport(exp)} disabled={!allData || exporting === exp.id}
                className="flex items-center gap-1.5 px-3 text-xs font-semibold rounded-xl border border-[#E2E8F0] bg-white cursor-pointer hover:border-[#0A4174] hover:text-[#0A4174] transition disabled:opacity-50"
                style={{ height: 'var(--btn-h-sm)', color: 'var(--color-text-muted)' }}>
                {exporting === exp.id ? <Loader size={12} className="animate-spin" /> : <Download size={12} />}
                {exp.label}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI strip */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Patients',     value: stats.totalPatients,     sub: 'registered',          icon: <Users size={20} />,         grad: 'linear-gradient(135deg,#0A4174,#49769F)', href: '/patients' },
            { label: 'Total Appointments', value: stats.totalAppointments, sub: `${completionRate}% completed`, icon: <Calendar size={20} />,      grad: 'linear-gradient(135deg,#7C3AED,#a78bfa)', href: '/appointments' },
            { label: 'Avg Glucose',        value: `${avgGlucose}`,         sub: 'mmol/L across all',   icon: <Activity size={20} />,      grad: 'linear-gradient(135deg,#16A34A,#4ade80)', href: '/glucose' },
            { label: 'Critical Alerts',    value: criticalCount,           sub: 'all-time readings',   icon: <AlertTriangle size={20} />, grad: 'linear-gradient(135deg,#DC2626,#f87171)', href: '/glucose' },
          ].map(k => (
            <div key={k.label} onClick={() => navigate(k.href)}
              className="relative rounded-2xl overflow-hidden p-5 flex flex-col gap-3 cursor-pointer hover:opacity-90 transition"
              style={{ background: k.grad }}>
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">{k.icon}</div>
              <div>
                <p className="m-0 text-3xl font-bold text-white font-mono">{k.value}</p>
                <p className="m-0 text-sm font-semibold text-white/90 mt-0.5">{k.label}</p>
                <p className="m-0 text-xs text-white/70 mt-0.5">{k.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Glucose 30-day trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="m-0 font-bold text-[#1E293B]">Glucose Trend</p>
              <p className="m-0 text-xs text-[#94A3B8] mt-0.5">30-day daily average (mmol/L)</p>
            </div>
            <button onClick={() => navigate('/glucose')}
              className="flex items-center gap-1 text-xs font-semibold text-[#0A4174] bg-transparent border-0 cursor-pointer hover:underline">
              View log <ArrowRight size={11} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={glucoseTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0A4174" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0A4174" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                interval={Math.floor(glucoseTrend.length / 6)} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip content={<ChartTip unit=" mmol/L" />} />
              <Area type="monotone" dataKey="avg" name="Avg glucose" stroke="#0A4174" strokeWidth={2.5}
                fill="url(#gGrad)" dot={false} connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Diabetes type distribution */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <div className="mb-4">
            <p className="m-0 font-bold text-[#1E293B]">Diabetes Types</p>
            <p className="m-0 text-xs text-[#94A3B8] mt-0.5">Patient distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={diabetesTypes} cx="50%" cy="45%" innerRadius={45} outerRadius={70}
                paddingAngle={3} dataKey="value">
                {diabetesTypes.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip content={<ChartTip />} />
              <Legend iconType="circle" iconSize={8}
                formatter={(v) => <span style={{ fontSize: 11, color: '#64748B' }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Appointment timeline stacked bar */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="m-0 font-bold text-[#1E293B]">Appointments by Month</p>
              <p className="m-0 text-xs text-[#94A3B8] mt-0.5">Last 6 months by status</p>
            </div>
            <button onClick={() => navigate('/appointments')}
              className="flex items-center gap-1 text-xs font-semibold text-[#0A4174] bg-transparent border-0 cursor-pointer hover:underline">
              View all <ArrowRight size={11} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={apptTimeline} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="COMPLETED" name="Completed" stackId="a" fill={STATUS_COLORS.COMPLETED} radius={[0,0,0,0]} />
              <Bar dataKey="CONFIRMED" name="Confirmed" stackId="a" fill={STATUS_COLORS.CONFIRMED} />
              <Bar dataKey="PENDING"   name="Pending"   stackId="a" fill={STATUS_COLORS.PENDING} />
              <Bar dataKey="CANCELLED" name="Cancelled" stackId="a" fill={STATUS_COLORS.CANCELLED} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* HbA1c trend line */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="m-0 font-bold text-[#1E293B]">HbA1c Trend</p>
              <p className="m-0 text-xs text-[#94A3B8] mt-0.5">Latest 20 recorded values</p>
            </div>
            <button onClick={() => navigate('/lab')}
              className="flex items-center gap-1 text-xs font-semibold text-[#0A4174] bg-transparent border-0 cursor-pointer hover:underline">
              View lab <ArrowRight size={11} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={hba1cTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                interval={Math.floor(hba1cTrend.length / 4)} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[4, 12]} />
              <Tooltip content={<ChartTip unit="%" />} />
              <Area type="monotone" dataKey="hba1c" name="HbA1c" stroke="#7C3AED" strokeWidth={2.5}
                fill="url(#hGrad)" dot={{ r: 3, fill: '#7C3AED' }} connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Appointment status summary + quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Status breakdown */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <p className="m-0 font-bold text-[#1E293B] mb-4">Appointment Status</p>
          <div className="flex flex-col gap-3">
            {apptByStatus.map(s => {
              const total = apptByStatus.reduce((a, b) => a + b.value, 0)
              const pct   = total ? Math.round((s.value / total) * 100) : 0
              const icons = { COMPLETED: <CheckCircle size={14} />, CONFIRMED: <TrendingUp size={14} />, PENDING: <Clock size={14} />, CANCELLED: <XCircle size={14} /> }
              return (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: STATUS_COLORS[s.name] ?? '#64748B' }}>
                      {icons[s.name]} {s.name}
                    </div>
                    <span className="text-xs font-bold text-[#1E293B]">{s.value} <span className="text-[#94A3B8] font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[s.name] ?? '#94A3B8' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Glucose risk breakdown */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <p className="m-0 font-bold text-[#1E293B] mb-4">Glucose Risk Levels</p>
          {allData && (() => {
            const total = allData.glucose.length || 1
            const low    = allData.glucose.filter(r => r.value < 4.0).length
            const normal = allData.glucose.filter(r => r.value >= 4.0 && r.value <= 7.8).length
            const high   = allData.glucose.filter(r => r.value > 7.8 && r.value < 13.9).length
            const crit   = allData.glucose.filter(r => r.value >= 13.9).length
            return (
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Critical (≥13.9)', count: crit,   color: '#DC2626' },
                  { label: 'High (7.8–13.9)',  count: high,   color: '#D97706' },
                  { label: 'Normal (4–7.8)',   count: normal, color: '#16A34A' },
                  { label: 'Low (<4.0)',        count: low,    color: '#0891B2' },
                ].map(r => (
                  <div key={r.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: r.color }}>{r.label}</span>
                      <span className="text-xs font-bold text-[#1E293B]">{r.count} <span className="text-[#94A3B8] font-normal">({Math.round(r.count/total*100)}%)</span></span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.round(r.count/total*100)}%`, backgroundColor: r.color }} />
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>

        {/* Quick metrics */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
          <p className="m-0 font-bold text-[#1E293B] mb-4">Health Metrics Summary</p>
          {allData && (() => {
            const hba1cs = allData.metrics.filter(m => m.hba1c).map(m => m.hba1c)
            const bmis   = allData.metrics.filter(m => m.bmi).map(m => m.bmi)
            const avg    = (arr) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '—'
            return (
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Avg HbA1c',      value: `${avg(hba1cs)}%`,   color: '#7C3AED', trend: hba1cs.length > 1 && hba1cs[hba1cs.length-1] < hba1cs[0] },
                  { label: 'Avg BMI',         value: avg(bmis),           color: '#0A4174' },
                  { label: 'Total Readings',  value: allData.glucose.length, color: '#16A34A' },
                  { label: 'Lab Records',     value: allData.metrics.length, color: '#0891B2' },
                  { label: 'Active Patients', value: allData.patients.length, color: '#D97706' },
                ].map(m => (
                  <div key={m.label} className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9] last:border-0">
                    <span className="text-sm text-[#64748B]">{m.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold font-mono" style={{ color: m.color }}>{m.value}</span>
                      {m.trend === true  && <TrendingDown size={13} color="#16A34A" />}
                      {m.trend === false && <TrendingUp   size={13} color="#DC2626" />}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      </div>

    </div>
  )
}
