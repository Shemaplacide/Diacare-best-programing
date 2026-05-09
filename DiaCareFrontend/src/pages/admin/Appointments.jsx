import { useState, useEffect } from 'react'
import { Calendar, Eye, CheckCircle, XCircle, Trash2, Plus } from 'lucide-react'
import { toast } from 'react-toastify'
import DataTable from '../../components/ui/DataTable'
import DetailsDrawer, { drawerPrimaryBtn } from '../../components/ui/DetailsDrawer'
import PageHeader from '../../components/ui/PageHeader'
import FilterBar from '../../components/ui/FilterBar'
import Modal from '../../components/ui/Modal'
import InputField from '../../components/ui/InputField'
import { StatusBadge, APPOINTMENT_STATUS } from '../../constants/status'
import { getAllAppointments, createAppointment, deleteAppointment, updateApptStatus, getAllPatients, getAllDoctors } from '../../api/admin'

const PAGE_SIZE = 10

const STATUS_FILTERS = [
  { value: 'ALL', label: 'All' },
  ...Object.entries(APPOINTMENT_STATUS).map(([k, v]) => ({ value: k, label: v.label })),
]

const COLUMNS = [
  {
    label: 'Patient', key: 'patient',
    render: (val) => (
      <div>
        <p className="m-0 text-sm font-semibold text-[#1E293B]">{val?.user?.username ?? '—'}</p>
        <p className="m-0 text-xs text-[#64748B]">{val?.user?.email}</p>
      </div>
    ),
  },
  { label: 'Doctor',    key: 'doctor',  render: (val) => val?.user?.username ?? '—' },
  {
    label: 'Date & Time', key: 'appointmentDate',
    render: (val) => (
      <div>
        <p className="m-0 text-sm text-[#1E293B]">{val?.split('T')[0]}</p>
        <p className="m-0 text-xs text-[#64748B]">{val?.split('T')[1]?.slice(0, 5)}</p>
      </div>
    ),
  },
  { label: 'Notes',  key: 'notes',  render: (val) => val || '—' },
  { label: 'Status', key: 'status', render: (val) => <StatusBadge status={val} map={APPOINTMENT_STATUS} /> },
]

const EMPTY_FORM = { patientId: '', doctorId: '', appointmentDate: '', notes: '', status: 'CONFIRMED' }

