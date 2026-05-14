import { useState, useEffect } from 'react'
import { User, Eye, Trash2, Plus, Pencil } from 'lucide-react'
import { toast } from 'react-toastify'
import DataTable from '../../components/ui/DataTable'
import DetailsDrawer from '../../components/ui/DetailsDrawer'
import PageHeader from '../../components/ui/PageHeader'
import FilterBar from '../../components/ui/FilterBar'
import Modal from '../../components/ui/Modal'
import InputField from '../../components/ui/InputField'
import { getAllPatients, deletePatient, createPatient, updatePatient, getAllDoctors } from '../../api/admin'

const PAGE_SIZE = 10

const COLUMNS = [
  {
    label: 'Patient', key: 'user',
    render: (val) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#0A4174] text-white flex items-center justify-center text-xs font-bold shrink-0">
          {val?.username?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="m-0 text-sm font-semibold text-[#1E293B]">{val?.username}</p>
          <p className="m-0 text-xs text-[#64748B]">{val?.email}</p>
        </div>
      </div>
    ),
  },
  { label: 'Diabetes Type', key: 'diabetesType' },
  { label: 'Gender',        key: 'gender' },
  { label: 'Date of Birth', key: 'dateOfBirth' },
  { label: 'Target HbA1c',  key: 'targetHbA1c', render: (val) => val ? `${val}%` : '—' },
]

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
  diabetesType: '',
  gender: 'MALE',
  dateOfBirth: '',
  targetHbA1c: '',
  hasAllergies: 'NO',
  allergyDetails: '',
  preferredDoctorPublicId: '',
}

