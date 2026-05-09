import { useState } from 'react'
import { User, Lock, Bell, Shield, ChevronRight, Camera } from 'lucide-react'
import { toast } from 'react-toastify'
import InputField from '../../components/ui/InputField'
import Button from '../../components/ui/Button'
import { authStore } from '../../store/authStore'

const SECTIONS = [
  { key: 'profile',       label: 'Profile',        icon: <User size={16} /> },
  { key: 'security',      label: 'Security',        icon: <Lock size={16} /> },
  { key: 'notifications', label: 'Notifications',   icon: <Bell size={16} /> },
  { key: 'system',        label: 'System',          icon: <Shield size={16} /> },
]

export default function Settings() {
  const user = authStore.getUser()
  const [active, setActive] = useState('profile')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B] tracking-tight m-0">Settings</h1>
        <p className="text-sm text-[#64748B] mt-1 m-0">Manage your account and system preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <div className="lg:w-56 shrink-0">
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
            {SECTIONS.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-left bg-transparent border-0 cursor-pointer transition
                  ${i < SECTIONS.length - 1 ? 'border-b border-[#E2E8F0]' : ''}
                  ${active === s.key ? 'bg-[#EFF6F8] text-[#0A4174]' : 'text-[#1E293B] hover:bg-[#F8FAFB]'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={active === s.key ? 'text-[#0A4174]' : 'text-[#64748B]'}>{s.icon}</span>
                  {s.label}
                </div>
                <ChevronRight size={14} className={active === s.key ? 'text-[#0A4174]' : 'text-[#94A3B8]'} />
              </button>
            ))}
          </div>
        </div>

        {/* Content panel */}
        <div className="flex-1 min-w-0">
          {active === 'profile'       && <ProfileSection user={user} />}
          {active === 'security'      && <SecuritySection />}
          {active === 'notifications' && <NotificationsSection />}
          {active === 'system'        && <SystemSection />}
        </div>
      </div>
    </div>
  )
}

// ── Profile ────────────────────────────────────────────────────────────────
function ProfileSection({ user }) {
  const [form, setForm] = useState({
    name:           user?.name           ?? '',
    email:          user?.email          ?? '',
    phone:          user?.phone          ?? '',
    specialization: user?.specialization ?? '',
    hospital:       user?.hospital       ?? '',
    licenseNumber:  user?.licenseNumber  ?? '',
  })
  const handle = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))
  const initials = form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'AD'

  return (
    <Card title="Profile Information" subtitle="Update your personal and professional details">
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
          <p className="m-0 font-semibold text-[#1E293B]">{form.name || 'Your Name'}</p>
          <p className="m-0 text-sm text-[#64748B]">{form.specialization || 'Medical Staff'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <InputField label="Full Name"      value={form.name}           onChange={handle('name')}           placeholder="Dr. Jane Smith" />
        <InputField label="Email"          value={form.email}          onChange={handle('email')}          placeholder="you@diacare.com" type="email" />
        <InputField label="Phone"          value={form.phone}          onChange={handle('phone')}          placeholder="+250 78 000 0000" />
        <InputField label="License Number" value={form.licenseNumber}  onChange={handle('licenseNumber')}  placeholder="MD-123456" />
        <InputField label="Hospital"       value={form.hospital}       onChange={handle('hospital')}       placeholder="Kigali University Hospital" />
        <InputField label="Specialization" value={form.specialization} onChange={handle('specialization')} placeholder="Endocrinologist" />
      </div>

      <div className="flex justify-end mt-2">
        <Button onClick={() => toast.success('Profile updated successfully')}>Save Changes</Button>
      </div>
    </Card>
  )
}

// ── Security ───────────────────────────────────────────────────────────────
function SecuritySection() {
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' })
  const handle = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const [twoFa, setTwoFa] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <Card title="Change Password" subtitle="Use a strong password with uppercase letters and numbers">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <InputField label="Current Password" type="password" value={form.current} onChange={handle('current')} placeholder="••••••••" autoComplete="current-password" />
          <div /> {/* spacer */}
          <InputField label="New Password"     type="password" value={form.newPw}   onChange={handle('newPw')}   placeholder="Min. 8 chars, 1 uppercase, 1 number" autoComplete="new-password" />
          <InputField label="Confirm Password" type="password" value={form.confirm} onChange={handle('confirm')} placeholder="Re-enter new password" autoComplete="new-password" />
        </div>
        <div className="flex justify-end mt-2">
          <Button onClick={() => toast.success('Password updated successfully')}>Update Password</Button>
        </div>
      </Card>

      <Card title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account">
        <div className="flex items-center justify-between">
          <div>
            <p className="m-0 text-sm font-medium text-[#1E293B]">Authenticator App</p>
            <p className="m-0 text-xs text-[#64748B] mt-0.5">{twoFa ? 'Enabled — your account is protected' : 'Not enabled — your account is less secure'}</p>
          </div>
          <Toggle value={twoFa} onChange={() => { setTwoFa(p => !p); toast.success(`2FA ${!twoFa ? 'enabled' : 'disabled'}`) }} />
        </div>
      </Card>
    </div>
  )
}

