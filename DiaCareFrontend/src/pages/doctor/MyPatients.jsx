import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Eye, Activity, Calendar, Pill, Utensils, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'react-toastify'
import DataTable from '../../components/ui/DataTable'
import DetailsDrawer, { drawerPrimaryBtn, drawerOutlineBtn } from '../../components/ui/DetailsDrawer'
import PageHeader from '../../components/ui/PageHeader'
import FilterBar from '../../components/ui/FilterBar'
import { StatusBadge, GLUCOSE_STATUS, classifyGlucose } from '../../constants/status'
import { getMyPatients } from '../../api/doctorApi'

const PAGE_SIZE = 10

const TYPE_FILTERS = [
  { value: 'ALL',         label: 'All' },
  { value: 'TYPE_1',      label: 'Type 1' },
  { value: 'TYPE_2',      label: 'Type 2' },
  { value: 'GESTATIONAL', label: 'Gestational' },
]

const COLUMNS = [
  {
    label: 'Patient', key: 'user',
    render: (val, row) => (
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
  { label: 'Gender',        key: 'gender',       render: (val) => val ?? '—' },
  { label: 'Date of Birth', key: 'dateOfBirth',  render: (val) => val ?? '—' },
  { label: 'Target HbA1c',  key: 'targetHbA1c',  render: (val) => val ? `${val}%` : '—' },
]

export default function MyPatients() {
  const navigate = useNavigate()
  const [patients,    setPatients]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [typeFilter,  setTypeFilter]  = useState('ALL')
  const [page,        setPage]        = useState(1)
  const [selected,    setSelected]    = useState(null)
  const [drawerOpen,  setDrawerOpen]  = useState(false)

  useEffect(() => {
    getMyPatients()
      .then(r => setPatients(r.data))
      .catch(() => toast.error('Failed to load patients'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = patients.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = p.user?.username?.toLowerCase().includes(q) || p.user?.email?.toLowerCase().includes(q)
    const matchType   = typeFilter === 'ALL' || p.diabetesType === typeFilter
    return matchSearch && matchType
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const rows       = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  useEffect(() => { setPage(1) }, [search, typeFilter])

  const rowActions = (row) => [
    { label: 'View Profile',     icon: <Eye size={14} />,      onClick: () => { setSelected(row); setDrawerOpen(true) } },
    { label: 'Log Glucose',      icon: <Activity size={14} />, onClick: () => navigate('/doctor/glucose') },
    { label: 'Book Appointment', icon: <Calendar size={14} />, onClick: () => navigate('/doctor/appointments') },
    { label: 'Prescribe',        icon: <Pill size={14} />,     onClick: () => navigate('/doctor/patient-care') },
  ]

  return (
    <div>
      <PageHeader
        title="My Patients"
        subtitle={`${filtered.length} patients under your care`}
      />

      <FilterBar
        search={search} onSearch={setSearch}
        placeholder="Search by name or email..."
        filters={TYPE_FILTERS} activeFilter={typeFilter} onFilter={setTypeFilter}
      />

      <DataTable
        columns={COLUMNS}
        rows={rows.map(r => ({ ...r, _onClick: () => { setSelected(r); setDrawerOpen(true) } }))}
        emptyMsg={loading ? 'Loading...' : 'No patients found'}
        page={page} totalPages={totalPages} totalElements={filtered.length}
        pageSize={PAGE_SIZE} onPageChange={setPage}
        rowActions={rowActions}
      />

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
        ]}]}
        footer={
          <>
            <button style={drawerPrimaryBtn()} onClick={() => navigate('/doctor/glucose')}>
              <Activity size={13} /> Log Glucose
            </button>
            <button style={drawerOutlineBtn()} onClick={() => navigate('/doctor/appointments')}>
              <Calendar size={13} /> Book Appointment
            </button>
            <button style={drawerOutlineBtn()} onClick={() => navigate('/doctor/patient-care')}>
              <Pill size={13} /> Prescribe
            </button>
          </>
        }
      />
    </div>
  )
}
