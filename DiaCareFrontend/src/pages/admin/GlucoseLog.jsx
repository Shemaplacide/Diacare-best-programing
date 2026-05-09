import { useState, useEffect } from 'react'
import { Activity, Eye, Trash2, Plus } from 'lucide-react'
import { toast } from 'react-toastify'
import DataTable from '../../components/ui/DataTable'
import DetailsDrawer from '../../components/ui/DetailsDrawer'
import PageHeader from '../../components/ui/PageHeader'
import FilterBar from '../../components/ui/FilterBar'
import Modal from '../../components/ui/Modal'
import InputField from '../../components/ui/InputField'
import { StatusBadge, GLUCOSE_STATUS, classifyGlucose } from '../../constants/status'
import { getAllGlucose, deleteGlucose, createGlucose, getAllPatients } from '../../api/admin'

const PAGE_SIZE = 10

const STATUS_FILTERS = [
  { value: 'ALL', label: 'All' },
  ...Object.entries(GLUCOSE_STATUS).map(([k, v]) => ({ value: k, label: v.label })),
]

const COLUMNS = [
  {
    label: 'Patient', key: 'patient',
    render: (val) => (
      <div>
        <p className="m-0 text-sm font-semibold text-[#1E293B]">{val?.user?.username ?? '—'}</p>
        <p className="m-0 text-xs text-[#64748B]">{val?.diabetesType}</p>
      </div>
    ),
  },
  {
    label: 'Glucose', key: 'value',
    render: (val) => (
      <span className="font-mono font-bold text-[#1E293B]">
        {val} <span className="text-xs font-normal text-[#64748B]">mmol/L</span>
      </span>
    ),
  },
  { label: 'Status',      key: 'value',      render: (val) => <StatusBadge status={classifyGlucose(val)} map={GLUCOSE_STATUS} /> },
  { label: 'Context',     key: 'mealContext', render: (val) => val?.replace(/_/g, ' ') },
  { label: 'Recorded At', key: 'recordedAt',  render: (val) => val?.replace('T', ' ').slice(0, 16) },
]

const EMPTY_FORM = {
  patientId: '', value: '', unit: 'MMOL_L',
  mealContext: 'FASTING', recordedAt: '', notes: '',
}

