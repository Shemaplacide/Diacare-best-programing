import { useState, useEffect } from 'react'
import { Plus, Pill, Utensils, Search, ChevronDown, ChevronUp, ClipboardList, Apple } from 'lucide-react'
import { toast } from 'react-toastify'
import Modal from '../../components/ui/Modal'
import InputField from '../../components/ui/InputField'
import Button from '../../components/ui/Button'
import { StatusBadge } from '../../constants/status'
import {
  getMyPrescriptions, createPrescription, deletePrescription,
  getMyMealPlans, createMealPlan, deleteMealPlan,
  getMyPatients, getDoctorProfile,
} from '../../api/doctorApi'

const RX_STATUS = {
  ACTIVE:  { label: 'Active',  color: '#16A34A', bg: '#F0FDF4' },
  EXPIRED: { label: 'Expired', color: '#64748B', bg: '#F1F5F9' },
  STOPPED: { label: 'Stopped', color: '#DC2626', bg: '#FFF1F0' },
}
const PLAN_STATUS = {
  ACTIVE:  { label: 'Active',  color: '#16A34A', bg: '#F0FDF4' },
  EXPIRED: { label: 'Expired', color: '#64748B', bg: '#F1F5F9' },
  DRAFT:   { label: 'Draft',   color: '#D97706', bg: '#FFFBEB' },
}
const MEAL_ICONS   = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snacks: '🍎' }
const MEDICATIONS  = ['Metformin', 'Glibenclamide', 'Insulin Glargine', 'Insulin Aspart', 'Sitagliptin', 'Empagliflozin', 'Dapagliflozin', 'Pioglitazone', 'Acarbose', 'Liraglutide']
const FREQUENCIES  = ['Once daily', 'Twice daily', 'Three times daily', 'Once at bedtime', 'Before meals', 'With meals', 'As needed']
const DIABETES_TYPES = ['Type 1', 'Type 2', 'Gestational', 'Prediabetes']
const CALORIE_GOALS  = ['1200 kcal', '1500 kcal', '1800 kcal', '2000 kcal', '2200 kcal', '2500 kcal']

