import { useState, useEffect } from 'react'
import { UsersRound, Eye, CheckCircle, Ban, Plus, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import DataTable from '../../components/ui/DataTable'
import DetailsDrawer, { drawerPrimaryBtn } from '../../components/ui/DetailsDrawer'
import PageHeader from '../../components/ui/PageHeader'
import FilterBar from '../../components/ui/FilterBar'
import Modal from '../../components/ui/Modal'
import InputField from '../../components/ui/InputField'
import { StatusBadge, DOCTOR_STATUS } from '../../constants/status'
import { getAllStaff, createStaff, deleteStaff, deactivateUser, activateUser } from '../../api/admin'

const PAGE_SIZE = 10

const ROLE_COLORS = {
  ADMIN:  { bg: '#F5F3FF', color: '#7C3AED' },
  DOCTOR: { bg: '#EFF6F8', color: '#0A4174' },
}

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

const EMPTY_FORM = { name: '', email: '', password: '', role: 'DOCTOR', specialization: '', licenseNumber: '', department: '' }

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

  const rowActions = (row) => {
    const isActive = row.isActive !== false
    return [
      { label: 'View Details', icon: <Eye size={14} />, onClick: () => { setSelected(row); setDrawerOpen(true) } },
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
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.role === 'DOCTOR' && !form.specialization.trim()) e.specialization = 'Specialization is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await createStaff(form)
      toast.success(`${form.role === 'ADMIN' ? 'Admin' : 'Doctor'} created successfully`)
      setModalOpen(false)
      setForm(EMPTY_FORM)
      setErrors({})
      load()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to create staff member')
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
          <button onClick={() => { setForm(EMPTY_FORM); setErrors({}); setModalOpen(true) }}
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

      {/* Add Staff Modal */}
      <Modal
        open={modalOpen} onClose={() => setModalOpen(false)}
        title="Add Staff Member"
        subtitle="Create a new doctor or admin account"
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
              {saving ? 'Creating...' : 'Create'}
            </button>
          </>
        }
      >
        <div className="flex gap-2 mb-4">
          {['DOCTOR', 'ADMIN'].map(r => (
            <button key={r} onClick={() => setForm(f => ({ ...f, role: r }))}
              className="flex-1 py-2 text-sm font-semibold rounded-xl border cursor-pointer transition"
              style={{
                backgroundColor: form.role === r ? 'var(--color-primary-900)' : 'transparent',
                color: form.role === r ? '#fff' : 'var(--color-text-muted)',
                borderColor: form.role === r ? 'var(--color-primary-900)' : 'var(--color-border)',
              }}>
              {r}
            </button>
          ))}
        </div>

        <InputField label="Full Name"  placeholder="Dr. John Doe" {...field('name')} />
        <InputField label="Email"      placeholder="john@diacare.com" type="email" {...field('email')} />
        <InputField label="Password"   placeholder="Min. 6 characters" type="password" {...field('password')} />

        {form.role === 'DOCTOR' && (
          <>
            <InputField label="Specialization" placeholder="e.g. Endocrinology" {...field('specialization')} />
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
            {selected.isActive !== false
              ? <button onClick={() => { toggleActive(selected, false); setDrawerOpen(false) }} style={drawerPrimaryBtn('#DC2626')}><Ban size={14} /> Suspend</button>
              : <button onClick={() => { toggleActive(selected, true);  setDrawerOpen(false) }} style={drawerPrimaryBtn('#16A34A')}><CheckCircle size={14} /> Activate</button>
            }
          </>
        )}
      />
    </div>
  )
}
