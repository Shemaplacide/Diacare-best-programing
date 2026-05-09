import { useState, useEffect } from 'react'
import { Utensils, ChevronDown, ChevronUp, Apple } from 'lucide-react'
import { toast } from 'react-toastify'
import { StatusBadge } from '../../constants/status'
import { getMyMealPlans } from '../../api/mealPlans'

const PLAN_STATUS = {
  ACTIVE:  { label: 'Active',  color: '#16A34A', bg: '#F0FDF4' },
  EXPIRED: { label: 'Expired', color: '#64748B', bg: '#F1F5F9' },
  DRAFT:   { label: 'Draft',   color: '#D97706', bg: '#FFFBEB' },
}

const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snacks: '🍎' }

export default function PatientMealPlans() {
  const [plans,    setPlans]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    getMyMealPlans()
      .then(r => {
        const withStatus = r.data.map(plan => {
          if (plan.status) return plan
          const now = new Date()
          const end = plan.endDate ? new Date(plan.endDate) : null
          return { ...plan, status: !end || end >= now ? 'ACTIVE' : 'EXPIRED' }
        })
        setPlans(withStatus)
        if (withStatus.length > 0) setExpanded(withStatus[0].id)
      })
      .catch(() => toast.error('Failed to load meal plans'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-5">

      <div>
        <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight m-0">My Meal Plans</h1>
        <p className="text-sm text-[#64748B] mt-1 m-0">Dietary plans prescribed by your doctor</p>
      </div>

      {loading && <p className="text-sm text-[#94A3B8] text-center py-8">Loading...</p>}

      {!loading && plans.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 flex flex-col items-center gap-3">
          <Apple size={36} className="text-[#CBD5E1]" />
          <p className="m-0 text-sm text-[#64748B]">No meal plans assigned yet</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {plans.map(plan => {
          const doctorName = plan.doctor?.user?.username ?? 'Your doctor'
          return (
            <div key={plan.id} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
              <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[#F8FAFB] transition"
                onClick={() => setExpanded(expanded === plan.id ? null : plan.id)}>
                <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center shrink-0">
                  <Utensils size={18} className="text-[#16A34A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-sm font-bold text-[#1E293B]">
                    {plan.diabetesType ? `${plan.diabetesType} Plan` : 'Meal Plan'}
                    {plan.calorieGoal && <span className="font-normal text-[#64748B]"> · {plan.calorieGoal}</span>}
                  </p>
                  <p className="m-0 text-xs text-[#94A3B8] mt-0.5">
                    By {doctorName} · {plan.startDate} → {plan.endDate ?? 'Ongoing'}
                  </p>
                </div>
                <StatusBadge status={plan.status} map={PLAN_STATUS} />
                {expanded === plan.id
                  ? <ChevronUp size={16} className="text-[#94A3B8] shrink-0" />
                  : <ChevronDown size={16} className="text-[#94A3B8] shrink-0" />}
              </div>

              {expanded === plan.id && (
                <div className="px-5 pb-5 border-t border-[#E2E8F0]">
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['breakfast', 'lunch', 'dinner', 'snacks'].map(meal => plan[meal] && (
                      <div key={meal} className="bg-[#F8FAFB] rounded-xl p-4">
                        <p className="m-0 text-xs font-bold text-[#64748B] uppercase tracking-wide mb-2">
                          {MEAL_ICONS[meal]} {meal.charAt(0).toUpperCase() + meal.slice(1)}
                        </p>
                        <p className="m-0 text-sm text-[#1E293B]">{plan[meal]}</p>
                      </div>
                    ))}
                  </div>
                  {plan.notes && (
                    <div className="mt-3 bg-[#FFFBEB] border border-[#D97706]/20 rounded-xl p-4">
                      <p className="m-0 text-xs font-bold text-[#D97706] mb-1">Doctor's Notes</p>
                      <p className="m-0 text-sm text-[#1E293B]">{plan.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