export default function Appointments() {
  const [appts,        setAppts]        = useState([])
  const [patients,     setPatients]     = useState([])
  const [doctors,      setDoctors]      = useState([])
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
    Promise.all([getAllAppointments(), getAllPatients(), getAllDoctors()])
      .then(([a, p, d]) => { setAppts(a.data); setPatients(p.data); setDoctors(d.data) })
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = appts.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = a.patient?.user?.username?.toLowerCase().includes(q) ||
                        a.doctor?.user?.username?.toLowerCase().includes(q) ||
                        a.notes?.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'ALL' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const rows       = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  useEffect(() => { setPage(1) }, [search, statusFilter])

  const changeStatus = async (id, status) => {
    try {
      await updateApptStatus(id, status)
      setAppts(prev => prev.map(a => a.id === id ? { ...a, status } : a))
      if (selected?.id === id) setSelected(p => ({ ...p, status }))
      toast.success(`Appointment marked as ${APPOINTMENT_STATUS[status]?.label ?? status}`)
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to update status')
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this appointment?')) return
    try {
      await deleteAppointment(id)
      setAppts(p => p.filter(a => a.id !== id))
      toast.success('Appointment deleted')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to delete')
    }
  }

  const validate = () => {
    const e = {}
    if (!form.patientId)       e.patientId       = 'Select a patient'
    if (!form.doctorId)        e.doctorId        = 'Select a doctor'
    if (!form.appointmentDate) e.appointmentDate = 'Date & time is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await createAppointment({
        patientId: Number(form.patientId),
        doctorId:  Number(form.doctorId),
        appointmentDate: form.appointmentDate,
        notes: form.notes,
        status: form.status,
      })
      toast.success('Appointment scheduled')
      setModalOpen(false)
      setForm(EMPTY_FORM)
      setErrors({})
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to schedule appointment')
    } finally {
      setSaving(false)
    }
  }

  const rowActions = (row) => [
    { label: 'View Details', icon: <Eye size={14} />, onClick: () => { setSelected(row); setDrawerOpen(true) } },
    ...(row.status === 'PENDING' || row.status === 'CONFIRMED' ? [
      { label: 'Complete', icon: <CheckCircle size={14} />, onClick: () => changeStatus(row.id, 'COMPLETED') },
      { label: 'Cancel',   icon: <XCircle size={14} />,    onClick: () => changeStatus(row.id, 'CANCELLED'), danger: true },
    ] : []),
    { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => remove(row.id), danger: true },
  ]

  const selectClass = "w-full px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] rounded-lg outline-none focus:border-[#0A4174]"

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle={`${filtered.length} appointments total`}
        actions={
          <button onClick={() => { setForm(EMPTY_FORM); setErrors({}); setModalOpen(true) }}
            className="flex items-center gap-2 px-4 cursor-pointer border-0 text-white text-sm font-semibold rounded-xl transition"
            style={{ height: 'var(--btn-h-sm)', backgroundColor: 'var(--color-primary-900)' }}>
            <Plus size={15} /> Schedule
          </button>
        }
      />

      <FilterBar
        search={search} onSearch={setSearch}
        placeholder="Search by patient, doctor or notes..."
        filters={STATUS_FILTERS} activeFilter={statusFilter} onFilter={setStatusFilter}
      />

      <DataTable
        columns={COLUMNS}
        rows={rows.map(r => ({ ...r, _onClick: () => { setSelected(r); setDrawerOpen(true) } }))}
        emptyMsg={loading ? 'Loading...' : 'No appointments found'}
        page={page} totalPages={totalPages} totalElements={filtered.length}
        pageSize={PAGE_SIZE} onPageChange={setPage}
        rowActions={rowActions}
      />

      {/* Schedule Modal */}
      <Modal
        open={modalOpen} onClose={() => setModalOpen(false)}
        title="Schedule Appointment"
        subtitle="Book an appointment between a patient and doctor"
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
              {saving ? 'Scheduling...' : 'Schedule'}
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
              <option key={p.id} value={p.id}>{p.user?.username} — {p.user?.email}</option>
            ))}
          </select>
          {errors.patientId && <p className="text-xs text-[#DC2626]">{errors.patientId}</p>}
        </div>

        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-[#1E293B]">Doctor</label>
          <select value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))}
            className={selectClass} style={{ height: 'var(--input-h-desktop)' }}>
            <option value="">Select doctor...</option>
            {doctors.map(d => (
              <option key={d.id} value={d.id}>Dr. {d.user?.username} — {d.specialization}</option>
            ))}
          </select>
          {errors.doctorId && <p className="text-xs text-[#DC2626]">{errors.doctorId}</p>}
        </div>

        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-[#1E293B]">Date & Time</label>
          <input type="datetime-local" value={form.appointmentDate}
            onChange={e => setForm(f => ({ ...f, appointmentDate: e.target.value }))}
            className={selectClass} style={{ height: 'var(--input-h-desktop)' }} />
          {errors.appointmentDate && <p className="text-xs text-[#DC2626]">{errors.appointmentDate}</p>}
        </div>

        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-[#1E293B]">Status</label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            className={selectClass} style={{ height: 'var(--input-h-desktop)' }}>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#1E293B]">Notes (optional)</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="e.g. Quarterly HbA1c review"
            rows={3}
            className="px-3.5 py-2.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] rounded-lg outline-none focus:border-[#0A4174] resize-none w-full" />
        </div>
      </Modal>

      {/* Details Drawer */}
      <DetailsDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={selected?.patient?.user?.username ?? 'Appointment'}
        subtitle={`${selected?.appointmentDate?.replace('T', ' ').slice(0, 16)}`}
        icon={<Calendar size={18} color="#0A4174" />}
        profile={[
          { label: 'Date',   value: selected?.appointmentDate?.split('T')[0] },
          { label: 'Time',   value: selected?.appointmentDate?.split('T')[1]?.slice(0, 5) },
          { label: 'Status', value: selected ? <StatusBadge status={selected.status} map={APPOINTMENT_STATUS} /> : null },
        ]}
        sections={[{ heading: 'Details', rows: [
          { label: 'Patient', value: selected?.patient?.user?.username },
          { label: 'Doctor',  value: selected?.doctor?.user?.username },
          { label: 'Notes',   value: selected?.notes || '—' },
          { label: 'Status',  value: selected ? <StatusBadge status={selected.status} map={APPOINTMENT_STATUS} /> : null },
        ]}]}
        footer={selected && (selected.status === 'PENDING' || selected.status === 'CONFIRMED') && (
          <>
            <button onClick={() => { changeStatus(selected.id, 'COMPLETED'); setDrawerOpen(false) }} style={drawerPrimaryBtn('#16A34A')}><CheckCircle size={14} /> Complete</button>
            <button onClick={() => { changeStatus(selected.id, 'CANCELLED'); setDrawerOpen(false) }} style={drawerPrimaryBtn('#DC2626')}><XCircle size={14} /> Cancel</button>
          </>
        )}
      />
    </div>
  )
}
