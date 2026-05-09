import { useState, useEffect } from 'react'
import { FlaskConical, Eye } from 'lucide-react'
import { toast } from 'react-toastify'
import DetailsDrawer from '../../components/ui/DetailsDrawer'
import PageHeader from '../../components/ui/PageHeader'
import { getMyLabResults } from '../../api/lab'

export default function PatientLabResults() {
  const [metrics,    setMetrics]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [selected,   setSelected]   = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    getMyLabResults()
      .then(r => setMetrics(r.data))
      .catch(() => toast.error('Failed to load lab results'))
      .finally(() => setLoading(false))
  }, [])

  const hba1cStatus = (val) => {
    if (!val) return { label: 'N/A', color: '#94A3B8', bg: '#F1F5F9' }
    if (val < 5.7)  return { label: 'Normal',   color: '#16A34A', bg: '#F0FDF4' }
    if (val < 6.5)  return { label: 'Elevated', color: '#D97706', bg: '#FFFBEB' }
    return              { label: 'High',     color: '#DC2626', bg: '#FFF1F0' }
  }

  return (
    <div>
      <PageHeader title="Lab Results" subtitle={`${metrics.length} records`} />

      {loading && <p className="text-sm text-[#94A3B8] text-center py-8">Loading...</p>}

      {!loading && metrics.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 flex flex-col items-center gap-3 mt-4">
          <FlaskConical size={36} className="text-[#CBD5E1]" />
          <p className="m-0 text-sm text-[#64748B]">No lab results recorded yet</p>
        </div>
      )}

      <div className="flex flex-col gap-3 mt-4">
        {metrics.map(m => {
          const s = hba1cStatus(m.hba1c)
          return (
            <div key={m.id} onClick={() => { setSelected(m); setDrawerOpen(true) }}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-4 flex items-center gap-4 cursor-pointer hover:bg-[#F8FAFB] transition">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
                <FlaskConical size={18} style={{ color: s.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  {m.hba1c && <span className="text-sm font-bold text-[#1E293B]">HbA1c: <span className="font-mono">{m.hba1c}%</span></span>}
                  {m.weight && <span className="text-sm text-[#64748B]">Weight: {m.weight} kg</span>}
                  {m.bmi && <span className="text-sm text-[#64748B]">BMI: {m.bmi}</span>}
                  {m.cholesterol && <span className="text-sm text-[#64748B]">Cholesterol: {m.cholesterol} mmol/L</span>}
                </div>
                <p className="m-0 text-xs text-[#94A3B8] mt-0.5">{m.recordedAt?.replace('T', ' ').slice(0, 16)}</p>
              </div>
              {m.hba1c && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: s.color, backgroundColor: s.bg }}>
                  {s.label}
                </span>
              )}
              <Eye size={16} className="text-[#94A3B8] shrink-0" />
            </div>
          )
        })}
      </div>

      <DetailsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
        title="Health Metrics" subtitle={`Recorded ${selected?.recordedAt?.replace('T', ' ').slice(0, 16)}`}
        icon={<FlaskConical size={18} color="#0891B2" />}
        profile={[
          { label: 'HbA1c',  value: selected?.hba1c ? `${selected.hba1c}%` : '—' },
          { label: 'BMI',    value: selected?.bmi ?? '—' },
          { label: 'Weight', value: selected?.weight ? `${selected.weight} kg` : '—' },
        ]}
        sections={[{ heading: 'Full Record', rows: [
          { label: 'HbA1c',              value: selected?.hba1c ? `${selected.hba1c}%` : '—' },
          { label: 'Weight',             value: selected?.weight ? `${selected.weight} kg` : '—' },
          { label: 'Height',             value: selected?.height ? `${selected.height} cm` : '—' },
          { label: 'BMI',                value: selected?.bmi ?? '—' },
          { label: 'Blood Pressure',     value: selected?.bloodPressureSystolic ? `${selected.bloodPressureSystolic}/${selected.bloodPressureDiastolic} mmHg` : '—' },
          { label: 'Cholesterol',        value: selected?.cholesterol ? `${selected.cholesterol} mmol/L` : '—' },
          { label: 'Recorded At',        value: selected?.recordedAt?.replace('T', ' ').slice(0, 16) },
        ]}]}
      />
    </div>
  )
}
