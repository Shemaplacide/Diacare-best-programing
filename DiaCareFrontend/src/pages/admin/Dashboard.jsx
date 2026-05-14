import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  FileText,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  Users,
} from 'lucide-react'
import { StatusBadge, APPOINTMENT_STATUS } from '../../constants/status'
import { authStore } from '../../store/authStore'
import { getAdminDashboard, getAllAppointments, getAllPatients } from '../../api/admin'
import { toast } from 'react-toastify'
import { getTimeGreeting } from '../../utils/greeting'

const CONTROL_ACTIONS = [
  { label: 'Manage Patients', helper: 'View, edit, and remove patient records', icon: <Users size={18} />, href: '/patients' },
  { label: 'Manage Staff', helper: 'Add doctors and admin accounts', icon: <UserPlus size={18} />, href: '/staff' },
  { label: 'Manage Doctors', helper: 'Update, suspend, or delete doctor profiles', icon: <Stethoscope size={18} />, href: '/doctors' },
  { label: 'Appointments', helper: 'Review bookings and schedules', icon: <Calendar size={18} />, href: '/appointments' },
  { label: 'Activity Logs', helper: 'Monitor login and access history', icon: <ShieldCheck size={18} />, href: '/activity-logs' },
  { label: 'Reports', helper: 'Open system reports and summaries', icon: <FileText size={18} />, href: '/reports' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const user = authStore.getUser()
  const greeting = getTimeGreeting()

  const [stats, setStats] = useState(null)
  const [appts, setAppts] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAdminDashboard(), getAllAppointments(), getAllPatients()])
      .then(([s, a, p]) => {
        setStats(s.data)
        setAppts(a.data ?? [])
        setPatients(p.data ?? [])
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const appointmentSummary = useMemo(() => {
    const pending = appts.filter(a => a.status === 'PENDING').length
    const today = new Date().toISOString().slice(0, 10)
    const todayItems = appts.filter(a => a.appointmentDate?.startsWith(today)).length
    return { pending, todayItems }
  }, [appts])

  const statCards = stats ? [
    { label: 'Patients', value: stats.totalPatients, icon: <Users size={22} />, color: '#0A4174', bg: '#EFF6F8' },
    { label: 'Doctors', value: stats.totalDoctors, icon: <Stethoscope size={22} />, color: '#2563EB', bg: '#EEF6FF' },
    { label: 'Appointments Today', value: stats.todayAppointments ?? appointmentSummary.todayItems, icon: <Calendar size={22} />, color: '#16A34A', bg: '#F0FDF4' },
    { label: 'Critical Alerts', value: stats.criticalGlucose, icon: <AlertTriangle size={22} />, color: '#DC2626', bg: '#FFF1F0' },
  ] : []

  const recentAppts = [...appts]
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
    .slice(0, 5)

  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight m-0">
            {greeting}, {user?.name?.split(' ')[0] ?? 'Admin'}
          </h1>
          <p className="text-sm text-[#64748B] mt-1 m-0">
            Admin control center for users, appointments, reports, and access monitoring.
          </p>
        </div>
        <button
          onClick={() => navigate('/activity-logs')}
          className="h-10 px-4 rounded-lg border border-[#D7E3EA] bg-white text-[#0A4174] font-semibold text-sm flex items-center gap-2 cursor-pointer hover:bg-[#EFF6F8]"
        >
          <ShieldCheck size={16} />
          View Access Logs
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="rounded-xl h-28 bg-[#F1F5F9] animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map(s => (
            <div key={s.label} className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <div>
                <p className="m-0 text-3xl font-bold font-mono" style={{ color: s.color }}>
                  {Number(s.value ?? 0).toLocaleString()}
                </p>
                <p className="m-0 text-sm text-[#64748B]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="m-0 font-bold text-[#1E293B]">Admin Controls</p>
              <p className="m-0 text-xs text-[#64748B] mt-0.5">Critical actions only, kept in one place.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {CONTROL_ACTIONS.map(action => (
              <button
                key={action.label}
                onClick={() => navigate(action.href)}
                className="text-left p-4 rounded-xl border border-[#E2E8F0] bg-white cursor-pointer hover:border-[#0A4174] hover:bg-[#F8FAFB] transition"
              >
                <span className="w-9 h-9 rounded-lg bg-[#EFF6F8] text-[#0A4174] flex items-center justify-center mb-3">
                  {action.icon}
                </span>
                <span className="block text-sm font-bold text-[#1E293B]">{action.label}</span>
                <span className="block text-xs text-[#64748B] mt-1 leading-5">{action.helper}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
          <p className="m-0 font-bold text-[#1E293B] mb-4">Needs Attention</p>
          <div className="flex flex-col gap-3">
            <AttentionItem
              label="Critical glucose alerts"
              value={stats?.criticalGlucose ?? 0}
              danger={(stats?.criticalGlucose ?? 0) > 0}
              onClick={() => navigate('/reports')}
            />
            <AttentionItem
              label="Pending appointments"
              value={appointmentSummary.pending}
              onClick={() => navigate('/appointments')}
            />
            <AttentionItem
              label="Access logs to review"
              value="Open"
              onClick={() => navigate('/activity-logs')}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentAppointments rows={recentAppts} total={appts.length} onOpen={() => navigate('/appointments')} />
        <RecentPatients rows={recentPatients} total={patients.length} onOpen={() => navigate('/patients')} />
      </div>
    </div>
  )
}

function AttentionItem({ label, value, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFB] px-4 py-3 cursor-pointer hover:bg-[#EFF6F8]"
    >
      <span className="text-sm font-semibold text-[#1E293B]">{label}</span>
      <span className={`text-sm font-bold ${danger ? 'text-[#DC2626]' : 'text-[#0A4174]'}`}>{value}</span>
    </button>
  )
}

function RecentAppointments({ rows, total, onOpen }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
      <PanelHeader title="Recent Appointments" total={total} onOpen={onOpen} />
      {rows.length === 0 ? (
        <EmptyState text="No appointments yet" />
      ) : (
        <div className="divide-y divide-[#E2E8F0]">
          {rows.map(a => (
            <button key={a.id} onClick={onOpen} className="w-full text-left flex items-center gap-3 px-5 py-3 bg-white border-0 cursor-pointer hover:bg-[#F8FAFB]">
              <div className="w-10 h-10 rounded-lg bg-[#EFF6F8] text-[#0A4174] flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-bold leading-none">{a.appointmentDate?.slice(8, 10) ?? '--'}</span>
                <span className="text-xs leading-none">{a.appointmentDate?.slice(5, 7) ?? '--'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 text-sm font-semibold text-[#1E293B] truncate">{a.patient?.user?.username ?? 'Patient'}</p>
                <p className="m-0 text-xs text-[#64748B] truncate">Dr. {a.doctor?.user?.username ?? 'Unassigned'} - {a.appointmentDate?.slice(11, 16) ?? 'No time'}</p>
              </div>
              <StatusBadge status={a.status} map={APPOINTMENT_STATUS} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function RecentPatients({ rows, total, onOpen }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
      <PanelHeader title="Recent Patients" total={total} onOpen={onOpen} />
      {rows.length === 0 ? (
        <EmptyState text="No patients yet" />
      ) : (
        <div className="divide-y divide-[#E2E8F0]">
          {rows.map(p => (
            <button key={p.id} onClick={onOpen} className="w-full text-left flex items-center gap-3 px-5 py-3 bg-white border-0 cursor-pointer hover:bg-[#F8FAFB]">
              <div className="w-9 h-9 rounded-full bg-[#EFF6F8] text-[#0A4174] flex items-center justify-center text-xs font-bold shrink-0">
                {getInitials(p.user?.username)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 text-sm font-semibold text-[#1E293B] truncate">{p.user?.username ?? 'Patient'}</p>
                <p className="m-0 text-xs text-[#64748B] truncate">{p.diabetesType ?? 'Diabetes type not set'} - {p.user?.email ?? 'No email'}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PanelHeader({ title, total, onOpen }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
      <div>
        <p className="m-0 font-bold text-[#1E293B]">{title}</p>
        <p className="m-0 text-xs text-[#64748B]">{total} total</p>
      </div>
      <button onClick={onOpen} className="bg-transparent border-0 text-[#0A4174] text-xs font-bold flex items-center gap-1 cursor-pointer">
        View <ArrowRight size={12} />
      </button>
    </div>
  )
}

function EmptyState({ text }) {
  return <div className="p-8 text-center text-sm text-[#94A3B8]">{text}</div>
}

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'PT'
}