// ── Notifications ──────────────────────────────────────────────────────────
function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    criticalAlerts:   true,
    glucoseHigh:      true,
    glucoseLow:       true,
    appointmentReminder: true,
    labResults:       false,
    doctorApprovals:  true,
    weeklyReport:     false,
    emailNotifs:      true,
  })
  const toggle = (k) => setPrefs(p => ({ ...p, [k]: !p[k] }))

  const groups = [
    {
      heading: 'Clinical Alerts',
      items: [
        { key: 'criticalAlerts',   label: 'Critical glucose alerts',     sub: 'Notify when a patient reaches critical levels' },
        { key: 'glucoseHigh',      label: 'High glucose readings',       sub: 'Readings above 300 mg/dL' },
        { key: 'glucoseLow',       label: 'Low glucose readings',        sub: 'Readings below 70 mg/dL' },
      ],
    },
    {
      heading: 'System Notifications',
      items: [
        { key: 'appointmentReminder', label: 'Appointment reminders',    sub: '1 hour before scheduled appointments' },
        { key: 'labResults',          label: 'New lab results',          sub: 'When lab results are uploaded' },
        { key: 'doctorApprovals',     label: 'Doctor approval requests', sub: 'New doctor registrations pending review' },
        { key: 'weeklyReport',        label: 'Weekly summary report',    sub: 'Every Monday at 8:00 AM' },
        { key: 'emailNotifs',         label: 'Email notifications',      sub: 'Receive alerts via email' },
      ],
    },
  ]

  return (
    <Card title="Notification Preferences" subtitle="Choose what you want to be notified about">
      {groups.map((g, gi) => (
        <div key={g.heading} className={gi > 0 ? 'mt-5 pt-5 border-t border-[#E2E8F0]' : ''}>
          <p className="m-0 text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-3">{g.heading}</p>
          <div className="flex flex-col gap-3">
            {g.items.map(item => (
              <div key={item.key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="m-0 text-sm font-medium text-[#1E293B]">{item.label}</p>
                  <p className="m-0 text-xs text-[#64748B]">{item.sub}</p>
                </div>
                <Toggle value={prefs[item.key]} onChange={() => toggle(item.key)} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex justify-end mt-5">
        <Button onClick={() => toast.success('Notification preferences saved')}>Save Preferences</Button>
      </div>
    </Card>
  )
}

// ── System ─────────────────────────────────────────────────────────────────
function SystemSection() {
  const [settings, setSettings] = useState({
    glucoseUnit:    'mg/dL',
    timezone:       'Africa/Kigali',
    language:       'English',
    sessionTimeout: '30',
    dataRetention:  '12',
  })
  const handle = (f) => (e) => setSettings(p => ({ ...p, [f]: e.target.value }))

  return (
    <Card title="System Preferences" subtitle="Configure system-wide settings">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-[#1E293B]">Glucose Unit</label>
          <select value={settings.glucoseUnit} onChange={handle('glucoseUnit')} style={{ height: 'var(--input-h-desktop)', borderRadius: 'var(--radius-md)' }} className="px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none focus:border-[#0A4174] w-full">
            <option>mg/dL</option>
            <option>mmol/L</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-[#1E293B]">Language</label>
          <select value={settings.language} onChange={handle('language')} style={{ height: 'var(--input-h-desktop)', borderRadius: 'var(--radius-md)' }} className="px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none focus:border-[#0A4174] w-full">
            <option>English</option>
            <option>French</option>
            <option>Kinyarwanda</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-[#1E293B]">Timezone</label>
          <select value={settings.timezone} onChange={handle('timezone')} style={{ height: 'var(--input-h-desktop)', borderRadius: 'var(--radius-md)' }} className="px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none focus:border-[#0A4174] w-full">
            <option>Africa/Kigali</option>
            <option>UTC</option>
            <option>Africa/Nairobi</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-[#1E293B]">Session Timeout (minutes)</label>
          <select value={settings.sessionTimeout} onChange={handle('sessionTimeout')} style={{ height: 'var(--input-h-desktop)', borderRadius: 'var(--radius-md)' }} className="px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none focus:border-[#0A4174] w-full">
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-[#1E293B]">Data Retention (months)</label>
          <select value={settings.dataRetention} onChange={handle('dataRetention')} style={{ height: 'var(--input-h-desktop)', borderRadius: 'var(--radius-md)' }} className="px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none focus:border-[#0A4174] w-full">
            <option value="6">6 months</option>
            <option value="12">12 months</option>
            <option value="24">24 months</option>
            <option value="60">5 years</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <Button onClick={() => toast.success('System settings saved')}>Save Settings</Button>
      </div>
    </Card>
  )
}

// ── Shared sub-components ──────────────────────────────────────────────────
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
    <button
      onClick={onChange}
      className={`relative shrink-0 w-10 h-6 rounded-full border-0 cursor-pointer transition-colors duration-200
        ${value ? 'bg-[#0A4174]' : 'bg-[#CBD5E1]'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200
        ${value ? 'translate-x-4' : 'translate-x-0.5'}`}
      />
    </button>
  )
}
