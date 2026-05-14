import { useState, useEffect } from 'react'
import { FlaskConical, Eye, Plus, Pencil } from 'lucide-react'
import { toast } from 'react-toastify'
import DataTable from '../../components/ui/DataTable'
import DetailsDrawer from '../../components/ui/DetailsDrawer'
import PageHeader from '../../components/ui/PageHeader'
import FilterBar from '../../components/ui/FilterBar'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import InputField from '../../components/ui/InputField'
import { deleteMetrics, getAllMetrics, recordMetrics, updateMetrics, updatePatientTargetHbA1c } from '../../api/doctorApi'
import { getMyPatients } from '../../api/doctorApi'

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
  { label: 'Target HbA1c', key: 'patient', render: (val) => val?.targetHbA1c ? `${val.targetHbA1c}%` : '—' },
  { label: 'HbA1c',       key: 'hba1c',      render: (val) => val ? `${val}%` : '—' },
  { label: 'Weight',      key: 'weight',      render: (val) => val ? `${val} kg` : '—' },
  { label: 'BMI',         key: 'bmi',         render: (val) => val ?? '—' },
  { label: 'Cholesterol', key: 'cholesterol', render: (val) => val ? `${val} mmol/L` : '—' },
  { label: 'Recorded',    key: 'recordedAt',  render: (val) => val?.replace('T', ' ').slice(0, 16) },
]

const EMPTY_FORM = {
  patientPublicId: '', weight: '', height: '', hba1c: '', targetHbA1c: '', cholesterol: '',
}

