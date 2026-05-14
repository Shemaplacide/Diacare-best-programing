import { useState, useEffect } from 'react'
import { Stethoscope, Eye, CheckCircle, Ban, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import DataTable from '../../components/ui/DataTable'
import DetailsDrawer, { drawerPrimaryBtn, drawerOutlineBtn } from '../../components/ui/DetailsDrawer'
import PageHeader from '../../components/ui/PageHeader'
import FilterBar from '../../components/ui/FilterBar'
import Modal from '../../components/ui/Modal'
import InputField from '../../components/ui/InputField'
import { StatusBadge, DOCTOR_STATUS } from '../../constants/status'
import { getAllDoctors, updateDoctor, deleteDoctor, deactivateUser, activateUser } from '../../api/admin'

const PAGE_SIZE = 10

const DOCTOR_SPECIALIZATIONS = [
  'Endocrinology',
  'Diabetology',
  'Internal Medicine',
  'Family Medicine',
  'General Practice',
  'Nutrition and Diabetes Care',
  'Pediatric Endocrinology',
  'Cardiology',
  'Nephrology',
  'Ophthalmology',
  'Podiatry',
]

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  specialization: '',
  licenseNumber: '',
  yearsOfExperience: '',
}

const COLUMNS = [
  {
    label: 'Doctor', key: 'user',
    render: (val, row) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#001D39] text-white flex items-center justify-center text-xs font-bold shrink-0">
          {val?.username?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="m-0 text-sm font-semibold text-[#1E293B]">{val?.username}</p>
          <p className="m-0 text-xs text-[#64748B]">{row.specialization}</p>
        </div>
      </div>
    ),
  },
  { label: 'License',        key: 'licenseNumber', render: (val) => <span className="font-mono text-sm">{val}</span> },
  { label: 'Experience',     key: 'yearsOfExperience', render: (val) => val ? `${val} yrs` : '—' },
  { label: 'Email',          key: 'user', render: (val) => val?.email },
  {
    label: 'Status', key: 'user',
    render: (val) => {
      const status = val?.isActive === false ? 'SUSPENDED' : 'APPROVED'
      return <StatusBadge status={status} map={DOCTOR_STATUS} />
    },
  },
]