export default function Patients() {
  const [patients,   setPatients]   = useState([])
  const [doctors,    setDoctors]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [page,       setPage]       = useState(1)
  const [selected,   setSelected]   = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [modalOpen,  setModalOpen]  = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [saving,     setSaving]     = useState(false)
  const [errors,     setErrors]     = useState({})

  const load = () => {
    setLoading(true)
    getAllPatients()
      .then(r => setPatients(r.data))
      .catch(() => toast.error('Failed to load patients'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    getAllDoctors().then(r => setDoctors(r.data ?? [])).catch(() => setDoctors([]))
  }, [])

  const typeFilters = [
    { value: 'ALL',         label: 'All' },
    { value: 'TYPE_1',      label: 'Type 1' },
    { value: 'TYPE_2',      label: 'Type 2' },
    { value: 'GESTATIONAL', label: 'Gestational' },
  ]

  const filtered = patients.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = p.user?.username?.toLowerCase().includes(q) || p.user?.email?.toLowerCase().includes(q)
    const matchType   = typeFilter === 'ALL' || p.diabetesType === typeFilter
    return matchSearch && matchType
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const rows       = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  useEffect(() => { setPage(1) }, [search, typeFilter])

  const remove = async (id) => {
    if (!window.confirm('Delete this patient? This cannot be undone.')) return
    try {
      await deletePatient(id)
      setPatients(p => p.filter(x => x.id !== id))
      toast.success('Patient deleted')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to delete patient')
    }
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    if (!editing && (!form.password || form.password.length < 6)) e.password = 'Password must be at least 6 characters'
    if (editing && form.password && form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.password || form.confirmPassword) {
      if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match'
    }
    if (!form.phoneNumber.trim()) e.phoneNumber = 'Telephone number is required'
    if (!form.diabetesType) e.diabetesType = 'Diabetes type is required'
    if (!form.dateOfBirth) e.dateOfBirth = 'Date of birth is required'
    if (!form.preferredDoctorPublicId) e.preferredDoctorPublicId = 'Preferred doctor is required'
    if (form.hasAllergies === 'YES' && !form.allergyDetails.trim()) e.allergyDetails = 'Allergy details are required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: 'PATIENT',
        diabetesType: form.diabetesType,
        dateOfBirth: form.dateOfBirth,
        phoneNumber: form.phoneNumber.trim(),
        gender: form.gender,
        targetHbA1c: form.targetHbA1c ? Number(form.targetHbA1c) : null,
        hasAllergies: form.hasAllergies === 'YES',
        allergyDetails: form.hasAllergies === 'YES' ? form.allergyDetails.trim() : '',
        preferredDoctorPublicId: form.preferredDoctorPublicId,
      }
      if (form.password) payload.password = form.password

      if (editing) {
        await updatePatient(editing.id, payload)
        toast.success('Patient updated successfully')
      } else {
        await createPatient(payload)
        toast.success('Patient created successfully')
      }
      setModalOpen(false)
      setEditing(null)
      setForm(EMPTY_FORM)
      setErrors({})
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to create patient')
    } finally {
      setSaving(false)
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm(f => ({ ...f, [key]: e.target.value })),
    error: errors[key],
  })

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (patient) => {
    setEditing(patient)
    setForm({
      name: patient.user?.username ?? '',
      email: patient.user?.email ?? '',
      password: '',
      confirmPassword: '',
      phoneNumber: patient.phoneNumber ?? '',
      diabetesType: patient.diabetesType ?? '',
      gender: patient.gender ?? 'MALE',
      dateOfBirth: patient.dateOfBirth ?? '',
      targetHbA1c: patient.targetHbA1c ?? '',
      hasAllergies: patient.hasAllergies ? 'YES' : 'NO',
      allergyDetails: patient.allergyDetails ?? '',
      preferredDoctorPublicId: patient.preferredDoctor?.user?.publicId ?? '',
    })
    setErrors({})
    setModalOpen(true)
  }

  const rowActions = (row) => [
    { label: 'View Details', icon: <Eye size={14} />,    onClick: () => { setSelected(row); setDrawerOpen(true) } },
    { label: 'Edit',         icon: <Pencil size={14} />, onClick: () => openEdit(row) },
    { label: 'Delete',       icon: <Trash2 size={14} />, onClick: () => remove(row.id), danger: true },
  ]

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle={`${filtered.length} patients registered`}
        actions={
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 cursor-pointer border-0 text-white text-sm font-semibold rounded-xl transition"
            style={{ height: 'var(--btn-h-sm)', backgroundColor: 'var(--color-primary-900)' }}>
            <Plus size={15} /> Add Patient
          </button>
        }
      />

      <FilterBar
        search={search} onSearch={setSearch}
        placeholder="Search by name or email..."
        filters={typeFilters} activeFilter={typeFilter} onFilter={setTypeFilter}
      />

      <DataTable
        columns={COLUMNS}
        rows={rows.map(r => ({ ...r, _onClick: () => { setSelected(r); setDrawerOpen(true) } }))}
        emptyMsg={loading ? 'Loading...' : 'No patients found'}
        page={page} totalPages={totalPages} totalElements={filtered.length}
        pageSize={PAGE_SIZE} onPageChange={setPage}
        rowActions={rowActions}
      />

      {/* Add/Edit Patient Modal */}
      <Modal
        open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }}
        title={editing ? 'Edit Patient' : 'Add Patient'}
        subtitle={editing ? 'Update patient account and health information' : 'Create a new patient account'}
        footer={
          <>
            <button onClick={() => { setModalOpen(false); setEditing(null) }}
              className="px-4 text-sm font-medium text-[#64748B] bg-transparent border border-[#E2E8F0] rounded-xl cursor-pointer"
              style={{ height: 'var(--btn-h-sm)' }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-5 text-sm font-semibold text-white rounded-xl border-0 cursor-pointer disabled:opacity-60"
              style={{ height: 'var(--btn-h-sm)', backgroundColor: 'var(--color-primary-900)' }}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Patient'}
            </button>
          </>
        }
      >
        <InputField label="Full Name" placeholder="Jean Baptiste" {...field('name')} />
        <InputField label="Email"     placeholder="jean@example.com" type="email" {...field('email')} />
        <InputField label={editing ? 'New Password (optional)' : 'Password'}  placeholder={editing ? 'Leave blank to keep current password' : 'Min. 6 characters'} type="password" {...field('password')} />
        <InputField label={editing ? 'Confirm New Password' : 'Confirm Password'} placeholder="Re-enter password" type="password" {...field('confirmPassword')} />
        <InputField label="Telephone Number" placeholder="+250 78 000 0000" type="tel" {...field('phoneNumber')} />

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-[#1E293B] block mb-1.5">Diabetes Type</label>
            <select value={form.diabetesType} onChange={e => setForm(f => ({ ...f, diabetesType: e.target.value }))}
              className={`w-full px-3.5 border bg-white text-sm text-[#1E293B] rounded-lg outline-none focus:border-[#0A4174] ${errors.diabetesType ? 'border-[#DC2626]' : 'border-[#E2E8F0]'}`}
              style={{ height: 'var(--input-h-desktop)' }}>
              <option value="">Select diabetes type</option>
              <option value="TYPE_1">Type 1</option>
              <option value="TYPE_2">Type 2</option>
              <option value="GESTATIONAL">Gestational</option>
              <option value="PREDIABETES">Prediabetes</option>
              <option value="Unknown">Unknown</option>
            </select>
            {errors.diabetesType && <p className="text-xs text-[#DC2626] mt-0.5">{errors.diabetesType}</p>}
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-[#1E293B] block mb-1.5">Gender</label>
            <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
              className="w-full px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] rounded-lg outline-none focus:border-[#0A4174]"
              style={{ height: 'var(--input-h-desktop)' }}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>
        </div>

        <InputField label="Date of Birth" type="date" {...field('dateOfBirth')} />
        <InputField label="Target HbA1c" placeholder="e.g. 7.0" type="number" step="0.1" {...field('targetHbA1c')} />

        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-[#1E293B]">Preferred Doctor</label>
          <select
            value={form.preferredDoctorPublicId}
            onChange={e => setForm(f => ({ ...f, preferredDoctorPublicId: e.target.value }))}
            className={`w-full px-3.5 border bg-white text-sm text-[#1E293B] rounded-lg outline-none focus:border-[#0A4174] ${errors.preferredDoctorPublicId ? 'border-[#DC2626]' : 'border-[#E2E8F0]'}`}
            style={{ height: 'var(--input-h-desktop)' }}
          >
            <option value="">{doctors.length === 0 ? 'No doctors available yet' : 'Select a doctor'}</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.user?.publicId}>
                Dr. {doctor.user?.username} - {doctor.specialization}
              </option>
            ))}
          </select>
          {errors.preferredDoctorPublicId && <p className="text-xs text-[#DC2626] mt-0.5">{errors.preferredDoctorPublicId}</p>}
        </div>

        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-[#1E293B]">Does the patient have allergies?</label>
          <select
            value={form.hasAllergies}
            onChange={e => setForm(f => ({ ...f, hasAllergies: e.target.value, allergyDetails: e.target.value === 'NO' ? '' : f.allergyDetails }))}
            className="w-full px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] rounded-lg outline-none focus:border-[#0A4174]"
            style={{ height: 'var(--input-h-desktop)' }}
          >
            <option value="NO">No</option>
            <option value="YES">Yes</option>
          </select>
        </div>

        {form.hasAllergies === 'YES' && (
          <InputField label="Allergy Details" placeholder="e.g. Penicillin, peanuts" {...field('allergyDetails')} />
        )}
      </Modal>

      <DetailsDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={selected?.user?.username}
        subtitle={`${selected?.diabetesType ?? '—'} Diabetes`}
        icon={<User size={18} color="#0A4174" />}
        profile={[
          { label: 'Email',        value: selected?.user?.email },
          { label: 'Target HbA1c', value: selected?.targetHbA1c ? `${selected.targetHbA1c}%` : '—' },
          { label: 'Gender',       value: selected?.gender ?? '—' },
        ]}
        sections={[{ heading: 'Health Profile', rows: [
          { label: 'Diabetes Type', value: selected?.diabetesType },
          { label: 'Date of Birth', value: selected?.dateOfBirth },
          { label: 'Gender',        value: selected?.gender },
          { label: 'Target HbA1c', value: selected?.targetHbA1c ? `${selected.targetHbA1c}%` : '—' },
          { label: 'Registered',   value: selected?.createdAt?.slice(0, 10) },
        ]}]}
      />
    </div>
  )
}