function SearchFilter({ search, onSearch, filter, onFilter, filters }) {
  return (
    <div className="flex items-center gap-3 flex-wrap mb-4">
      <div className="relative flex-1 min-w-[180px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
        <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search patient or medication..."
          className="w-full pl-8 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-xl bg-white outline-none focus:border-[#0A4174]" />
      </div>
      <div className="flex items-center bg-[#F1F5F9] rounded-xl p-1 gap-1">
        {filters.map(f => (
          <button key={f} onClick={() => onFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition
              ${filter === f ? 'bg-white text-[#0A4174] shadow-sm' : 'bg-transparent text-[#64748B]'}`}>
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-xs font-semibold text-[#1E293B]">{label}</label>
      <select value={value} onChange={onChange}
        className="px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none focus:border-[#0A4174] w-full rounded-xl"
        style={{ height: 'var(--input-h-desktop)' }}>
        <option value="">Select...</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}

function TextArea({ label, value, onChange, placeholder, rows = 2 }) {
  return (
    <div className="flex flex-col gap-1.5 mb-3">
      {label && <label className="text-xs font-semibold text-[#1E293B]">{label}</label>}
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
        className="px-3.5 py-2.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none focus:border-[#0A4174] w-full rounded-xl resize-none" />
    </div>
  )
}

// ── Prescriptions tab ──────────────────────────────────────────────────────
function PrescriptionsTab({ patients, doctorPublicId }) {
  const [items,     setItems]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('ALL')
  const [expanded,  setExpanded]  = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [form,      setForm]      = useState({
    patientPublicId: '', medication: '', dosage: '', frequency: '',
    startDate: '', endDate: '', instructions: '',
  })
  const handle = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const load = () => {
    setLoading(true)
    getMyPrescriptions()
      .then(r => {
        const withStatus = r.data.map(rx => {
          if (rx.status) return rx
          const now = new Date()
          const end = rx.endDate ? new Date(rx.endDate) : null
          return { ...rx, status: !end || end >= now ? 'ACTIVE' : 'EXPIRED' }
        })
        setItems(withStatus)
      })
      .catch(() => toast.error('Failed to load prescriptions'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = items.filter(r => {
    const q = search.toLowerCase()
    const patientName = r.patient?.user?.username ?? ''
    const matchSearch = patientName.toLowerCase().includes(q) || r.medication?.toLowerCase().includes(q)
    return matchSearch && (filter === 'ALL' || r.status === filter)
  })

  const submit = async () => {
    if (!form.patientPublicId || !form.medication || !form.dosage || !form.frequency || !form.startDate) {
      toast.error('Fill in all required fields'); return
    }
    setSaving(true)
    try {
      await createPrescription({
        patientPublicId: form.patientPublicId,
        doctorPublicId,
        medication:   form.medication,
        dosage:       form.dosage,
        frequency:    form.frequency,
        startDate:    form.startDate,
        endDate:      form.endDate || null,
        instructions: form.instructions,
      })
      toast.success('Prescription issued')
      setModalOpen(false)
      setForm({ patientPublicId: '', medication: '', dosage: '', frequency: '', startDate: '', endDate: '', instructions: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to issue prescription')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    try {
      await deletePrescription(id)
      setItems(p => p.filter(r => r.id !== id))
      toast.success('Prescription removed')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to remove')
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3">
          {[['Active', items.filter(r => r.status === 'ACTIVE').length, '#16A34A', '#F0FDF4'],
            ['Expired', items.filter(r => r.status === 'EXPIRED').length, '#64748B', '#F1F5F9'],
            ['Stopped', items.filter(r => r.status === 'STOPPED').length, '#DC2626', '#FFF1F0']].map(([l, v, c, bg]) => (
            <div key={l} className="rounded-xl px-3 py-2 flex items-center gap-2" style={{ backgroundColor: bg }}>
              <span className="text-lg font-bold font-mono" style={{ color: c }}>{v}</span>
              <span className="text-xs text-[#64748B]">{l}</span>
            </div>
          ))}
        </div>
        <Button size="md" onClick={() => { setForm({ patientPublicId: '', medication: '', dosage: '', frequency: '', startDate: '', endDate: '', instructions: '' }); setModalOpen(true) }}>
          <Plus size={14} /> Issue
        </Button>
      </div>

      <SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter}
        filters={['ALL', 'ACTIVE', 'EXPIRED', 'STOPPED']} />

      {loading && <p className="text-sm text-[#94A3B8] text-center py-8">Loading...</p>}

      <div className="flex flex-col gap-2">
        {!loading && filtered.length === 0 && (
          <div className="bg-[#F8FAFB] rounded-2xl p-10 flex flex-col items-center gap-2">
            <ClipboardList size={32} className="text-[#CBD5E1]" />
            <p className="m-0 text-sm text-[#64748B]">No prescriptions found</p>
          </div>
        )}
        {filtered.map(rx => (
          <div key={rx.id} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F8FAFB] transition"
              onClick={() => setExpanded(expanded === rx.id ? null : rx.id)}>
              <div className="w-9 h-9 rounded-xl bg-[#EFF6F8] flex items-center justify-center shrink-0">
                <Pill size={16} className="text-[#0A4174]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 text-sm font-bold text-[#1E293B]">{rx.medication} <span className="font-normal text-[#64748B]">· {rx.dosage}</span></p>
                <p className="m-0 text-xs text-[#94A3B8]">{rx.patient?.user?.username ?? '—'} · {rx.dosage}</p>
              </div>
              <StatusBadge status={rx.status} map={RX_STATUS} />
              {expanded === rx.id ? <ChevronUp size={14} className="text-[#94A3B8]" /> : <ChevronDown size={14} className="text-[#94A3B8]" />}
            </div>
            {expanded === rx.id && (
              <div className="px-4 pb-4 border-t border-[#E2E8F0]">
                <div className="mt-3 grid grid-cols-2 gap-2 mb-2">
                  {[
                    ['Patient',    rx.patient?.user?.username ?? '—'],
                    ['Dosage',     rx.dosage],
                    ['Start Date', rx.startDate],
                    ['End Date',   rx.endDate || 'Ongoing'],
                    ['Status',     <StatusBadge status={rx.status} map={RX_STATUS} />],
                  ].map(([l, v]) => (
                    <div key={l} className="bg-[#F8FAFB] rounded-xl p-2.5">
                      <p className="m-0 text-xs text-[#94A3B8] uppercase tracking-wide">{l}</p>
                      <div className="mt-0.5 text-sm font-semibold text-[#1E293B]">{v}</div>
                    </div>
                  ))}
                </div>
                {rx.instructions && (
                  <div className="bg-[#FFFBEB] border border-[#D97706]/20 rounded-xl p-3 mb-2">
                    <p className="m-0 text-xs font-bold text-[#D97706] mb-1">Instructions</p>
                    <p className="m-0 text-sm text-[#1E293B]">{rx.instructions}</p>
                  </div>
                )}
                <button onClick={() => remove(rx.id)}
                  className="text-xs text-[#DC2626] bg-transparent border-0 cursor-pointer hover:underline mt-1">
                  Remove prescription
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Issue Prescription" width={500}
        footer={<><Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={submit} disabled={saving}><Pill size={13} /> {saving ? 'Issuing...' : 'Issue'}</Button></>}>
        <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-xs font-semibold text-[#1E293B]">Patient *</label>
            <select value={form.patientPublicId} onChange={handle('patientPublicId')}
              style={{ height: 'var(--input-h-desktop)', borderRadius: 'var(--radius-md)' }}
              className="px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none focus:border-[#0A4174] w-full">
              <option value="">Select patient</option>
              {patients.map(p => <option key={p.user?.publicId} value={p.user?.publicId}>{p.user?.username}</option>)}
            </select>
          </div>
          <SelectField label="Medication *" value={form.medication} onChange={handle('medication')} options={MEDICATIONS} />
          <div className="grid grid-cols-2 gap-x-4">
            <InputField label="Dosage *" placeholder="e.g. 500mg" value={form.dosage} onChange={handle('dosage')} />
            <SelectField label="Frequency *" value={form.frequency} onChange={handle('frequency')} options={FREQUENCIES} />
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <InputField label="Start Date *" type="date" value={form.startDate} onChange={handle('startDate')} />
            <InputField label="End Date"     type="date" value={form.endDate}   onChange={handle('endDate')} />
          </div>
          <TextArea label="Instructions" value={form.instructions} onChange={handle('instructions')} placeholder="e.g. Take with meals..." rows={2} />
        </div>
      </Modal>
    </>
  )
}

// ── Meal Plans tab ─────────────────────────────────────────────────────────
function MealPlansTab({ patients, doctorPublicId }) {
  const [items,     setItems]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('ALL')
  const [expanded,  setExpanded]  = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [form,      setForm]      = useState({
    patientPublicId: '', diabetesType: '', calorieGoal: '',
    startDate: '', endDate: '', breakfast: '', lunch: '', dinner: '', snacks: '', notes: '',
  })
  const handle = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const load = () => {
    setLoading(true)
    getMyMealPlans()
      .then(r => {
        const withStatus = r.data.map(plan => {
          if (plan.status) return plan
          const now = new Date()
          const end = plan.endDate ? new Date(plan.endDate) : null
          return { ...plan, status: !end || end >= now ? 'ACTIVE' : 'EXPIRED' }
        })
        setItems(withStatus)
      })
      .catch(() => toast.error('Failed to load meal plans'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = items.filter(p => {
    const patientName = p.patient?.user?.username ?? ''
    return patientName.toLowerCase().includes(search.toLowerCase()) &&
           (filter === 'ALL' || p.status === filter)
  })

  const submit = async () => {
    if (!form.patientPublicId || !form.diabetesType || !form.calorieGoal || !form.startDate) {
      toast.error('Fill in all required fields'); return
    }
    setSaving(true)
    try {
      await createMealPlan({
        patientPublicId: form.patientPublicId,
        doctorPublicId,
        diabetesType: form.diabetesType,
        calorieGoal:  form.calorieGoal,
        startDate:    form.startDate,
        endDate:      form.endDate || null,
        breakfast:    form.breakfast,
        lunch:        form.lunch,
        dinner:       form.dinner,
        snacks:       form.snacks,
        notes:        form.notes,
      })
      toast.success('Meal plan created')
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to create meal plan')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    try {
      await deleteMealPlan(id)
      setItems(p => p.filter(x => x.id !== id))
      toast.success('Meal plan removed')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to remove')
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="m-0 text-sm text-[#64748B]">{items.filter(p => p.status === 'ACTIVE').length} active plans</p>
        <Button size="md" onClick={() => { setForm({ patientPublicId: '', diabetesType: '', calorieGoal: '', startDate: '', endDate: '', breakfast: '', lunch: '', dinner: '', snacks: '', notes: '' }); setModalOpen(true) }}>
          <Plus size={14} /> Create Plan
        </Button>
      </div>

      <SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter}
        filters={['ALL', 'ACTIVE', 'EXPIRED', 'DRAFT']} />

      {loading && <p className="text-sm text-[#94A3B8] text-center py-8">Loading...</p>}

      <div className="flex flex-col gap-2">
        {!loading && filtered.length === 0 && (
          <div className="bg-[#F8FAFB] rounded-2xl p-10 flex flex-col items-center gap-2">
            <Apple size={32} className="text-[#CBD5E1]" />
            <p className="m-0 text-sm text-[#64748B]">No meal plans found</p>
          </div>
        )}
        {filtered.map(plan => (
          <div key={plan.id} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F8FAFB] transition"
              onClick={() => setExpanded(expanded === plan.id ? null : plan.id)}>
              <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] flex items-center justify-center shrink-0">
                <Utensils size={16} className="text-[#16A34A]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 text-sm font-bold text-[#1E293B]">{plan.patient?.user?.username ?? '—'}</p>
                <p className="m-0 text-xs text-[#94A3B8]">{plan.diabetesType} · {plan.calorieGoal} · {plan.startDate} → {plan.endDate || 'Ongoing'}</p>
              </div>
              <StatusBadge status={plan.status} map={PLAN_STATUS} />
              {expanded === plan.id ? <ChevronUp size={14} className="text-[#94A3B8]" /> : <ChevronDown size={14} className="text-[#94A3B8]" />}
            </div>
            {expanded === plan.id && (
              <div className="px-4 pb-4 border-t border-[#E2E8F0]">
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  {['breakfast', 'lunch', 'dinner', 'snacks'].map(meal => plan[meal] && (
                    <div key={meal} className="bg-[#F8FAFB] rounded-xl p-3">
                      <p className="m-0 text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1">{MEAL_ICONS[meal]} {meal.charAt(0).toUpperCase() + meal.slice(1)}</p>
                      <p className="m-0 text-sm text-[#1E293B]">{plan[meal]}</p>
                    </div>
                  ))}
                </div>
                {plan.notes && (
                  <div className="bg-[#FFFBEB] border border-[#D97706]/20 rounded-xl p-3 mb-2">
                    <p className="m-0 text-xs font-bold text-[#D97706] mb-1">Doctor's Notes</p>
                    <p className="m-0 text-sm text-[#1E293B]">{plan.notes}</p>
                  </div>
                )}
                <button onClick={() => remove(plan.id)}
                  className="text-xs text-[#DC2626] bg-transparent border-0 cursor-pointer hover:underline mt-1">
                  Remove plan
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Meal Plan" width={540}
        footer={<><Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={submit} disabled={saving}><Utensils size={13} /> {saving ? 'Saving...' : 'Save Plan'}</Button></>}>
        <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-xs font-semibold text-[#1E293B]">Patient *</label>
            <select value={form.patientPublicId} onChange={handle('patientPublicId')}
              style={{ height: 'var(--input-h-desktop)', borderRadius: 'var(--radius-md)' }}
              className="px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none focus:border-[#0A4174] w-full">
              <option value="">Select patient</option>
              {patients.map(p => <option key={p.user?.publicId} value={p.user?.publicId}>{p.user?.username}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <SelectField label="Diabetes Type *"      value={form.diabetesType} onChange={handle('diabetesType')} options={DIABETES_TYPES} />
            <SelectField label="Daily Calorie Goal *" value={form.calorieGoal}  onChange={handle('calorieGoal')}  options={CALORIE_GOALS} />
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <InputField label="Start Date *" type="date" value={form.startDate} onChange={handle('startDate')} />
            <InputField label="End Date"     type="date" value={form.endDate}   onChange={handle('endDate')} />
          </div>
          {['breakfast', 'lunch', 'dinner', 'snacks'].map(meal => (
            <TextArea key={meal} label={`${MEAL_ICONS[meal]} ${meal.charAt(0).toUpperCase() + meal.slice(1)}`}
              value={form[meal]} onChange={handle(meal)} placeholder={`Describe ${meal}...`} />
          ))}
          <TextArea label="Doctor's Notes" value={form.notes} onChange={handle('notes')} placeholder="Additional dietary instructions..." />
        </div>
      </Modal>
    </>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function PatientCare() {
  const [tab,            setTab]            = useState('prescriptions')
  const [patients,       setPatients]       = useState([])
  const [doctorPublicId, setDoctorPublicId] = useState(null)

  useEffect(() => {
    Promise.all([getMyPatients(), getDoctorProfile()])
      .then(([p, d]) => {
        setPatients(p.data)
        setDoctorPublicId(d.data?.user?.publicId ?? null)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight m-0">Patient Care</h1>
        <p className="text-sm text-[#64748B] mt-1 m-0">Manage prescriptions and meal plans for your patients</p>
      </div>

      <div className="flex items-center bg-[#F1F5F9] rounded-xl p-1 gap-1 w-fit">
        <button onClick={() => setTab('prescriptions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-0 cursor-pointer transition
            ${tab === 'prescriptions' ? 'bg-white text-[#0A4174] shadow-sm' : 'bg-transparent text-[#64748B]'}`}>
          <Pill size={15} /> Prescriptions
        </button>
        <button onClick={() => setTab('mealplans')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-0 cursor-pointer transition
            ${tab === 'mealplans' ? 'bg-white text-[#0A4174] shadow-sm' : 'bg-transparent text-[#64748B]'}`}>
          <Utensils size={15} /> Meal Plans
        </button>
      </div>

      {tab === 'prescriptions'
        ? <PrescriptionsTab patients={patients} doctorPublicId={doctorPublicId} />
        : <MealPlansTab     patients={patients} doctorPublicId={doctorPublicId} />
      }
    </div>
  )
}
