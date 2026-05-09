import { useState, useEffect } from 'react'
import { Pill, Search, ChevronDown, ChevronUp, ClipboardList } from 'lucide-react'
import { toast } from 'react-toastify'
import { StatusBadge } from '../../constants/status'
import { getMyPrescriptions } from '../../api/prescriptions'

const RX_STATUS = {
  ACTIVE:  { label: 'Active',  color: '#16A34A', bg: '#F0FDF4' },
  EXPIRED: { label: 'Expired', color: '#64748B', bg: '#F1F5F9' },
  STOPPED: { label: 'Stopped', color: '#DC2626', bg: '#FFF1F0' },
}

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [filter,        setFilter]        = useState('ALL')
  const [expanded,      setExpanded]      = useState(null)

  useEffect(() => {
    getMyPrescriptions()
      .then(r => setPrescriptions(r.data))
      .catch(() => toast.error('Failed to load prescriptions'))
      .finally(() => setLoading(false))
  }, [])

  // Derive status from dates if not set
  const withStatus = prescriptions.map(rx => {
    if (rx.status) return rx
    const now = new Date()
    const end = rx.endDate ? new Date(rx.endDate) : null
    return { ...rx, status: !end || end >= now ? 'ACTIVE' : 'EXPIRED' }
  })

  const filtered = withStatus.filter(r =>
    (r.medication?.toLowerCase().includes(search.toLowerCase()) ||
     r.doctor?.user?.username?.toLowerCase().includes(search.toLowerCase())) &&
    (filter === 'ALL' || r.status === filter)
  )

  const stats = {
    active:  withStatus.filter(r => r.status === 'ACTIVE').length,
    expired: withStatus.filter(r => r.status === 'EXPIRED').length,
    stopped: withStatus.filter(r => r.status === 'STOPPED').length,
  }

  return (
    <div className="flex flex-col gap-5">

      <div>
        <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight m-0">My Prescriptions</h1>
        <p className="text-sm text-[#64748B] mt-1 m-0">Medications prescribed by your doctor</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[['Active', stats.active, '#16A34A', '#F0FDF4'], ['Expired', stats.expired, '#64748B', '#F1F5F9'], ['Stopped', stats.stopped, '#DC2626', '#FFF1F0']].map(([l, v, c, bg]) => (
          <div key={l} className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: bg }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: c + '20' }}>
              <Pill size={18} style={{ color: c }} />
            </div>
            <div>
              <p className="m-0 text-2xl font-bold font-mono" style={{ color: c }}>{v}</p>
              <p className="m-0 text-xs text-[#64748B] font-medium">{l}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search medication or doctor..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#E2E8F0] rounded-xl bg-white outline-none focus:border-[#0A4174]" />
        </div>
        <div className="flex items-center bg-[#F1F5F9] rounded-xl p-1 gap-1">
          {['ALL', 'ACTIVE', 'EXPIRED', 'STOPPED'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition
                ${filter === f ? 'bg-white text-[#0A4174] shadow-sm' : 'bg-transparent text-[#64748B]'}`}>
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {loading && <p className="text-sm text-[#94A3B8] text-center py-8">Loading...</p>}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 flex flex-col items-center gap-3">
            <ClipboardList size={36} className="text-[#CBD5E1]" />
            <p className="m-0 text-sm text-[#64748B]">No prescriptions found</p>
          </div>
        )}
        {filtered.map(rx => {
          const doctorName = rx.doctor?.user?.username ?? rx.prescribedBy ?? 'Your doctor'
          return (
            <div key={rx.id} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
              <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[#F8FAFB] transition"
                onClick={() => setExpanded(expanded === rx.id ? null : rx.id)}>
                <div className="w-10 h-10 rounded-xl bg-[#EFF6F8] flex items-center justify-center shrink-0">
                  <Pill size={18} className="text-[#0A4174]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-sm font-bold text-[#1E293B]">{rx.medication} <span className="font-normal text-[#64748B]">· {rx.dosage}</span></p>
                  <p className="m-0 text-xs text-[#94A3B8] mt-0.5">{rx.frequency} · Prescribed by {doctorName}</p>
                </div>
                <StatusBadge status={rx.status} map={RX_STATUS} />
                {expanded === rx.id ? <ChevronUp size={16} className="text-[#94A3B8] shrink-0" /> : <ChevronDown size={16} className="text-[#94A3B8] shrink-0" />}
              </div>

              {expanded === rx.id && (
                <div className="px-5 pb-5 border-t border-[#E2E8F0]">
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    {[['Prescribed By', doctorName], ['Dosage', rx.dosage], ['Frequency', rx.frequency],
                      ['Start Date', rx.startDate], ['End Date', rx.endDate || 'Ongoing'],
                      ['Status', <StatusBadge status={rx.status} map={RX_STATUS} />]
                    ].map(([l, v]) => (
                      <div key={l} className="bg-[#F8FAFB] rounded-xl p-3">
                        <p className="m-0 text-xs text-[#94A3B8] uppercase tracking-wide font-medium">{l}</p>
                        <div className="mt-1 text-sm font-semibold text-[#1E293B]">{v}</div>
                      </div>
                    ))}
                  </div>
                  {rx.instructions && (
                    <div className="bg-[#FFFBEB] border border-[#D97706]/20 rounded-xl p-3 mb-2">
                      <p className="m-0 text-xs font-bold text-[#D97706] mb-1">Instructions</p>
                      <p className="m-0 text-sm text-[#1E293B]">{rx.instructions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
