import { useState, useEffect } from 'react'
import { UsersRound, Eye, CheckCircle, Ban, Plus, Trash2, Pencil } from 'lucide-react'
import { toast } from 'react-toastify'
import DataTable from '../../components/ui/DataTable'
import DetailsDrawer, { drawerPrimaryBtn, drawerOutlineBtn } from '../../components/ui/DetailsDrawer'
import PageHeader from '../../components/ui/PageHeader'
import FilterBar from '../../components/ui/FilterBar'
import Modal from '../../components/ui/Modal'
import InputField from '../../components/ui/InputField'
import { StatusBadge, DOCTOR_STATUS } from '../../constants/status'
import { getAllStaff, createStaff, updateStaff, deleteStaff, deactivateUser, activateUser } from '../../api/admin'

const PAGE_SIZE = 10

const ROLE_COLORS = {
  ADMIN:  { bg: '#F5F3FF', color: '#7C3AED' },
  DOCTOR: { bg: '#EFF6F8', color: '#0A4174' },
}

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

const COLUMNS = [
  {
    label: 'Staff Member', key: 'username',
    render: (val, row) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{ backgroundColor: ROLE_COLORS[row.role]?.bg ?? '#F1F5F9', color: ROLE_COLORS[row.role]?.color ?? '#64748B' }}>
          {val?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="m-0 text-sm font-semibold text-[#1E293B]">{val}</p>
          <p className="m-0 text-xs text-[#64748B]">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    label: 'Role', key: 'role',
    render: (val) => (
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ backgroundColor: ROLE_COLORS[val]?.bg ?? '#F1F5F9', color: ROLE_COLORS[val]?.color ?? '#64748B' }}>
        {val}
      </span>
    ),
  },
  { label: 'Email', key: 'email' },
  { label: 'Joined', key: 'createdAt', render: (val) => val?.slice(0, 10) ?? '—' },
  {
    label: 'Status', key: 'isActive',
    render: (val) => <StatusBadge status={val !== false ? 'APPROVED' : 'SUSPENDED'} map={DOCTOR_STATUS} />,
  },
]

const EMPTY_FORM = { name: '', email: '', password: '', confirmPassword: '', role: 'DOCTOR', specialization: '', licenseNumber: '', department: '' }

