import { useState, useEffect } from 'react'
import { Activity, Eye, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import DataTable from '../../components/ui/DataTable'
import DetailsDrawer from '../../components/ui/DetailsDrawer'
import PageHeader from '../../components/ui/PageHeader'
import FilterBar from '../../components/ui/FilterBar'
import { StatusBadge, GLUCOSE_STATUS, classifyGlucose } from '../../constants/status'
import { getAllGlucose } from '../../api/doctorApi'

const PAGE_SIZE = 10
const STATUS_FILTERS = [
  { value: 'ALL', label: 'All' },
  ...Object.entries(GLUCOSE_STATUS).map(([k, v]) => ({ value: k, label: v.label })),
]

const COLUMNS = [
  {
    label: 'Patient', key: 'patient',
    render: (val) => <span className="font-semibold text-[#1E293B]">{val?.user?.username ?? '—'}</span>,
  },
  {
    label: 'Glucose', key: 'value',
    render: (val) => <span className="font-mono font-bold text-[#1E293B]">{val} <span className="text-xs font-normal text-[#64748B]">mmol/L</span></span>,
  },
  { label: 'Status',      key: 'value',      render: (val) => <StatusBadge status={classifyGlucose(val)} map={GLUCOSE_STATUS} /> },
  { label: 'Context',     key: 'mealContext', render: (val) => val?.replace('_', ' ') },
  { label: 'Recorded At', key: 'recordedAt',  render: (val) => val?.replace('T', ' ').slice(0, 16) },
]

export default function DoctorGlucoseLog() {
  const [readings,     setReadings]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page,         setPage]         = useState(1)
  const [selected,     setSelected]     = useState(null)
  const [drawerOpen,   setDrawerOpen]   = useState(false)

  useEffect(() => {
    getAllGlucose()
      .then(r => setReadings(r.data))
      .catch(() => toast.error('Failed to load glucose readings'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = readings.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = r.patient?.user?.username?.toLowerCase().includes(q) || r.mealContext?.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'ALL' || classifyGlucose(r.value) === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const rows       = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  useEffect(() => { setPage(1) }, [search, statusFilter])

  const rowActions = (row) => [
    { label: 'View Details', icon: <Eye size={14} />, onClick: () => { setSelected(row); setDrawerOpen(true) } },
  ]

  return (
    <div>
      <PageHeader title="Glucose Log" subtitle={`${filtered.length} readings from your patients`} />

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

      <DetailsDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title={selected?.patient?.user?.username ?? 'Reading'}
        subtitle={`Glucose · ${selected?.recordedAt?.replace('T', ' ').slice(0, 16)}`}
        icon={<Activity size={18} color="#0A4174" />}
        profile={[
          { label: 'Value',   value: selected ? `${selected.value} mmol/L` : '—', color: selected ? GLUCOSE_STATUS[classifyGlucose(selected.value)]?.color : undefined },
          { label: 'Status',  value: selected ? <StatusBadge status={classifyGlucose(selected.value)} map={GLUCOSE_STATUS} /> : null },
          { label: 'Context', value: selected?.mealContext?.replace('_', ' ') },
        ]}
        sections={[{ heading: 'Reading Details', rows: [
          { label: 'Value',        value: selected ? `${selected.value} ${selected.unit}` : '—' },
          { label: 'Meal Context', value: selected?.mealContext?.replace('_', ' ') },
          { label: 'Recorded At',  value: selected?.recordedAt?.replace('T', ' ').slice(0, 16) },
          { label: 'Notes',        value: selected?.notes || '—' },
          { label: 'Patient',      value: selected?.patient?.user?.username },
          { label: 'Diabetes',     value: selected?.patient?.diabetesType },
        ]}]}
      />
    </div>
  )
}
