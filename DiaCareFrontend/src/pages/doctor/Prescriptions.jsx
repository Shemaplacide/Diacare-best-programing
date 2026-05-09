import { useState } from 'react'
import { Plus, Pill, Search, ChevronDown, ChevronUp, ClipboardList } from 'lucide-react'
import { toast } from 'react-toastify'
import Modal from '../../components/ui/Modal'
import InputField from '../../components/ui/InputField'
import Button from '../../components/ui/Button'
import { StatusBadge } from '../../constants/status'

const PRESCRIPTION_STATUS = {
  ACTIVE:   { label: 'Active',   color: '#16A34A', bg: '#F0FDF4' },
  EXPIRED:  { label: 'Expired',  color: '#64748B', bg: '#F1F5F9' },
  STOPPED:  { label: 'Stopped',  color: '#DC2626', bg: '#FFF1F0' },
}

const MOCK_PRESCRIPTIONS = [
  { id: 1,  patient: 'Alice Mutoni',    medication: 'Metformin',   dosage: '500mg',  frequency: 'Twice daily',    startDate: '2025-06-01', endDate: '2025-09-01', status: 'ACTIVE',  instructions: 'Take with meals. Monitor blood sugar weekly.' },
  { id: 2,  patient: 'Jean Habimana',   medication: 'Glibenclamide', dosage: '5mg',  frequency: 'Once daily',     startDate: '2025-05-15', endDate: '2025-08-15', status: 'ACTIVE',  instructions: 'Take 30 minutes before breakfast.' },
  { id: 3,  patient: 'Marie Uwase',     medication: 'Insulin Glargine', dosage: '10 units', frequency: 'Once at bedtime', startDate: '2025-04-01', endDate: '2025-07-01', status: 'EXPIRED', instructions: 'Inject subcutaneously. Rotate injection sites.' },
  { id: 4,  patient: 'Paul Kagame',     medication: 'Sitagliptin', dosage: '100mg',  frequency: 'Once daily',     startDate: '2025-06-10', endDate: '2025-09-10', status: 'ACTIVE',  instructions: 'Can be taken with or without food.' },
  { id: 5,  patient: 'Grace Ineza',     medication: 'Metformin',   dosage: '1000mg', frequency: 'Twice daily',    startDate: '2025-03-01', endDate: '2025-06-01', status: 'STOPPED', instructions: 'Stopped due to GI side effects.' },
  { id: 6,  patient: 'David Mugisha',   medication: 'Empagliflozin', dosage: '10mg', frequency: 'Once daily',     startDate: '2025-07-01', endDate: '2025-10-01', status: 'ACTIVE',  instructions: 'Take in the morning. Stay well hydrated.' },
]

const MEDICATIONS = ['Metformin', 'Glibenclamide', 'Insulin Glargine', 'Insulin Aspart', 'Sitagliptin', 'Empagliflozin', 'Dapagliflozin', 'Pioglitazone', 'Acarbose', 'Liraglutide']
const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Once at bedtime', 'Before meals', 'With meals', 'As needed']

