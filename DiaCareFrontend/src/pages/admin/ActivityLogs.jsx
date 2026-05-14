import { useEffect, useMemo, useState } from 'react'
import { FileText, Search } from 'lucide-react'
import { toast } from 'react-toastify'
import DataTable from '../../components/ui/DataTable'
import Button from '../../components/ui/Button'
import { getActivityLogs } from '../../api/admin'
import { downloadPdfReport } from '../../utils/pdfReport'

export default function ActivityLogs() {
  const [logs, setLogs] = useState([])
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('ALL')
  const [status, setStatus] = useState('ALL')
  const [date, setDate] = useState('')

  useEffect(() => {
    getActivityLogs().then(r => setLogs(r.data ?? [])).catch(() => setLogs([]))
  }, [])

  const filtered = useMemo(() => logs.filter(log => {
    const q = query.toLowerCase()
    const matchesQuery = !q || log.fullName?.toLowerCase().includes(q) || log.email?.toLowerCase().includes(q)
    const matchesRole = role === 'ALL' || log.role === role
    const matchesStatus = status === 'ALL' || log.loginStatus === status
    const matchesDate = !date || log.loginAt?.startsWith(date)
    return matchesQuery && matchesRole && matchesStatus && matchesDate
  }), [logs, query, role, status, date])

  const exportPdfReport = () => {
    downloadPdfReport(`diacare-activity-logs-${new Date().toISOString().slice(0, 10)}.pdf`, {
      title: 'DiaCare User Access Report',
      subtitle: 'This report shows who accessed the system, which portal they used, login results, device information, and recent activity.',
      summary: [
        { label: 'Total access records', value: logs.length },
        { label: 'Failed login attempts', value: failedCount },
        { label: 'Records in this report', value: filtered.length },
      ],
      filters: [
        query ? `Search: ${query}` : 'Search: All users',
        `Role: ${role === 'ALL' ? 'All roles' : role}`,
        `Status: ${status === 'ALL' ? 'All statuses' : status}`,
        `Date: ${date || 'All dates'}`,
      ],
      sections: [{
        title: 'Access Log Records',
        description: 'Failed login records should be reviewed first because they may show forgotten passwords or suspicious access attempts.',
        rows: filtered.map(log => {
          const login = splitDateTime(log.loginAt)
          const logout = splitDateTime(log.logoutAt)
          return {
            title: log.fullName || 'Unknown user',
            fields: [
              { label: 'Email', value: log.email },
              { label: 'Role', value: log.role },
              { label: 'Portal accessed', value: log.portalAccessed },
              { label: 'Login date and time', value: `${login.date || '-'} ${login.time || ''}` },
              { label: 'Logout date and time', value: `${logout.date || '-'} ${logout.time || ''}` },
              { label: 'Login status', value: log.loginStatus },
              { label: 'Device or browser', value: log.deviceOrBrowser },
              { label: 'Recent activity', value: log.recentActivity },
            ],
          }
        }),
      }],
    })
    toast.success('PDF report downloaded')
  }

  const failedCount = logs.filter(log => log.loginStatus === 'FAILED').length

  const columns = [
    { label: 'User', key: 'fullName', render: (_, row) => <div><p className="m-0 font-semibold text-[#1E293B]">{row.fullName}</p><p className="m-0 text-xs text-[#64748B]">{row.email}</p></div> },
    { label: 'Role', key: 'role' },
    { label: 'Portal', key: 'portalAccessed' },
    { label: 'Login', key: 'loginAt', render: value => formatDateTime(value) },
    { label: 'Status', key: 'loginStatus', render: value => <span className={`px-2 py-1 rounded-md text-xs font-semibold ${value === 'SUCCESS' ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-[#FFF1F0] text-[#DC2626]'}`}>{value}</span> },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] m-0">Activity Logs</h1>
          <p className="text-sm text-[#64748B] mt-1 m-0">Monitor portal access, failed logins, devices, and recent user activity.</p>
        </div>
        <Button onClick={exportPdfReport}><FileText size={16} /> Download PDF Report</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Summary label="Total access records" value={logs.length} />
        <Summary label="Failed login attempts" value={failedCount} danger />
        <Summary label="Visible after filters" value={filtered.length} />
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name or email" className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#E2E8F0] text-sm outline-none focus:border-[#0A4174]" />
        </div>
        <select value={role} onChange={e => setRole(e.target.value)} className="h-10 rounded-lg border border-[#E2E8F0] px-3 text-sm bg-white">
          <option value="ALL">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="DOCTOR">Doctor</option>
          <option value="PATIENT">Patient</option>
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="h-10 rounded-lg border border-[#E2E8F0] px-3 text-sm bg-white">
          <option value="ALL">All statuses</option>
          <option value="SUCCESS">Successful</option>
          <option value="FAILED">Failed</option>
        </select>
        <input value={date} onChange={e => setDate(e.target.value)} type="date" className="h-10 rounded-lg border border-[#E2E8F0] px-3 text-sm bg-white" />
      </div>

      <DataTable columns={columns} rows={filtered} total={filtered.length} emptyMsg="No activity logs found" />
    </div>
  )
}

function Summary({ label, value, danger }) {
  return <div className="bg-white border border-[#E2E8F0] rounded-xl p-4"><p className={`m-0 text-3xl font-bold ${danger ? 'text-[#DC2626]' : 'text-[#0A4174]'}`}>{value}</p><p className="m-0 text-sm text-[#64748B]">{label}</p></div>
}

function splitDateTime(value) {
  if (!value) return { date: '', time: '' }
  const date = new Date(value)
  return { date: date.toLocaleDateString(), time: date.toLocaleTimeString() }
}

function formatDateTime(value) {
  const dateTime = splitDateTime(value)
  return value ? `${dateTime.date} ${dateTime.time}` : '-'
}