export default function GlucoseLog() {
  const [readings,     setReadings]     = useState([])
  const [patients,     setPatients]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page,         setPage]         = useState(1)
  const [selected,     setSelected]     = useState(null)
  const [drawerOpen,   setDrawerOpen]   = useState(false)
  const [modalOpen,    setModalOpen]    = useState(false)
  const [form,         setForm]         = useState(EMPTY_FORM)
  const [saving,       setSaving]       = useState(false)
  const [errors,       setErrors]       = useState({})

  const load = () => {
    setLoading(true)
    Promise.all([getAllGlucose(), getAllPatients()])
      .then(([g, p]) => { setReadings(g.data); setPatients(p.data) })
      .catch(() => toast.error('Failed to load glucose readings'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = readings.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = r.patient?.user?.username?.toLowerCase().includes(q) ||
                        r.mealContext?.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'ALL' || classifyGlucose(r.value) === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const rows       = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  useEffect(() => { setPage(1) }, [search, statusFilter])

  const remove = async (id) => {
    if (!window.confirm('Delete this reading?')) return
    try {
      await deleteGlucose(id)
      setReadings(p => p.filter(r => r.id !== id))
      toast.success('Reading deleted')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to delete')
    }
  }

  const validate = () => {
    const e = {}
    if (!form.patientId)           e.patientId   = 'Select a patient'
    if (!form.value || isNaN(Number(form.value))) e.value = 'Valid glucose value required'
    if (!form.mealContext)         e.mealContext  = 'Select a context'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await createGlucose({
        patientId:   Number(form.patientId),
        value:       Number(form.value),
        unit:        form.unit,
        mealContext: form.mealContext,
        recordedAt:  form.recordedAt || undefined,
        notes:       form.notes || undefined,
      })
      toast.success('Glucose reading logged')
      setModalOpen(false)
      setForm(EMPTY_FORM)
      setErrors({})
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to log reading')
    } finally {
      setSaving(false)
    }
  }

  const sel = (key) => ({
    value: form[key],
    onChange: (e) => setForm(f => ({ ...f, [key]: e.target.value })),
  })

  const selectClass = "w-full px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] rounded-lg outline-none focus:border-[#0A4174]"

  const rowActions = (row) => [
    { label: 'View Details', icon: <Eye size={14} />,    onClick: () => { setSelected(row); setDrawerOpen(true) } },
    { label: 'Delete',       icon: <Trash2 size={14} />, onClick: () => remove(row.id), danger: true },
  ]

  return (
    <div>
      <PageHeader
        title="Glucose Log"
        subtitle={`${filtered.length} readings across all patients`}
        actions={
          <button onClick={() => { setForm(EMPTY_FORM); setErrors({}); setModalOpen(true) }}
            className="flex items-center gap-2 px-4 cursor-pointer border-0 text-white text-sm font-semibold rounded-xl transition"
            style={{ height: 'var(--btn-h-sm)', backgroundColor: 'var(--color-primary-900)' }}>
            <Plus size={15} /> Log Reading
          </button>
        }
      />

      <FilterBar
        search={search} onSearch={setSearch}
        placeholder="Search by patient or context..."
        filters={STATUS_FILTERS} activeFilter={statusFilter} onFilter={setStatusFilter}
      />

      <DataTable
        columns={COLUMNS}
        rows={rows.map(r => ({ ...r, _onClick: () => { setSelected(r); setDrawerOpen(true) } }))}
        emptyMsg={loading ? 'Loading...' : 'No readings found'}
        page={page} totalPages={totalPages} totalElements={filtered.length}
        pageSize={PAGE_SIZE} onPageChange={setPage}
        rowActions={rowActions}
      />

      {/* Log Reading Modal */}
      <Modal
        open={modalOpen} onClose={() => setModalOpen(false)}
        title="Log Glucose Reading"
        subtitle="Record a blood glucose reading for a patient"
        footer={
          <>
            <button onClick={() => setModalOpen(false)}
              className="px-4 text-sm font-medium text-[#64748B] bg-transparent border border-[#E2E8F0] rounded-xl cursor-pointer"
              style={{ height: 'var(--btn-h-sm)' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-5 text-sm font-semibold text-white rounded-xl border-0 cursor-pointer disabled:opacity-60"
              style={{ height: 'var(--btn-h-sm)', backgroundColor: 'var(--color-primary-900)' }}>
              {saving ? 'Saving...' : 'Log Reading'}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-[#1E293B]">Patient</label>
          <select {...sel('patientId')} className={selectClass} style={{ height: 'var(--input-h-desktop)' }}>
            <option value="">Select patient...</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.user?.username} — {p.diabetesType}</option>
            ))}
          </select>
          {errors.patientId && <p className="text-xs text-[#DC2626]">{errors.patientId}</p>}
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <InputField
              label="Glucose Value"
              placeholder="e.g. 7.4"
              type="number"
              value={form.value}
              onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              error={errors.value}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-[#1E293B] block mb-1.5">Unit</label>
            <select {...sel('unit')} className={selectClass} style={{ height: 'var(--input-h-desktop)' }}>
              <option value="MMOL_L">mmol/L</option>
              <option value="MG_DL">mg/dL</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-[#1E293B]">Meal Context</label>
          <select {...sel('mealContext')} className={selectClass} style={{ height: 'var(--input-h-desktop)' }}>
            <option value="FASTING">Fasting</option>
            <option value="BEFORE_MEAL">Before Meal</option>
            <option value="AFTER_MEAL">After Meal</option>
            <option value="BEDTIME">Bedtime</option>
            <option value="RANDOM">Random</option>
          </select>
          {errors.mealContext && <p className="text-xs text-[#DC2626]">{errors.mealContext}</p>}
        </div>

        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-[#1E293B]">Recorded At (optional)</label>
          <input type="datetime-local" {...sel('recordedAt')}
            className={selectClass} style={{ height: 'var(--input-h-desktop)' }} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#1E293B]">Notes (optional)</label>
          <textarea {...sel('notes')} placeholder="Any additional notes..." rows={2}
            className="px-3.5 py-2.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] rounded-lg outline-none focus:border-[#0A4174] resize-none w-full" />
        </div>
      </Modal>

      <DetailsDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={selected?.patient?.user?.username ?? 'Reading'}
        subtitle={`Glucose · ${selected?.recordedAt?.replace('T', ' ').slice(0, 16)}`}
        icon={<Activity size={18} color="#16A34A" />}
        profile={[
          { label: 'Value',   value: selected ? `${selected.value} mmol/L` : '—' },
          { label: 'Status',  value: selected ? <StatusBadge status={classifyGlucose(selected.value)} map={GLUCOSE_STATUS} /> : null },
          { label: 'Context', value: selected?.mealContext?.replace(/_/g, ' ') },
        ]}
        sections={[{ heading: 'Reading Details', rows: [
          { label: 'Value',        value: selected ? `${selected.value} ${selected.unit}` : '—' },
          { label: 'Meal Context', value: selected?.mealContext?.replace(/_/g, ' ') },
          { label: 'Recorded At',  value: selected?.recordedAt?.replace('T', ' ').slice(0, 16) },
          { label: 'Notes',        value: selected?.notes || '—' },
          { label: 'Patient',      value: selected?.patient?.user?.username },
          { label: 'Diabetes',     value: selected?.patient?.diabetesType },
        ]}]}
      />
    </div>
  )
}