export default function Staff() {
  const [staff,      setStaff]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [page,       setPage]       = useState(1)
  const [selected,   setSelected]   = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [modalOpen,  setModalOpen]  = useState(false)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [saving,     setSaving]     = useState(false)
  const [errors,     setErrors]     = useState({})
  const [editing,    setEditing]    = useState(null)

  const load = () => {
    setLoading(true)
    getAllStaff()
      .then(r => setStaff(r.data))
      .catch(() => toast.error('Failed to load staff'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const roleFilters = [
    { value: 'ALL',    label: 'All' },
    { value: 'DOCTOR', label: 'Doctors' },
    { value: 'ADMIN',  label: 'Admins' },
  ]

  const filtered = staff.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = s.username?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)
    const matchRole   = roleFilter === 'ALL' || s.role === roleFilter
    return matchSearch && matchRole
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const rows       = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  useEffect(() => { setPage(1) }, [search, roleFilter])

  const toggleActive = async (member, activate) => {
    try {
      if (activate) await activateUser(member.publicId)
      else          await deactivateUser(member.publicId)
      toast.success(`${member.username} ${activate ? 'activated' : 'suspended'}`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Action failed')
    }
  }

  const remove = async (member) => {
    if (!window.confirm(`Delete ${member.username}? This cannot be undone.`)) return
    try {
      await deleteStaff(member.publicId)
      setStaff(s => s.filter(x => x.publicId !== member.publicId))
      toast.success('Staff member deleted')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to delete')
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (member) => {
    setEditing(member)
    setForm({
      name: member.username ?? '',
      email: member.email ?? '',
      password: '',
      confirmPassword: '',
      role: member.role ?? 'DOCTOR',
      specialization: '',
      licenseNumber: '',
      department: '',
    })
    setErrors({})
    setModalOpen(true)
  }

  const rowActions = (row) => {
    const isActive = row.isActive !== false
    return [
      { label: 'View Details', icon: <Eye size={14} />, onClick: () => { setSelected(row); setDrawerOpen(true) } },
      { label: 'Edit', icon: <Pencil size={14} />, onClick: () => openEdit(row) },
      isActive
        ? { label: 'Suspend',  icon: <Ban size={14} />,         onClick: () => toggleActive(row, false), danger: true }
        : { label: 'Activate', icon: <CheckCircle size={14} />, onClick: () => toggleActive(row, true) },
      { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => remove(row), danger: true },
    ]
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    if (!editing && (!form.password || form.password.length < 6)) e.password = 'Password must be at least 6 characters'
    if (editing && form.password && form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match'
    if (!editing && form.role === 'DOCTOR' && !form.specialization.trim()) e.specialization = 'Specialization is required'
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
        role: form.role,
        specialization: form.specialization,
        licenseNumber: form.licenseNumber.trim(),
        department: form.department.trim(),
      }
      if (form.password) payload.password = form.password
      if (editing) {
        await updateStaff(editing.publicId, payload)
        toast.success('Staff member updated')
      } else {
        await createStaff({ ...payload, password: form.password })
        toast.success(`${form.role === 'ADMIN' ? 'Admin' : 'Doctor'} created successfully`)
      }
      setModalOpen(false)
      setForm(EMPTY_FORM)
      setEditing(null)
      setErrors({})
      setDrawerOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? `Failed to ${editing ? 'update' : 'create'} staff member`)
    } finally {
      setSaving(false)
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm(f => ({ ...f, [key]: e.target.value })),
    error: errors[key],
  })

  return (
    <div>
      <PageHeader
        title="Staff"
        subtitle={`${filtered.length} staff members`}
        actions={
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 cursor-pointer border-0 text-white text-sm font-semibold rounded-xl transition"
            style={{ height: 'var(--btn-h-sm)', backgroundColor: 'var(--color-primary-900)' }}>
            <Plus size={15} /> Add Staff
          </button>
        }
      />

      <FilterBar
        search={search} onSearch={setSearch}
        placeholder="Search by name or email..."
        filters={roleFilters} activeFilter={roleFilter} onFilter={setRoleFilter}
      />

      <DataTable
        columns={COLUMNS}
        rows={rows.map(r => ({ ...r, _onClick: () => { setSelected(r); setDrawerOpen(true) } }))}
        emptyMsg={loading ? 'Loading...' : 'No staff found'}
        page={page} totalPages={totalPages} totalElements={filtered.length}
        pageSize={PAGE_SIZE} onPageChange={setPage}
        rowActions={rowActions}
      />

      <Modal
        open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Staff Member' : 'Add Staff Member'}
        subtitle={editing ? 'Update account details and role profile' : 'Create a new doctor or admin account'}
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
              {saving ? (editing ? 'Saving...' : 'Creating...') : (editing ? 'Save Changes' : 'Create')}
            </button>
          </>
        }
      >
        <div className="flex gap-2 mb-4">
          {['DOCTOR', 'ADMIN'].map(r => (
            <button key={r} onClick={() => !editing && setForm(f => ({ ...f, role: r }))}
              disabled={Boolean(editing)}
              className="flex-1 py-2 text-sm font-semibold rounded-xl border cursor-pointer transition"
              style={{
                backgroundColor: form.role === r ? 'var(--color-primary-900)' : 'transparent',
                color: form.role === r ? '#fff' : 'var(--color-text-muted)',
                borderColor: form.role === r ? 'var(--color-primary-900)' : 'var(--color-border)',
                opacity: editing && form.role !== r ? 0.55 : 1,
              }}>
              {r}
            </button>
          ))}
        </div>

        <InputField label="Full Name"  placeholder="Dr. John Doe" {...field('name')} />
        <InputField label="Email"      placeholder="john@diacare.com" type="email" {...field('email')} />
        <InputField label={editing ? 'New Password' : 'Password'} placeholder={editing ? 'Leave empty to keep current password' : 'Min. 6 characters'} type="password" {...field('password')} />
        <InputField label="Confirm Password" placeholder="Re-enter password" type="password" {...field('confirmPassword')} />

        {form.role === 'DOCTOR' && (
          <>
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
            <InputField label="License Number" placeholder="e.g. RW-MED-003"   {...field('licenseNumber')} />
          </>
        )}
        {form.role === 'ADMIN' && (
          <InputField label="Department" placeholder="e.g. Administration" {...field('department')} />
        )}
      </Modal>

      {/* Details Drawer */}
      <DetailsDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={selected?.username}
        subtitle={selected?.role}
        icon={<UsersRound size={18} color="#0A4174" />}
        profile={[
          { label: 'Email',  value: selected?.email },
          { label: 'Role',   value: selected?.role },
          { label: 'Status', value: selected ? <StatusBadge status={selected.isActive !== false ? 'APPROVED' : 'SUSPENDED'} map={DOCTOR_STATUS} /> : null },
        ]}
        sections={[{ heading: 'Account Info', rows: [
          { label: 'Email',   value: selected?.email },
          { label: 'Role',    value: selected?.role },
          { label: 'Joined',  value: selected?.createdAt?.slice(0, 10) },
          { label: 'Status',  value: selected ? <StatusBadge status={selected.isActive !== false ? 'APPROVED' : 'SUSPENDED'} map={DOCTOR_STATUS} /> : null },
        ]}]}
        footer={selected && (
          <>
            <button onClick={() => openEdit(selected)} style={drawerOutlineBtn()}><Pencil size={14} /> Edit</button>
            {selected.isActive !== false
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
