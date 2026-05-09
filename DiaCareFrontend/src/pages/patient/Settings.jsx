import { useState, useEffect } from 'react'
import { User, Lock, Bell, ChevronRight, Camera } from 'lucide-react'
import { toast } from 'react-toastify'
import InputField from '../../components/ui/InputField'
import Button from '../../components/ui/Button'
import { authStore } from '../../store/authStore'
import { getMe, updateMe, changePassword } from '../../api/profile'
import { getMyProfile, updateMyProfile } from '../../api/patient'

const SECTIONS = [
  { key: 'profile',       label: 'Profile',      icon: <User size={16} /> },
  { key: 'security',      label: 'Security',     icon: <Lock size={16} /> },
  { key: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
]

export default function PatientSettings() {
  const [active, setActive] = useState('profile')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B] tracking-tight m-0">Settings</h1>
        <p className="text-sm text-[#64748B] mt-1 m-0">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 shrink-0">
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            {SECTIONS.map((s, i) => (
              <button key={s.key} onClick={() => setActive(s.key)}
                className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-left bg-transparent border-0 cursor-pointer transition
                  ${i < SECTIONS.length - 1 ? 'border-b border-[#E2E8F0]' : ''}
                  ${active === s.key ? 'bg-[#EFF6F8] text-[#0A4174]' : 'text-[#1E293B] hover:bg-[#F8FAFB]'}`}>
                <div className="flex items-center gap-3">
                  <span className={active === s.key ? 'text-[#0A4174]' : 'text-[#64748B]'}>{s.icon}</span>
                  {s.label}
                </div>
                <ChevronRight size={14} className={active === s.key ? 'text-[#0A4174]' : 'text-[#94A3B8]'} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {active === 'profile'       && <ProfileSection />}
          {active === 'security'      && <SecuritySection />}
          {active === 'notifications' && <NotificationsSection />}
        </div>
      </div>
    </div>
  )
}

// ── Profile ────────────────────────────────────────────────────────────────
function ProfileSection() {
  const storeUser = authStore.getUser()
  const [saving, setSaving] = useState(false)
  const [accountForm, setAccountForm] = useState({ name: '', email: '' })
  const [patientForm, setPatientForm] = useState({
    diabetesType: '', dateOfBirth: '', gender: '', targetHbA1c: '',
  })
  const [patientPublicId, setPatientPublicId] = useState(null)

  useEffect(() => {
    getMe().then(r => {
      setAccountForm({ name: r.data.name ?? '', email: r.data.email ?? '' })
    }).catch(() => {
      setAccountForm({ name: storeUser?.name ?? '', email: storeUser?.email ?? '' })
    })
    getMyProfile().then(r => {
      const p = r.data
      setPatientPublicId(p.user?.publicId ?? null)
      setPatientForm({
        diabetesType: p.diabetesType ?? '',
        dateOfBirth:  p.dateOfBirth  ?? '',
        gender:       p.gender       ?? '',
        targetHbA1c:  p.targetHbA1c  ?? '',
      })
    }).catch(() => {})
  }, [])

  const handleAccount  = f => e => setAccountForm(p => ({ ...p, [f]: e.target.value }))
  const handlePatient  = f => e => setPatientForm(p => ({ ...p, [f]: e.target.value }))

  const initials = accountForm.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'PT'

  const save = async () => {
    setSaving(true)
    try {
      const updatedUser = await updateMe({ name: accountForm.name, email: accountForm.email })
      authStore.setUser({ ...authStore.getUser(), name: updatedUser.data.name, email: updatedUser.data.email })

      if (patientPublicId) {
        await updateMyProfile(patientPublicId, {
          diabetesType: patientForm.diabetesType,
          dateOfBirth:  patientForm.dateOfBirth  || null,
          gender:       patientForm.gender,
          targetHbA1c:  patientForm.targetHbA1c  ? parseFloat(patientForm.targetHbA1c) : null,
        })
      }
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="Profile Information" subtitle="Update your personal and health details">
      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#E2E8F0]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-[#0A4174] text-white flex items-center justify-center text-xl font-bold">
            {initials}
          </div>
          <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0A4174] text-white flex items-center justify-center border-2 border-white cursor-pointer">
            <Camera size={11} />
          </button>
        </div>
        <div>
          <p className="m-0 font-semibold text-[#1E293B]">{accountForm.name || 'Your Name'}</p>
          <p className="m-0 text-sm text-[#64748B]">Patient · {patientForm.diabetesType || 'Diabetes Type not set'}</p>
        </div>
      </div>

      <p className="m-0 text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-3">Account</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <InputField label="Full Name"  value={accountForm.name}  onChange={handleAccount('name')}  placeholder="Jean Baptiste" />
        <InputField label="Email"      value={accountForm.email} onChange={handleAccount('email')} placeholder="you@diacare.com" type="email" />
      </div>

      <p className="m-0 text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-3 mt-5 pt-5 border-t border-[#E2E8F0]">Health Profile</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-[#1E293B]">Diabetes Type</label>
          <select value={patientForm.diabetesType} onChange={handlePatient('diabetesType')}
            style={{ height: 'var(--input-h-desktop)', borderRadius: 'var(--radius-md)' }}
            className="px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none focus:border-[#0A4174] w-full">
            <option value="">Select type</option>
            <option value="TYPE_1">Type 1</option>
            <option value="TYPE_2">Type 2</option>
            <option value="GESTATIONAL">Gestational</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-[#1E293B]">Gender</label>
          <select value={patientForm.gender} onChange={handlePatient('gender')}
            style={{ height: 'var(--input-h-desktop)', borderRadius: 'var(--radius-md)' }}
            className="px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none focus:border-[#0A4174] w-full">
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <InputField label="Date of Birth" type="date" value={patientForm.dateOfBirth} onChange={handlePatient('dateOfBirth')} />
        <InputField label="Target HbA1c (%)" type="number" placeholder="e.g. 7.0" value={patientForm.targetHbA1c} onChange={handlePatient('targetHbA1c')} />
      </div>

      <div className="flex justify-end mt-2">
        <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
      </div>
    </Card>
  )
}

// ── Security ───────────────────────────────────────────────────────────────
function SecuritySection() {
  const [form, setForm]   = useState({ current: '', newPw: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const handle = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  const submit = async () => {
    if (!form.current || !form.newPw || !form.confirm) { toast.error('Fill in all fields'); return }
    if (form.newPw !== form.confirm) { toast.error('New passwords do not match'); return }
    if (form.newPw.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setSaving(true)
    try {
      await changePassword({ currentPassword: form.current, newPassword: form.newPw })
      toast.success('Password updated successfully')
      setForm({ current: '', newPw: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="Change Password" subtitle="Use a strong password with uppercase letters and numbers">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <InputField label="Current Password" type="password" value={form.current} onChange={handle('current')} placeholder="••••••••" autoComplete="current-password" />
        <div />
        <InputField label="New Password"     type="password" value={form.newPw}   onChange={handle('newPw')}   placeholder="Min. 8 chars" autoComplete="new-password" />
        <InputField label="Confirm Password" type="password" value={form.confirm} onChange={handle('confirm')} placeholder="Re-enter new password" autoComplete="new-password" />
      </div>
      <div className="flex justify-end mt-2">
        <Button onClick={submit} disabled={saving}>{saving ? 'Updating...' : 'Update Password'}</Button>
      </div>
    </Card>
  )
}

// ── Notifications ──────────────────────────────────────────────────────────
function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    appointmentReminder: true,
    prescriptionIssued:  true,
    glucoseAlerts:       true,
    emailNotifs:         true,
  })
  const toggle = k => setPrefs(p => ({ ...p, [k]: !p[k] }))

  const items = [
    { key: 'appointmentReminder', label: 'Appointment reminders',   sub: '1 hour before scheduled appointments' },
    { key: 'prescriptionIssued',  label: 'New prescriptions',       sub: 'When your doctor issues a new prescription' },
    { key: 'glucoseAlerts',       label: 'Glucose alerts',          sub: 'When readings are outside your target range' },
    { key: 'emailNotifs',         label: 'Email notifications',     sub: 'Receive alerts via email' },
  ]

  return (
    <Card title="Notification Preferences" subtitle="Choose what you want to be notified about">
      <div className="flex flex-col gap-4">
        {items.map(item => (
          <div key={item.key} className="flex items-center justify-between gap-4">
            <div>
              <p className="m-0 text-sm font-medium text-[#1E293B]">{item.label}</p>
              <p className="m-0 text-xs text-[#64748B]">{item.sub}</p>
            </div>
            <Toggle value={prefs[item.key]} onChange={() => toggle(item.key)} />
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-5">
        <Button onClick={() => toast.success('Preferences saved')}>Save Preferences</Button>
      </div>
    </Card>
  )
}

// ── Shared ─────────────────────────────────────────────────────────────────
function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E2E8F0]">
        <p className="m-0 font-bold text-[#1E293B]">{title}</p>
        {subtitle && <p className="m-0 text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={onChange}
      className={`relative shrink-0 w-10 h-6 rounded-full border-0 cursor-pointer transition-colors duration-200 ${value ? 'bg-[#0A4174]' : 'bg-[#CBD5E1]'}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}
