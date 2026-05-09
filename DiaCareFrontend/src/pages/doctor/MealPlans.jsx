import { useState } from 'react'
import { Plus, Utensils, Search, ChevronDown, ChevronUp, Apple } from 'lucide-react'
import { toast } from 'react-toastify'
import Modal from '../../components/ui/Modal'
import InputField from '../../components/ui/InputField'
import Button from '../../components/ui/Button'
import { StatusBadge } from '../../constants/status'

const PLAN_STATUS = {
  ACTIVE:   { label: 'Active',   color: '#16A34A', bg: '#F0FDF4' },
  EXPIRED:  { label: 'Expired',  color: '#64748B', bg: '#F1F5F9' },
  DRAFT:    { label: 'Draft',    color: '#D97706', bg: '#FFFBEB' },
}

const DIABETES_TYPES = ['Type 1', 'Type 2', 'Gestational', 'Prediabetes']
const CALORIE_GOALS  = ['1200 kcal', '1500 kcal', '1800 kcal', '2000 kcal', '2200 kcal', '2500 kcal']

const MOCK_PLANS = [
  {
    id: 1, patient: 'Alice Mutoni', diabetesType: 'Type 2', calorieGoal: '1800 kcal',
    startDate: '2025-06-01', endDate: '2025-09-01', status: 'ACTIVE',
    breakfast: 'Oatmeal with berries, 1 boiled egg, black coffee (no sugar)',
    lunch:     'Grilled chicken breast, brown rice (½ cup), steamed broccoli, water',
    dinner:    'Baked fish, sweet potato (small), green salad with olive oil dressing',
    snacks:    'Handful of almonds, 1 apple, plain yogurt (low fat)',
    notes:     'Avoid white bread, sugary drinks, and processed foods. Eat every 3–4 hours.',
  },
  {
    id: 2, patient: 'Jean Habimana', diabetesType: 'Type 1', calorieGoal: '2000 kcal',
    startDate: '2025-05-15', endDate: '2025-08-15', status: 'ACTIVE',
    breakfast: 'Whole wheat toast, avocado, 2 eggs scrambled, green tea',
    lunch:     'Lentil soup, whole grain bread (1 slice), cucumber salad',
    dinner:    'Grilled beef (lean), ugali (small portion), kale stew',
    snacks:    'Carrot sticks with hummus, 1 orange',
    notes:     'Carb counting required. Target 45–60g carbs per meal.',
  },
  {
    id: 3, patient: 'Marie Uwase', diabetesType: 'Gestational', calorieGoal: '2200 kcal',
    startDate: '2025-04-01', endDate: '2025-07-01', status: 'EXPIRED',
    breakfast: 'Fortified cereal (low sugar), milk, banana',
    lunch:     'Bean stew, brown rice, tomato salad',
    dinner:    'Chicken stew, sweet potato, spinach',
    snacks:    'Milk, whole grain crackers, fruit',
    notes:     'Gestational diabetes plan. Avoid skipping meals.',
  },
  {
    id: 4, patient: 'Paul Kagame', diabetesType: 'Type 2', calorieGoal: '1500 kcal',
    startDate: '2025-07-01', endDate: '2025-10-01', status: 'ACTIVE',
    breakfast: 'Vegetable omelette (2 eggs), 1 slice whole wheat toast, water',
    lunch:     'Grilled tilapia, steamed vegetables, small portion of rice',
    dinner:    'Vegetable soup, 1 slice whole grain bread',
    snacks:    'Nuts (small handful), 1 pear',
    notes:     'Low carb focus. Limit fruit to 1 serving per day.',
  },
]

const EMPTY_FORM = {
  patient: '', diabetesType: '', calorieGoal: '',
  startDate: '', endDate: '',
  breakfast: '', lunch: '', dinner: '', snacks: '', notes: '',
}

