import { useState, useEffect } from 'react'
import { Stethoscope, Eye, CheckCircle, Ban } from 'lucide-react'
import { toast } from 'react-toastify'
import DataTable from '../../components/ui/DataTable'
import DetailsDrawer, { drawerPrimaryBtn, drawerOutlineBtn } from '../../components/ui/DetailsDrawer'
import PageHeader from '../../components/ui/PageHeader'
import FilterBar from '../../components/ui/FilterBar'
import { StatusBadge, DOCTOR_STATUS } from '../../constants/status'
import { getAllDoctors, deactivateUser, activateUser } from '../../api/admin'

const PAGE_SIZE = 10

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

  const rowActions = (row) => {
    const isActive = row.user?.isActive !== false
    return [
      { label: 'View Details', icon: <Eye size={14} />, onClick: () => { setSelected(row); setDrawerOpen(true) } },
      isActive
        ? { label: 'Suspend', icon: <Ban size={14} />,         onClick: () => toggleActive(row, false), danger: true }
        : { label: 'Activate', icon: <CheckCircle size={14} />, onClick: () => toggleActive(row, true) },
    ]
  }

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
            {selected.user?.isActive !== false
              ? <button onClick={() => { toggleActive(selected, false); setDrawerOpen(false) }} style={drawerPrimaryBtn('#DC2626')}><Ban size={14} /> Suspend</button>
              : <button onClick={() => { toggleActive(selected, true);  setDrawerOpen(false) }} style={drawerPrimaryBtn('#16A34A')}><CheckCircle size={14} /> Activate</button>
            }
          </>
        )}
      />
    </div>
  )
}