export default function DoctorLabResults() {
  const [metrics,     setMetrics]     = useState([])
  const [patients,    setPatients]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [hba1cFilter, setHba1cFilter] = useState('ALL')
  const [page,        setPage]        = useState(1)
  const [selected,    setSelected]    = useState(null)
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editingMetric, setEditingMetric] = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [form,        setForm]        = useState(EMPTY_FORM)
  const handle = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const handlePatient = (e) => {
    const patientPublicId = e.target.value
    const patient = patients.find(p => p.user?.publicId === patientPublicId)
    setForm(p => ({ ...p, patientPublicId, targetHbA1c: patient?.targetHbA1c ?? '' }))
  }

  const openAdd = () => {
    setEditingMetric(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (metric) => {
    setEditingMetric(metric)
    setForm({
      patientPublicId: metric.patient?.user?.publicId ?? '',
      weight: metric.weight ?? '',
      height: metric.height ?? '',
      hba1c: metric.hba1c ?? '',
      targetHbA1c: metric.patient?.targetHbA1c ?? '',
      cholesterol: metric.cholesterol ?? '',
    })
    setDrawerOpen(false)
    setModalOpen(true)
  }

  const load = () => {
    setLoading(true)
    Promise.all([getAllMetrics(), getMyPatients()])
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

  const submit = async () => {
    if (!form.patientPublicId) { toast.error('Select a patient'); return }
    const target = form.targetHbA1c ? parseFloat(form.targetHbA1c) : null
    if (target !== null && (target < 3 || target > 15)) {
      toast.error('Enter a realistic target HbA1c between 3 and 15')
      return
    }
    setSaving(true)
    try {
      const targetRes = await updatePatientTargetHbA1c(form.patientPublicId, target)
      const payload = {
        weight:                form.weight        ? parseFloat(form.weight)        : null,
        height:                form.height        ? parseFloat(form.height)        : null,
        hba1c:                 form.hba1c         ? parseFloat(form.hba1c)         : null,
        cholesterol:           form.cholesterol   ? parseFloat(form.cholesterol)   : null,
      }
      if (editingMetric) {
        try {
          await updateMetrics(editingMetric.id, payload)
        } catch (err) {
          const status = err.response?.status
          const message = String(err.response?.data?.message ?? err.response?.data?.error ?? '')
          const updateRouteMissing = status === 404 || status === 405 || message.includes('No static resource') || message.includes('not supported')
          if (!updateRouteMissing) throw err

          await deleteMetrics(editingMetric.id)
          await recordMetrics(form.patientPublicId, payload)
        }
      } else {
        await recordMetrics(form.patientPublicId, payload)
      }
      setPatients(prev => prev.map(patient =>
        patient.user?.publicId === form.patientPublicId ? targetRes.data : patient
      ))
      toast.success(editingMetric ? 'Lab result updated' : 'Lab result and target HbA1c saved')
      setModalOpen(false)
      setEditingMetric(null)
      setForm(EMPTY_FORM)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const rowActions = (row) => [
    { label: 'View Details', icon: <Eye size={14} />, onClick: () => { setSelected(row); setDrawerOpen(true) } },
    { label: 'Edit Result', icon: <Pencil size={14} />, onClick: () => openEdit(row) },
  ]

  return (
    <div>
      <PageHeader
        title="Lab Results"
        subtitle={`${filtered.length} health metric records`}
        actions={<Button size="md" onClick={openAdd}><Plus size={15} /> Add Result</Button>}
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

      <DetailsDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={selected?.patient?.user?.username ?? 'Health Metrics'}
        subtitle={`Recorded ${selected?.recordedAt?.replace('T', ' ').slice(0, 16)}`}
        icon={<FlaskConical size={18} color="#0891B2" />}
        profile={[
          { label: 'Target', value: selected?.patient?.targetHbA1c ? `${selected.patient.targetHbA1c}%` : '—' },
          { label: 'HbA1c',  value: selected?.hba1c ? `${selected.hba1c}%` : '—' },
          { label: 'BMI',    value: selected?.bmi ?? '—' },
          { label: 'Weight', value: selected?.weight ? `${selected.weight} kg` : '—' },
        ]}
        sections={[{ heading: 'Full Record', rows: [
          { label: 'Patient',        value: selected?.patient?.user?.username },
          { label: 'Target HbA1c',   value: selected?.patient?.targetHbA1c ? `${selected.patient.targetHbA1c}%` : '—' },
          { label: 'HbA1c',          value: selected?.hba1c ? `${selected.hba1c}%` : '—' },
          { label: 'Weight',         value: selected?.weight ? `${selected.weight} kg` : '—' },
          { label: 'Height',         value: selected?.height ? `${selected.height} cm` : '—' },
          { label: 'BMI',            value: selected?.bmi ?? '—' },
          { label: 'Cholesterol',    value: selected?.cholesterol ? `${selected.cholesterol} mmol/L` : '—' },
          { label: 'Recorded At',    value: selected?.recordedAt?.replace('T', ' ').slice(0, 16) },
        ]}]}
      />

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingMetric(null) }}
        title={editingMetric ? 'Update Lab Result' : 'Add Lab Result'}
        subtitle={editingMetric ? 'Update health metrics and target HbA1c' : 'Record health metrics for a patient'}
        footer={<><Button variant="ghost" onClick={() => { setModalOpen(false); setEditingMetric(null) }}>Cancel</Button><Button onClick={submit} disabled={saving}>{saving ? 'Saving...' : editingMetric ? 'Update Result' : 'Save Result'}</Button></>}>
        <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-xs font-semibold text-[#1E293B]">Patient *</label>
            <select value={form.patientPublicId} onChange={handlePatient} disabled={!!editingMetric}
              style={{ height: 'var(--input-h-desktop)', borderRadius: 'var(--radius-md)' }}
              className="px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none focus:border-[#0A4174] w-full">
              <option value="">Select patient</option>
              {patients.map(p => (
                <option key={p.user?.publicId} value={p.user?.publicId}>
                  {p.user?.username}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <InputField label="Weight (kg)"   type="number" placeholder="e.g. 72"   value={form.weight}  onChange={handle('weight')} />
            <InputField label="Height (cm)"   type="number" placeholder="e.g. 170"  value={form.height}  onChange={handle('height')} />
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <InputField label="HbA1c (%)"     type="number" placeholder="e.g. 7.2"  value={form.hba1c}   onChange={handle('hba1c')} />
            <InputField label="Target HbA1c (%)" type="number" placeholder="e.g. 6.5" value={form.targetHbA1c} onChange={handle('targetHbA1c')} />
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <InputField label="Cholesterol (mmol/L)" type="number" placeholder="e.g. 4.5" value={form.cholesterol} onChange={handle('cholesterol')} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
