import { useState, useEffect } from 'react'
import { Activity, Plus, Eye, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import DataTable from '../../components/ui/DataTable'
import DetailsDrawer from '../../components/ui/DetailsDrawer'
import PageHeader from '../../components/ui/PageHeader'
import FilterBar from '../../components/ui/FilterBar'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import InputField from '../../components/ui/InputField'
import { StatusBadge, GLUCOSE_STATUS, classifyGlucose } from '../../constants/status'
import { getMyReadings, logReading, deleteReading } from '../../api/glucose'

const MEAL_CONTEXT = ['Fasting', 'Before Meal', 'After Meal', '2h Post-Meal', 'Bedtime', 'Random']
const MEAL_CONTEXT_MAP = {
  'Fasting': 'FASTING', 'Before Meal': 'BEFORE_MEAL', 'After Meal': 'AFTER_MEAL',
  '2h Post-Meal': 'AFTER_MEAL', 'Bedtime': 'BEDTIME', 'Random': 'RANDOM',
}

const PAGE_SIZE = 10
const STATUS_FILTERS = [{ value: 'ALL', label: 'All' }, ...Object.entries(GLUCOSE_STATUS).map(([k, v]) => ({ value: k, label: v.label }))]

const COLUMNS = [
  { label: 'Glucose',  key: 'value',      render: (val) => <span className="font-mono font-bold text-[#1E293B]">{val} <span className="text-xs font-normal text-[#64748B]">mg/dL</span></span> },
  { label: 'Status',   key: 'value',      render: (val) => <StatusBadge status={classifyGlucose(val)} map={GLUCOSE_STATUS} /> },
  { label: 'Context',  key: 'mealContext',render: (val) => val?.replace('_', ' ') },
  { label: 'Recorded', key: 'recordedAt', render: (val) => val?.replace('T', ' ').slice(0, 16) },
]

const EMPTY_FORM = { value: '', mealContext: '', deviceType: 'Glucometer', notes: '' }

export default function PatientGlucoseLog() {
  const [readings,     setReadings]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page,         setPage]         = useState(1)
  const [selected,     setSelected]     = useState(null)
  const [drawerOpen,   setDrawerOpen]   = useState(false)
  const [modalOpen,    setModalOpen]    = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [form,         setForm]         = useState(EMPTY_FORM)
  const handle = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const load = () => {
    setLoading(true)
    getMyReadings()
      .then(r => setReadings(r.data))
      .catch(() => toast.error('Failed to load readings'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = readings.filter(r => {
    const matchSearch = String(r.value).includes(search) || r.mealContext?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = statusFilter === 'ALL' || classifyGlucose(r.value) === statusFilter
    return matchSearch && matchFilter
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const rows       = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  useEffect(() => { setPage(1) }, [search, statusFilter])

  const submit = async () => {
    if (!form.value || !form.mealContext) { toast.error('Fill in all required fields'); return }
    setSaving(true)
    try {
      await logReading({
        value: parseFloat(form.value),
        unit: 'MG_DL',
        mealContext: MEAL_CONTEXT_MAP[form.mealContext] || 'RANDOM',
        notes: form.notes,
      })
      toast.success('Reading logged')
      setModalOpen(false)
      setForm(EMPTY_FORM)
      load()
    } catch {
      toast.error('Failed to save reading')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    try {
      await deleteReading(id)
      setReadings(p => p.filter(r => r.id !== id))
      toast.success('Reading deleted')
    } catch {
      toast.error('Failed to delete reading')
    }
  }

  const rowActions = (row) => [
    { label: 'View Details', icon: <Eye size={14} />,    onClick: () => { setSelected(row); setDrawerOpen(true) } },
    { label: 'Delete',       icon: <Trash2 size={14} />, onClick: () => remove(row.id), danger: true },
  ]

  return (
    <div>
      <PageHeader title="Glucose Log" subtitle={`${filtered.length} readings`}
        actions={<Button size="md" onClick={() => { setForm(EMPTY_FORM); setModalOpen(true) }}><Plus size={15} /> Log Reading</Button>} />
      <FilterBar search={search} onSearch={setSearch} placeholder="Search by context or value..."
        filters={STATUS_FILTERS} activeFilter={statusFilter} onFilter={setStatusFilter} />
      <DataTable
        columns={COLUMNS}
        rows={rows.map(r => ({ ...r, _onClick: () => { setSelected(r); setDrawerOpen(true) } }))}
        emptyMsg={loading ? 'Loading...' : 'No readings found'}
        page={page} totalPages={totalPages} totalElements={filtered.length}
        pageSize={PAGE_SIZE} onPageChange={setPage} rowActions={rowActions}
      />

      <DetailsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={`${selected?.value} mg/dL`}
        subtitle={`${selected?.mealContext?.replace('_', ' ')} · ${selected?.recordedAt?.replace('T', ' ').slice(0, 16)}`}
        icon={<Activity size={18} color="#16A34A" />}
        profile={[
          { label: 'Value',   value: `${selected?.value} mg/dL`, color: selected ? GLUCOSE_STATUS[classifyGlucose(selected.value)]?.color : undefined },
          { label: 'Status',  value: selected ? <StatusBadge status={classifyGlucose(selected.value)} map={GLUCOSE_STATUS} /> : null },
          { label: 'Context', value: selected?.mealContext?.replace('_', ' ') },
        ]}
        sections={[{ heading: 'Reading Details', rows: [
          { label: 'Glucose Value', value: `${selected?.value} mg/dL` },
          { label: 'Unit',          value: selected?.unit },
          { label: 'Meal Context',  value: selected?.mealContext?.replace('_', ' ') },
          { label: 'Recorded At',   value: selected?.recordedAt?.replace('T', ' ').slice(0, 16) },
          { label: 'Notes',         value: selected?.notes || 'None' },
        ]}]}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log Glucose Reading"
        subtitle="Record your current blood glucose level"
        footer={<><Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button><Button onClick={submit} disabled={saving}>{saving ? 'Saving...' : 'Save Reading'}</Button></>}>
        <div className="flex flex-col gap-1">
          <div className="grid grid-cols-2 gap-x-4">
            <InputField label="Glucose Value (mg/dL) *" type="number" placeholder="e.g. 108" value={form.value} onChange={handle('value')} />
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs font-semibold text-[#1E293B]">Meal Context *</label>
              <select value={form.mealContext} onChange={handle('mealContext')}
                style={{ height: 'var(--input-h-desktop)', borderRadius: 'var(--radius-md)' }}
                className="px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none focus:border-[#0A4174] w-full">
                <option value="">Select context</option>
                {MEAL_CONTEXT.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <InputField label="Notes" placeholder="Optional notes..." value={form.notes} onChange={handle('notes')} />
        </div>
      </Modal>
    </div>
  )
}