export default function Doctors() {
  const [doctors,      setDoctors]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [specFilter,   setSpecFilter]   = useState('ALL')
  const [page,         setPage]         = useState(1)
  const [selected,     setSelected]     = useState(null)
  const [drawerOpen,   setDrawerOpen]   = useState(false)
  const [modalOpen,    setModalOpen]    = useState(false)
  const [form,         setForm]         = useState(EMPTY_FORM)
  const [errors,       setErrors]       = useState({})
  const [saving,       setSaving]       = useState(false)

  const load = () => {
    setLoading(true)
    getAllDoctors()
      .then(r => setDoctors(r.data))
      .catch(() => toast.error('Failed to load doctors'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const specializations = ['ALL', ...new Set(doctors.map(d => d.specialization).filter(Boolean))]
  const specFilters = specializations.map(s => ({ value: s, label: s === 'ALL' ? 'All' : s }))

  const filtered = doctors.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = d.user?.username?.toLowerCase().includes(q) ||
                        d.specialization?.toLowerCase().includes(q) ||
                        d.licenseNumber?.toLowerCase().includes(q)
    const matchSpec = specFilter === 'ALL' || d.specialization === specFilter
    return matchSearch && matchSpec
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const rows       = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  useEffect(() => { setPage(1) }, [search, specFilter])

  const toggleActive = async (doctor, activate) => {
    try {
      if (activate) await activateUser(doctor.user.publicId)
      else          await deactivateUser(doctor.user.publicId)
      toast.success(`Doctor ${activate ? 'activated' : 'suspended'}`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Action failed')
    }
  }

  const openEdit = (doctor) => {
    setSelected(doctor)
    setForm({
      name: doctor.user?.username ?? '',
      email: doctor.user?.email ?? '',
      password: '',
      specialization: doctor.specialization ?? '',
      licenseNumber: doctor.licenseNumber ?? '',
      yearsOfExperience: doctor.yearsOfExperience ?? '',
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    if (!form.specialization.trim()) e.specialization = 'Specialization is required'
    if (!form.licenseNumber.trim()) e.licenseNumber = 'License number is required'
    if (form.password && form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.yearsOfExperience !== '' && Number(form.yearsOfExperience) < 0) {
      e.yearsOfExperience = 'Experience cannot be negative'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!selected || !validate()) return
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        specialization: form.specialization.trim(),
        licenseNumber: form.licenseNumber.trim(),
        yearsOfExperience: form.yearsOfExperience === '' ? null : Number(form.yearsOfExperience),
      }
      if (form.password) payload.password = form.password
      await updateDoctor(selected.user.publicId, payload)
      toast.success('Doctor profile updated')
      setModalOpen(false)
      setDrawerOpen(false)
      setForm(EMPTY_FORM)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to update doctor')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (doctor) => {
    if (!window.confirm(`Delete ${doctor.user?.username}? This will remove the doctor account and related doctor records.`)) return
    try {
      await deleteDoctor(doctor.user.publicId)
      setDoctors(list => list.filter(item => item.user?.publicId !== doctor.user?.publicId))
      setDrawerOpen(false)
      toast.success('Doctor deleted')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to delete doctor')
    }
  }

  const rowActions = (row) => {
    const isActive = row.user?.isActive !== false
    return [
      { label: 'View Details', icon: <Eye size={14} />, onClick: () => { setSelected(row); setDrawerOpen(true) } },
      { label: 'Edit', icon: <Pencil size={14} />, onClick: () => openEdit(row) },
      isActive
        ? { label: 'Suspend', icon: <Ban size={14} />,         onClick: () => toggleActive(row, false), danger: true }
        : { label: 'Activate', icon: <CheckCircle size={14} />, onClick: () => toggleActive(row, true) },
      { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => remove(row), danger: true },
    ]
  }

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm(f => ({ ...f, [key]: e.target.value })),
    error: errors[key],
  })

  return (
    <div>
      <PageHeader
        title="Doctors"
        subtitle={`${filtered.length} medical professionals registered`}
      />

      <FilterBar
        search={search} onSearch={setSearch}
        placeholder="Search by name, specialization or license..."
        filters={specFilters} activeFilter={specFilter} onFilter={setSpecFilter}
      />

      <DataTable
        columns={COLUMNS}
        rows={rows.map(r => ({ ...r, _onClick: () => { setSelected(r); setDrawerOpen(true) } }))}
        emptyMsg={loading ? 'Loading...' : 'No doctors found'}
        page={page} totalPages={totalPages} totalElements={filtered.length}
        pageSize={PAGE_SIZE} onPageChange={setPage}
        rowActions={rowActions}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Edit Doctor"
        subtitle="Update account and professional details"
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
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <InputField label="Full Name" placeholder="Dr. John Doe" {...field('name')} />
        <InputField label="Email" placeholder="john@diacare.com" type="email" {...field('email')} />
        <InputField label="New Password" placeholder="Leave empty to keep current password" type="password" {...field('password')} />

        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-[#1E293B]">Specialization</label>
          <select
            value={form.specialization}
            onChange={(e) => setForm(f => ({ ...f, specialization: e.target.value }))}
            style={{ height: 'var(--input-h-desktop)', borderRadius: 'var(--radius-md)' }}
            className={`px-3.5 border bg-white text-sm text-[#1E293B] font-[inherit] outline-none transition w-full
              ${errors.specialization
                ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#FFF1F0]'
                : 'border-[#E2E8F0] focus:border-[#0A4174] focus:ring-2 focus:ring-[#ECFEFF]'}`}
          >
            <option value="">Select specialization</option>
            {DOCTOR_SPECIALIZATIONS.map(specialization => (
              <option key={specialization} value={specialization}>{specialization}</option>
            ))}
          </select>
          {errors.specialization && <p className="text-xs text-[#DC2626] mt-0.5">{errors.specialization}</p>}
        </div>

        <InputField label="License Number" placeholder="e.g. RW-MED-003" {...field('licenseNumber')} />
        <InputField label="Years of Experience" placeholder="e.g. 5" type="number" {...field('yearsOfExperience')} />
      </Modal>

      <DetailsDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={selected?.user?.username}
        subtitle={selected?.specialization}
        icon={<Stethoscope size={18} color="#0A4174" />}
        profile={[
          { label: 'License',     value: selected?.licenseNumber },
          { label: 'Experience',  value: selected?.yearsOfExperience ? `${selected.yearsOfExperience} years` : '—' },
          { label: 'Status',      value: selected ? <StatusBadge status={selected.user?.isActive !== false ? 'APPROVED' : 'SUSPENDED'} map={DOCTOR_STATUS} /> : null },
        ]}
        sections={[{ heading: 'Professional Info', rows: [
          { label: 'Email',          value: selected?.user?.email },
          { label: 'Specialization', value: selected?.specialization },
          { label: 'License No.',    value: selected?.licenseNumber },
          { label: 'Experience',     value: selected?.yearsOfExperience ? `${selected.yearsOfExperience} years` : '—' },
          { label: 'Joined',         value: selected?.createdAt?.slice(0, 10) },
        ]}]}
        footer={selected && (
          <>
            <button onClick={() => openEdit(selected)} style={drawerOutlineBtn()}><Pencil size={14} /> Edit</button>
            {selected.user?.isActive !== false
              ? <button onClick={() => { toggleActive(selected, false); setDrawerOpen(false) }} style={drawerPrimaryBtn('#DC2626')}><Ban size={14} /> Suspend</button>
              : <button onClick={() => { toggleActive(selected, true);  setDrawerOpen(false) }} style={drawerPrimaryBtn('#16A34A')}><CheckCircle size={14} /> Activate</button>
            }
            <button onClick={() => remove(selected)} style={drawerPrimaryBtn('#991B1B')}><Trash2 size={14} /> Delete</button>
          </>
        )}
      />
    </div>
  )
}
