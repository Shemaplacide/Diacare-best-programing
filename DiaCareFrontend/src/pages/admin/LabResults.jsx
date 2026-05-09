import { useState, useEffect } from 'react'
import { FlaskConical, Eye, Plus, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import DataTable from '../../components/ui/DataTable'
import DetailsDrawer from '../../components/ui/DetailsDrawer'
import PageHeader from '../../components/ui/PageHeader'
import FilterBar from '../../components/ui/FilterBar'
import Modal from '../../components/ui/Modal'
import InputField from '../../components/ui/InputField'
import { getAllMetrics, createMetrics, getAllPatients } from '../../api/admin'

const PAGE_SIZE = 10

const hba1cStatus = (val) => {
  if (!val) return { label: 'N/A',      color: '#94A3B8', bg: '#F1F5F9' }
  if (val < 5.7) return { label: 'Normal',   color: '#16A34A', bg: '#F0FDF4' }
  if (val < 6.5) return { label: 'Elevated', color: '#D97706', bg: '#FFFBEB' }
  return             { label: 'High',     color: '#DC2626', bg: '#FFF1F0' }
}

const HBA1C_FILTERS = [
  { value: 'ALL',      label: 'All' },
  { value: 'Normal',   label: 'Normal' },
  { value: 'Elevated', label: 'Elevated' },
  { value: 'High',     label: 'High' },
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
    label: 'HbA1c', key: 'hba1c',
    render: (val) => {
      const s = hba1cStatus(val)
      return val ? (
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: s.bg, color: s.color }}>
          {val}% · {s.label}
        </span>
      ) : '—'
    },
  },
  { label: 'Weight',      key: 'weight',      render: (val) => val ? `${val} kg` : '—' },
  { label: 'BMI',         key: 'bmi',         render: (val) => val ?? '—' },
  { label: 'Cholesterol', key: 'cholesterol', render: (val) => val ? `${val} mmol/L` : '—' },
  { label: 'Recorded',    key: 'recordedAt',  render: (val) => val?.replace('T', ' ').slice(0, 16) },
]

const EMPTY_FORM = {
  patientId: '', weight: '', height: '', hba1c: '',
  systolic: '', diastolic: '', cholesterol: '', recordedAt: '',
}