const EMPTY_FORM = { patient: '', medication: '', dosage: '', frequency: '', startDate: '', endDate: '', instructions: '' }

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState(MOCK_PRESCRIPTIONS)
  const [search,        setSearch]        = useState('')
  const [filter,        setFilter]        = useState('ALL')
  const [modalOpen,     setModalOpen]     = useState(false)
  const [expanded,      setExpanded]      = useState(null)
  const [form,          setForm]          = useState(EMPTY_FORM)
  const handle = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const filtered = prescriptions.filter(p => {
    const matchSearch = p.patient.toLowerCase().includes(search.toLowerCase()) ||
                        p.medication.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || p.status === filter
    return matchSearch && matchFilter
  })

  const submit = () => {
    if (!form.patient || !form.medication || !form.dosage || !form.frequency || !form.startDate) {
      toast.error('Please fill in all required fields')
      return
    }
    const newRx = { id: Date.now(), ...form, status: 'ACTIVE' }
    setPrescriptions(p => [newRx, ...p])
    toast.success(`Prescription issued for ${form.patient}`)
    setModalOpen(false)
    setForm(EMPTY_FORM)
  }

  const stats = {
    total:   prescriptions.length,
    active:  prescriptions.filter(p => p.status === 'ACTIVE').length,
    expired: prescriptions.filter(p => p.status === 'EXPIRED').length,
    stopped: prescriptions.filter(p => p.status === 'STOPPED').length,
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight m-0">Prescriptions</h1>
          <p className="text-sm text-[#64748B] mt-1 m-0">{stats.active} active prescriptions</p>
        </div>
        <Button onClick={() => { setForm(EMPTY_FORM); setModalOpen(true) }}>
          <Plus size={15} /> Issue Prescription
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',   value: stats.total,   color: '#0A4174', bg: '#EFF6F8' },
          { label: 'Active',  value: stats.active,  color: '#16A34A', bg: '#F0FDF4' },
          { label: 'Expired', value: stats.expired, color: '#64748B', bg: '#F1F5F9' },
          { label: 'Stopped', value: stats.stopped, color: '#DC2626', bg: '#FFF1F0' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: s.bg }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + '20' }}>
              <Pill size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p className="m-0 text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
              <p className="m-0 text-xs text-[#64748B] font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search patient or medication..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#E2E8F0] rounded-xl bg-white outline-none focus:border-[#0A4174]"
          />
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

      {/* Prescriptions list */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 flex flex-col items-center gap-3">
            <ClipboardList size={36} className="text-[#CBD5E1]" />
            <p className="m-0 text-sm text-[#64748B]">No prescriptions found</p>
          </div>
        )}
        {filtered.map(rx => (
          <div key={rx.id} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div
              className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[#F8FAFB] transition"
              onClick={() => setExpanded(expanded === rx.id ? null : rx.id)}
            >
              {/* Pill icon */}
              <div className="w-10 h-10 rounded-xl bg-[#EFF6F8] flex items-center justify-center shrink-0">
                <Pill size={18} className="text-[#0A4174]" />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="m-0 text-sm font-bold text-[#1E293B]">{rx.medication}</p>
                  <span className="text-xs text-[#94A3B8]">·</span>
                  <p className="m-0 text-sm text-[#64748B]">{rx.dosage} — {rx.frequency}</p>
                </div>
                <p className="m-0 text-xs text-[#94A3B8] mt-0.5">Patient: {rx.patient} · {rx.startDate} → {rx.endDate || 'Ongoing'}</p>
              </div>
              <StatusBadge status={rx.status} map={PRESCRIPTION_STATUS} />
              {expanded === rx.id ? <ChevronUp size={16} className="text-[#94A3B8] shrink-0" /> : <ChevronDown size={16} className="text-[#94A3B8] shrink-0" />}
            </div>

            {/* Expanded instructions */}
            {expanded === rx.id && (
              <div className="px-5 pb-4 border-t border-[#E2E8F0]">
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                  {[
                    ['Patient',   rx.patient],
                    ['Dosage',    rx.dosage],
                    ['Frequency', rx.frequency],
                    ['Status',    <StatusBadge status={rx.status} map={PRESCRIPTION_STATUS} />],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-[#F8FAFB] rounded-xl p-3">
                      <p className="m-0 text-xs text-[#94A3B8] uppercase tracking-wide font-medium">{label}</p>
                      <div className="mt-1 text-sm font-semibold text-[#1E293B]">{value}</div>
                    </div>
                  ))}
                </div>
                {rx.instructions && (
                  <div className="bg-[#FFFBEB] border border-[#D97706]/20 rounded-xl p-3">
                    <p className="m-0 text-xs font-bold text-[#D97706] mb-1">Instructions</p>
                    <p className="m-0 text-sm text-[#1E293B]">{rx.instructions}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Issue prescription modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Issue Prescription"
        subtitle="Create a new prescription for your patient"
        width={520}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={submit}><Pill size={14} /> Issue</Button>
          </>
        }
      >
        <div className="flex flex-col gap-1">
          <InputField label="Patient Name *" placeholder="Alice Mutoni" value={form.patient} onChange={handle('patient')} />

          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-xs font-semibold text-[#1E293B]">Medication *</label>
            <select value={form.medication} onChange={handle('medication')}
              className="px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none focus:border-[#0A4174] w-full rounded-xl"
              style={{ height: 'var(--input-h-desktop)' }}>
              <option value="">Select medication</option>
              {MEDICATIONS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-x-4">
            <InputField label="Dosage *" placeholder="e.g. 500mg" value={form.dosage} onChange={handle('dosage')} />
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs font-semibold text-[#1E293B]">Frequency *</label>
              <select value={form.frequency} onChange={handle('frequency')}
                className="px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none focus:border-[#0A4174] w-full rounded-xl"
                style={{ height: 'var(--input-h-desktop)' }}>
                <option value="">Select frequency</option>
                {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4">
            <InputField label="Start Date *" type="date" value={form.startDate} onChange={handle('startDate')} />
            <InputField label="End Date"     type="date" value={form.endDate}   onChange={handle('endDate')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#1E293B]">Instructions</label>
            <textarea
              value={form.instructions} onChange={handle('instructions')}
              placeholder="e.g. Take with meals. Monitor blood sugar weekly."
              rows={3}
              className="px-3.5 py-2.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none focus:border-[#0A4174] w-full rounded-xl resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