export default function DoctorMealPlans() {
  const [plans,     setPlans]     = useState(MOCK_PLANS)
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [expanded,  setExpanded]  = useState(null)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const handle = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const filtered = plans.filter(p => {
    const matchSearch = p.patient.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'ALL' || p.status === filter
    return matchSearch && matchFilter
  })

  const submit = () => {
    if (!form.patient || !form.diabetesType || !form.calorieGoal || !form.startDate) {
      toast.error('Please fill in all required fields')
      return
    }
    const newPlan = { id: Date.now(), ...form, status: 'ACTIVE' }
    setPlans(p => [newPlan, ...p])
    toast.success(`Meal plan created for ${form.patient}`)
    setModalOpen(false)
    setForm(EMPTY_FORM)
  }

  const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snacks: '🍎' }

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight m-0">Meal Plans</h1>
          <p className="text-sm text-[#64748B] mt-1 m-0">{plans.filter(p => p.status === 'ACTIVE').length} active plans</p>
        </div>
        <Button onClick={() => { setForm(EMPTY_FORM); setModalOpen(true) }}>
          <Plus size={15} /> Create Plan
        </Button>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search patient..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-[#E2E8F0] rounded-xl bg-white outline-none focus:border-[#0A4174]"
          />
        </div>
        <div className="flex items-center bg-[#F1F5F9] rounded-xl p-1 gap-1">
          {['ALL', 'ACTIVE', 'EXPIRED', 'DRAFT'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition
                ${filter === f ? 'bg-white text-[#0A4174] shadow-sm' : 'bg-transparent text-[#64748B]'}`}>
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Plans list */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 flex flex-col items-center gap-3">
            <Apple size={36} className="text-[#CBD5E1]" />
            <p className="m-0 text-sm text-[#64748B]">No meal plans found</p>
          </div>
        )}
        {filtered.map(plan => (
          <div key={plan.id} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            {/* Row */}
            <div
              className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[#F8FAFB] transition"
              onClick={() => setExpanded(expanded === plan.id ? null : plan.id)}
            >
              <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center shrink-0">
                <Utensils size={18} className="text-[#16A34A]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="m-0 text-sm font-bold text-[#1E293B]">{plan.patient}</p>
                  <span className="text-xs text-[#94A3B8]">·</span>
                  <p className="m-0 text-sm text-[#64748B]">{plan.diabetesType} · {plan.calorieGoal}</p>
                </div>
                <p className="m-0 text-xs text-[#94A3B8] mt-0.5">{plan.startDate} → {plan.endDate || 'Ongoing'}</p>
              </div>
              <StatusBadge status={plan.status} map={PLAN_STATUS} />
              {expanded === plan.id
                ? <ChevronUp size={16} className="text-[#94A3B8] shrink-0" />
                : <ChevronDown size={16} className="text-[#94A3B8] shrink-0" />}
            </div>

            {/* Expanded meal details */}
            {expanded === plan.id && (
              <div className="px-5 pb-5 border-t border-[#E2E8F0]">
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['breakfast', 'lunch', 'dinner', 'snacks'].map(meal => (
                    plan[meal] && (
                      <div key={meal} className="bg-[#F8FAFB] rounded-xl p-3">
                        <p className="m-0 text-xs font-bold text-[#64748B] uppercase tracking-wide mb-1">
                          {MEAL_ICONS[meal]} {meal.charAt(0).toUpperCase() + meal.slice(1)}
                        </p>
                        <p className="m-0 text-sm text-[#1E293B]">{plan[meal]}</p>
                      </div>
                    )
                  ))}
                </div>
                {plan.notes && (
                  <div className="mt-3 bg-[#FFFBEB] border border-[#D97706]/20 rounded-xl p-3">
                    <p className="m-0 text-xs font-bold text-[#D97706] mb-1">Doctor's Notes</p>
                    <p className="m-0 text-sm text-[#1E293B]">{plan.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create plan modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Meal Plan"
        subtitle="Design a personalised meal plan for your patient"
        width={560}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={submit}><Utensils size={14} /> Save Plan</Button>
          </>
        }
      >
        <div className="flex flex-col gap-1">
          <InputField label="Patient Name *" placeholder="Alice Mutoni" value={form.patient} onChange={handle('patient')} />

          <div className="grid grid-cols-2 gap-x-4">
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs font-semibold text-[#1E293B]">Diabetes Type *</label>
              <select value={form.diabetesType} onChange={handle('diabetesType')}
                className="px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none focus:border-[#0A4174] w-full rounded-xl"
                style={{ height: 'var(--input-h-desktop)' }}>
                <option value="">Select type</option>
                {DIABETES_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs font-semibold text-[#1E293B]">Daily Calorie Goal *</label>
              <select value={form.calorieGoal} onChange={handle('calorieGoal')}
                className="px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none focus:border-[#0A4174] w-full rounded-xl"
                style={{ height: 'var(--input-h-desktop)' }}>
                <option value="">Select goal</option>
                {CALORIE_GOALS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4">
            <InputField label="Start Date *" type="date" value={form.startDate} onChange={handle('startDate')} />
            <InputField label="End Date"     type="date" value={form.endDate}   onChange={handle('endDate')} />
          </div>

          {['breakfast', 'lunch', 'dinner', 'snacks'].map(meal => (
            <div key={meal} className="flex flex-col gap-1.5 mb-3">
              <label className="text-xs font-semibold text-[#1E293B] capitalize">
                {MEAL_ICONS[meal]} {meal.charAt(0).toUpperCase() + meal.slice(1)}
              </label>
              <textarea
                value={form[meal]} onChange={handle(meal)}
                placeholder={`Describe ${meal} options...`}
                rows={2}
                className="px-3.5 py-2.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none focus:border-[#0A4174] w-full rounded-xl resize-none"
              />
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#1E293B]">Doctor's Notes</label>
            <textarea
              value={form.notes} onChange={handle('notes')}
              placeholder="Additional dietary instructions..."
              rows={2}
              className="px-3.5 py-2.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none focus:border-[#0A4174] w-full rounded-xl resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