export default function LabResults() {
  const [metrics,     setMetrics]     = useState([])
  const [patients,    setPatients]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [hba1cFilter, setHba1cFilter] = useState('ALL')
  const [page,        setPage]        = useState(1)
  const [selected,    setSelected]    = useState(null)
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const [modalOpen,   setModalOpen]   = useState(false)
  const [form,        setForm]        = useState(EMPTY_FORM)
  const [saving,      setSaving]      = useState(false)
  const [errors,      setErrors]      = useState({})

  const load = () => {
    setLoading(true)
    Promise.all([getAllMetrics(), getAllPatients()])
      .then(([m, p]) => { setMetrics(m.data); setPatients(p.data) })
      .catch(() => toast.error('Failed to load lab results'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = metrics.filter(m => {
    const q = search.toLowerCase()
    const matchSearch = m.patient?.user?.username?.toLowerCase().includes(q)
    const s = hba1cStatus(m.hba1c)
    const matchFilter = hba1cFilter === 'ALL' || s.label === hba1cFilter
    return matchSearch && matchFilter
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const rows       = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  useEffect(() => { setPage(1) }, [search, hba1cFilter])

  const validate = () => {
    const e = {}
    if (!form.patientId) e.patientId = 'Select a patient'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = { patientId: Number(form.patientId) }
      if (form.weight)      payload.weight      = Number(form.weight)
      if (form.height)      payload.height      = Number(form.height)
      if (form.hba1c)       payload.hba1c       = Number(form.hba1c)
      if (form.systolic)    payload.systolic    = Number(form.systolic)
      if (form.diastolic)   payload.diastolic   = Number(form.diastolic)
      if (form.cholesterol) payload.cholesterol = Number(form.cholesterol)
      if (form.recordedAt)  payload.recordedAt  = form.recordedAt
      await createMetrics(payload)
      toast.success('Lab result recorded')
      setModalOpen(false)
      setForm(EMPTY_FORM)
      setErrors({})
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to record lab result')
    } finally {
      setSaving(false)
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm(f => ({ ...f, [key]: e.target.value })),
    error: errors[key],
  })

  const selectClass = "w-full px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] rounded-lg outline-none focus:border-[#0A4174]"

  const rowActions = (row) => [
    { label: 'View Details', icon: <Eye size={14} />, onClick: () => { setSelected(row); setDrawerOpen(true) } },
  ]

  return (
    <div>
      <PageHeader
        title="Lab Results"
        subtitle={`${filtered.length} health metric records`}
        actions={
          <button onClick={() => { setForm(EMPTY_FORM); setErrors({}); setModalOpen(true) }}
            className="flex items-center gap-2 px-4 cursor-pointer border-0 text-white text-sm font-semibold rounded-xl transition"
            style={{ height: 'var(--btn-h-sm)', backgroundColor: 'var(--color-primary-900)' }}>
            <Plus size={15} /> Add Lab Result
          </button>
        }
      />

      <FilterBar
        search={search} onSearch={setSearch}
        placeholder="Search by patient name..."
        filters={HBA1C_FILTERS} activeFilter={hba1cFilter} onFilter={setHba1cFilter}
      />

      <DataTable
        columns={COLUMNS}
        rows={rows.map(r => ({ ...r, _onClick: () => { setSelected(r); setDrawerOpen(true) } }))}
        emptyMsg={loading ? 'Loading...' : 'No records found'}
        page={page} totalPages={totalPages} totalElements={filtered.length}
        pageSize={PAGE_SIZE} onPageChange={setPage}
        rowActions={rowActions}
      />

      {/* Add Lab Result Modal */}
      <Modal
        open={modalOpen} onClose={() => setModalOpen(false)}
        title="Add Lab Result"
        subtitle="Record health metrics for a patient"
        width={520}
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
              {saving ? 'Saving...' : 'Save Result'}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-[#1E293B]">Patient</label>
          <select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
            className={selectClass} style={{ height: 'var(--input-h-desktop)' }}>
            <option value="">Select patient...</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.user?.username} — {p.diabetesType}</option>
            ))}
          </select>
          {errors.patientId && <p className="text-xs text-[#DC2626]">{errors.patientId}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InputField label="HbA1c (%)"       placeholder="e.g. 7.2"  type="number" {...field('hba1c')} />
          <InputField label="Cholesterol (mmol/L)" placeholder="e.g. 4.5" type="number" {...field('cholesterol')} />
          <InputField label="Weight (kg)"      placeholder="e.g. 72"   type="number" {...field('weight')} />
          <InputField label="Height (cm)"      placeholder="e.g. 170"  type="number" {...field('height')} />
          <InputField label="BP Systolic"      placeholder="e.g. 120"  type="number" {...field('systolic')} />
          <InputField label="BP Diastolic"     placeholder="e.g. 80"   type="number" {...field('diastolic')} />
        </div>

        <div className="flex flex-col gap-1.5 mt-1">
          <label className="text-xs font-semibold text-[#1E293B]">Recorded At (optional)</label>
          <input type="datetime-local" value={form.recordedAt}
            onChange={e => setForm(f => ({ ...f, recordedAt: e.target.value }))}
            className={selectClass} style={{ height: 'var(--input-h-desktop)' }} />
        </div>
      </Modal>

      <DetailsDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={selected?.patient?.user?.username ?? 'Health Metrics'}
        subtitle={`Recorded ${selected?.recordedAt?.replace('T', ' ').slice(0, 16)}`}
        icon={<FlaskConical size={18} color="#0891B2" />}
        profile={[
          { label: 'HbA1c',  value: selected?.hba1c ? `${selected.hba1c}%` : '—' },
          { label: 'BMI',    value: selected?.bmi ?? '—' },
          { label: 'Weight', value: selected?.weight ? `${selected.weight} kg` : '—' },
        ]}
        sections={[{ heading: 'Full Record', rows: [
          { label: 'Patient',        value: selected?.patient?.user?.username },
          { label: 'HbA1c',          value: selected?.hba1c ? `${selected.hba1c}%` : '—' },
          { label: 'Weight',         value: selected?.weight ? `${selected.weight} kg` : '—' },
          { label: 'Height',         value: selected?.height ? `${selected.height} cm` : '—' },
          { label: 'BMI',            value: selected?.bmi ?? '—' },
          { label: 'Blood Pressure', value: selected?.bloodPressureSystolic ? `${selected.bloodPressureSystolic}/${selected.bloodPressureDiastolic} mmHg` : '—' },
          { label: 'Cholesterol',    value: selected?.cholesterol ? `${selected.cholesterol} mmol/L` : '—' },
          { label: 'Recorded At',    value: selected?.recordedAt?.replace('T', ' ').slice(0, 16) },
        ]}]}
      />
    </div>
  )
}
