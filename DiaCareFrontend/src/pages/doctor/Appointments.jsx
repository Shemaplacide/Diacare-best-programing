import { useState, useEffect } from 'react'
import { Calendar, List, Plus, ChevronLeft, ChevronRight, CheckCircle, XCircle, CalendarClock } from 'lucide-react'
import { toast } from 'react-toastify'
import Modal from '../../components/ui/Modal'
import InputField from '../../components/ui/InputField'
import Button from '../../components/ui/Button'
import { StatusBadge, APPOINTMENT_STATUS } from '../../constants/status'
import { getMyAppointments, updateApptStatus, rescheduleAppt, cancelAppt } from '../../api/doctorApi'

const DAYS  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8)
const STATUS_COLORS = { PENDING: '#0A4174', CONFIRMED: '#16A34A', CANCELLED: '#DC2626', COMPLETED: '#64748B' }

function getWeekDates(base) {
  const start = new Date(base)
  start.setDate(start.getDate() - start.getDay())
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d })
}
const fmt = (d) => d instanceof Date ? d.toISOString().split('T')[0] : d?.split('T')[0]

export default function DoctorAppointments() {
  const [view,           setView]           = useState('week')
  const [weekBase,       setWeekBase]       = useState(new Date())
  const [appts,          setAppts]          = useState([])
  const [loading,        setLoading]        = useState(true)
  const [selected,       setSelected]       = useState(null)
  const [detailOpen,     setDetailOpen]     = useState(false)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' })
  const [saving,         setSaving]         = useState(false)

  const load = () => {
    setLoading(true)
    getMyAppointments()
      .then(r => setAppts(r.data))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const weekDates = getWeekDates(weekBase)
  const today     = fmt(new Date())
  const prevWeek  = () => { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d) }
  const nextWeek  = () => { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d) }

  const changeStatus = async (id, status) => {
    try {
      await updateApptStatus(id, status)
      setAppts(p => p.map(a => a.id === id ? { ...a, status } : a))
      if (selected?.id === id) setSelected(p => ({ ...p, status }))
      toast.success(`Marked as ${APPOINTMENT_STATUS[status]?.label ?? status}`)
      setDetailOpen(false)
    } catch (err) { toast.error(err.response?.data?.message ?? 'Failed to update') }
  }

  const doReschedule = async () => {
    if (!rescheduleForm.date || !rescheduleForm.time) { toast.error('Select a new date and time'); return }
    const day = new Date(rescheduleForm.date).getDay()
    if (day === 0 || day === 6) { toast.error('Weekdays only (Mon–Fri)'); return }
    const hour = parseInt(rescheduleForm.time.split(':')[0])
    if (hour < 9 || hour >= 18) { toast.error('Must be between 9:00 AM and 6:00 PM'); return }
    setSaving(true)
    try {
      const newDateTime = `${rescheduleForm.date}T${rescheduleForm.time}:00`
      await rescheduleAppt(selected.id, newDateTime)
      toast.success('Appointment rescheduled')
      setRescheduleOpen(false)
      setDetailOpen(false)
      load()
    } catch (err) { toast.error(err.response?.data?.message ?? 'Failed to reschedule') }
    finally { setSaving(false) }
  }

  const getApptsForSlot = (date, hour) => {
    const dateStr = fmt(date)
    return appts.filter(a => {
      const aDate = a.appointmentDate?.split('T')[0]
      const aHour = parseInt(a.appointmentDate?.split('T')[1]?.slice(0, 2) ?? '0')
      return aDate === dateStr && aHour === hour
    })
  }

  return (
    <div className="flex flex-col gap-5">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight m-0">Appointments</h1>
          <p className="text-sm text-[#64748B] mt-1 m-0">
            {appts.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length} upcoming
          </p>
        </div>
        <div className="flex items-center bg-[#F1F5F9] rounded-xl p-1 gap-1">
          {['week', 'list'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition
                ${view === v ? 'bg-white text-[#0A4174] shadow-sm' : 'bg-transparent text-[#64748B]'}`}>
              {v === 'week' ? <><Calendar size={13} /> Week</> : <><List size={13} /> List</>}
            </button>
          ))}
        </div>
      </div>

      {/* Week nav */}
      {view === 'week' && (
        <div className="flex items-center justify-between">
          <button onClick={prevWeek} className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white cursor-pointer hover:bg-[#F8FAFB] transition">
            <ChevronLeft size={16} className="text-[#64748B]" />
          </button>
          <p className="text-sm font-semibold text-[#1E293B]">
            {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
            {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <button onClick={nextWeek} className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#E2E8F0] bg-white cursor-pointer hover:bg-[#F8FAFB] transition">
            <ChevronRight size={16} className="text-[#64748B]" />
          </button>
        </div>
      )}

      {/* Week view */}
      {view === 'week' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="grid border-b border-[#E2E8F0]" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
            <div className="p-3 border-r border-[#E2E8F0]" />
            {weekDates.map((d, i) => {
              const isToday = fmt(d) === today
              return (
                <div key={i} className={`p-3 text-center border-r border-[#E2E8F0] last:border-r-0 ${isToday ? 'bg-[#EFF6F8]' : ''}`}>
                  <p className="m-0 text-xs text-[#94A3B8] font-medium">{DAYS[d.getDay()]}</p>
                  <p className={`m-0 text-sm font-bold mt-0.5 ${isToday ? 'text-[#0A4174]' : 'text-[#1E293B]'}`}>{d.getDate()}</p>
                </div>
              )
            })}
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 480 }}>
            {HOURS.map(hour => (
              <div key={hour} className="grid border-b border-[#E2E8F0] last:border-b-0" style={{ gridTemplateColumns: '56px repeat(7, 1fr)', minHeight: 64 }}>
                <div className="p-2 border-r border-[#E2E8F0] flex items-start justify-center pt-2">
                  <span className="text-xs text-[#94A3B8] font-medium">{hour > 12 ? `${hour - 12}pm` : hour === 12 ? '12pm' : `${hour}am`}</span>
                </div>
                {weekDates.map((d, di) => {
                  const slotAppts = getApptsForSlot(d, hour)
                  const isToday   = fmt(d) === today
                  return (
                    <div key={di} className={`p-1 border-r border-[#E2E8F0] last:border-r-0 ${isToday ? 'bg-[#EFF6F8]/40' : ''}`}>
                      {slotAppts.map(a => {
                        const color = STATUS_COLORS[a.status] ?? '#0A4174'
                        return (
                          <div key={a.id} onClick={() => { setSelected(a); setDetailOpen(true) }}
                            className="rounded-lg px-2 py-1.5 mb-1 cursor-pointer hover:opacity-90 transition"
                            style={{ backgroundColor: color + '18', borderLeft: `3px solid ${color}` }}>
                            <p className="m-0 text-xs font-bold truncate" style={{ color }}>{a.appointmentDate?.split('T')[1]?.slice(0, 5)}</p>
                            <p className="m-0 text-xs font-semibold text-[#1E293B] truncate">{a.patient?.user?.username ?? 'Patient'}</p>
                            <p className="m-0 text-xs text-[#64748B] truncate">{a.notes || 'Appointment'}</p>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="flex flex-col gap-3">
          {loading && <p className="text-sm text-[#94A3B8] text-center py-8">Loading...</p>}
          {['Today', 'Upcoming', 'Past'].map(group => {
            const groupAppts = appts.filter(a => {
              const d = a.appointmentDate?.split('T')[0]
              if (group === 'Today')    return d === today
              if (group === 'Upcoming') return d > today && (a.status === 'PENDING' || a.status === 'CONFIRMED')
              return a.status === 'COMPLETED' || a.status === 'CANCELLED'
            })
            if (!groupAppts.length) return null
            return (
              <div key={group} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#E2E8F0] bg-[#F8FAFB]">
                  <p className="m-0 text-xs font-bold text-[#64748B] uppercase tracking-wider">{group} · {groupAppts.length}</p>
                </div>
                <div className="flex flex-col divide-y divide-[#E2E8F0]">
                  {groupAppts.map(a => {
                    const color = STATUS_COLORS[a.status] ?? '#0A4174'
                    return (
                      <div key={a.id} onClick={() => { setSelected(a); setDetailOpen(true) }}
                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#F8FAFB] transition cursor-pointer">
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0" style={{ backgroundColor: color + '15' }}>
                          <span className="text-xs font-bold leading-none" style={{ color }}>{a.appointmentDate?.split('T')[1]?.slice(0, 5)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="m-0 text-sm font-semibold text-[#1E293B]">{a.patient?.user?.username ?? 'Patient'}</p>
                          <p className="m-0 text-xs text-[#64748B]">{a.appointmentDate?.split('T')[0]} · {a.notes || 'Appointment'}</p>
                        </div>
                        <StatusBadge status={a.status} map={APPOINTMENT_STATUS} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <Modal open={detailOpen} onClose={() => setDetailOpen(false)}
          title={selected.patient?.user?.username ?? 'Appointment'}
          subtitle={`${selected.appointmentDate?.replace('T', ' ').slice(0, 16)}`}
          footer={
            <>
              {(selected.status === 'PENDING' || selected.status === 'CONFIRMED') && (
                <>
                  <Button onClick={() => changeStatus(selected.id, 'COMPLETED')} size="md">
                    <CheckCircle size={14} /> Complete
                  </Button>
                  <Button onClick={() => { setRescheduleForm({ date: selected.appointmentDate?.split('T')[0], time: selected.appointmentDate?.split('T')[1]?.slice(0, 5) }); setRescheduleOpen(true) }} variant="outline" size="md">
                    <CalendarClock size={14} /> Reschedule
                  </Button>
                  <Button onClick={() => changeStatus(selected.id, 'CANCELLED')} variant="danger" size="md">
                    <XCircle size={14} /> Cancel
                  </Button>
                </>
              )}
              <Button variant="ghost" onClick={() => setDetailOpen(false)}>Close</Button>
            </>
          }>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Patient',  selected.patient?.user?.username ?? '—'],
              ['Date',     selected.appointmentDate?.split('T')[0]],
              ['Time',     selected.appointmentDate?.split('T')[1]?.slice(0, 5)],
              ['Status',   <StatusBadge status={selected.status} map={APPOINTMENT_STATUS} />],
              ['Notes',    selected.notes || '—'],
            ].map(([label, value]) => (
              <div key={label} className="bg-[#F8FAFB] rounded-xl p-3">
                <p className="m-0 text-xs text-[#94A3B8] font-medium uppercase tracking-wide">{label}</p>
                <div className="mt-1 text-sm font-semibold text-[#1E293B]">{value}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Reschedule modal */}
      <Modal open={rescheduleOpen} onClose={() => setRescheduleOpen(false)}
        title="Reschedule Appointment" width={400}
        footer={<><Button variant="ghost" onClick={() => setRescheduleOpen(false)}>Cancel</Button><Button onClick={doReschedule} disabled={saving}><CalendarClock size={14} /> Confirm</Button></>}>
        <div className="flex flex-col gap-1">
          <p className="m-0 text-xs text-[#64748B] mb-3">Weekdays only · 9:00 AM – 6:00 PM</p>
          <InputField label="New Date *" type="date" value={rescheduleForm.date} onChange={e => setRescheduleForm(p => ({ ...p, date: e.target.value }))} />
          <InputField label="New Time *" type="time" value={rescheduleForm.time} onChange={e => setRescheduleForm(p => ({ ...p, time: e.target.value }))} />
        </div>
      </Modal>
    </div>
  )
}
