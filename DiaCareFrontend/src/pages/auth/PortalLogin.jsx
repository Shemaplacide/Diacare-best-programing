import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { toast } from 'react-toastify'
import InputField from '../../components/ui/InputField'
import Button from '../../components/ui/Button'
import Logo from '../../components/ui/Logo'
import { login } from '../../api/auth'
import { authStore } from '../../store/authStore'
import { validateLogin } from '../../utils/validate'
import { getTimeGreeting } from '../../utils/greeting'

const MAX_ATTEMPTS = 5
const LOCKOUT_MS   = 60 * 1000

const PORTAL_CONFIG = {
  ADMIN: {
    label:       'Administration Portal',
    welcome:     'Admin Portal',
    subtitle:    'Sign in to manage users, reports, and system operations',
    placeholder: 'admin@diacare.com',
    hint:        { label: 'Demo credentials', email: 'admin@diacare.com', password: 'Admin@123' },
    gradient:    'linear-gradient(145deg, #3B0764 0%, #7C3AED 60%, #A78BFA 100%)',
    accent:      '#7C3AED',
    accentLight: '#F5F3FF',
    stats: [
      { value: 'Full',   label: 'System access'   },
      { value: 'Live',   label: 'Reports & alerts' },
      { value: 'Secure', label: 'Audit logging'    },
    ],
    features: [
      'Manage all patients and staff',
      'View system-wide reports',
      'Handle SOS emergency alerts',
      'Configure system settings',
    ],
  },
  DOCTOR: {
    label:       'Medical Staff Portal',
    welcome:     'Doctor Portal',
    subtitle:    'Sign in to access patient records and care tools',
    placeholder: 'doctor@diacare.com',
    hint:        { label: 'Demo credentials', email: 'mugisha@diacare.com', password: 'Doctor@123' },
    gradient:    'linear-gradient(145deg, #001D39 0%, #0A4174 60%, #49769F 100%)',
    accent:      '#0A4174',
    accentLight: '#EFF6FF',
    stats: [
      { value: '24/7',  label: 'Patient access'   },
      { value: 'Live',  label: 'Glucose alerts'   },
      { value: 'HIPAA', label: 'Compliant'        },
    ],
    features: [
      'Review patient glucose trends',
      'Manage appointments',
      'Issue prescriptions and meal plans',
      'Real-time patient chat',
    ],
  },
  PATIENT: {
    label:       'Patient Portal',
    welcome:     'Patient Portal',
    subtitle:    'Sign in to manage your health and appointments',
    placeholder: 'patient@diacare.com',
    hint:        { label: 'Demo credentials', email: 'jean@diacare.com', password: 'Patient@123' },
    gradient:    'linear-gradient(145deg, #064E3B 0%, #059669 60%, #34D399 100%)',
    accent:      '#059669',
    accentLight: '#ECFDF5',
    stats: [
      { value: 'Easy',  label: 'Glucose logging'  },
      { value: 'Fast',  label: 'Appointment book' },
      { value: 'Safe',  label: 'Private & secure' },
    ],
    features: [
      'Track glucose readings',
      'Book and manage appointments',
      'View prescriptions and meal plans',
      'Chat with your doctor',
    ],
  },
}

export default function PortalLogin({ role }) {
  const navigate              = useNavigate()
  const config                = PORTAL_CONFIG[role]
  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const attempts              = useRef(0)
  const lockedAt              = useRef(null)

  const handle = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const fillDemo = () => {
    setForm({ email: config.hint.email, password: config.hint.password })
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (lockedAt.current && Date.now() - lockedAt.current < LOCKOUT_MS) {
      const secs = Math.ceil((LOCKOUT_MS - (Date.now() - lockedAt.current)) / 1000)
      toast.error(`Too many attempts. Try again in ${secs}s`)
      return
    }

    const fieldErrors = validateLogin(form)
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return }

    setLoading(true)
    try {
      const { data } = await login({ email: form.email.trim(), password: form.password })
      authStore.setToken(data.access_token)
      authStore.setUser(data.user)

      // Enforce role — if they logged in via the wrong portal, redirect correctly
      const actualRole = data.user?.role
      if (actualRole !== role) {
        toast.info(`Redirecting to your ${actualRole?.toLowerCase()} portal`)
      } else {
        toast.success(`${getTimeGreeting()}, ${data.user?.name ?? 'there'}`)
      }

      attempts.current = 0
      lockedAt.current = null
      navigate(authStore.getHomePath())
    } catch (err) {
      attempts.current += 1
      if (attempts.current >= MAX_ATTEMPTS) {
        lockedAt.current = Date.now()
        attempts.current = 0
        toast.error('Too many failed attempts. Locked for 1 minute.')
      } else {
        const apiErrors = err.response?.data?.errors
        if (apiErrors) setErrors(apiErrors)
        else setErrors({ email: ' ', password: err.response?.data?.message ?? 'Invalid email or password' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">

      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col w-[45%] shrink-0 sticky top-0 h-screen px-12 py-10 overflow-hidden"
        style={{ background: config.gradient }}>

        <Logo size={40} showName nameClass="text-white" />

        <div className="my-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 mb-6">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-semibold text-white">{config.label}</span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight tracking-tight mb-4">
            Your dedicated<br />care portal
          </h1>
          <p className="text-base text-white/80 leading-relaxed mb-8 max-w-sm">{config.subtitle}</p>

          {/* Feature list */}
          <ul className="flex flex-col gap-3 mb-10">
            {config.features.map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/90">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-[10px] font-bold">✓</span>
                {f}
              </li>
            ))}
          </ul>

          {/* Stats */}
          <div className="flex gap-3 flex-wrap">
            {config.stats.map(s => (
              <div key={s.label} className="flex flex-col gap-0.5 px-4 py-3 rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm">
                <span className="text-xl font-bold text-white font-mono">{s.value}</span>
                <span className="text-xs text-white/75">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute w-80 h-80 rounded-full bg-white/5 -top-20 -right-20 pointer-events-none" />
        <div className="absolute w-56 h-56 rounded-full bg-white/5 -bottom-16 -left-16 pointer-events-none" />
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col bg-[#F8FAFB]">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <Link to="/login"
            className="flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#0A4174] transition no-underline">
            <ArrowLeft size={15} /> All portals
          </Link>
          <div className="lg:hidden">
            <Logo size={28} showName nameClass="text-[#001D39] text-base" />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-5">
          <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col">

            {/* Role badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 self-start text-xs font-semibold"
              style={{ backgroundColor: config.accentLight, color: config.accent }}>
              {config.label}
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-[#1E293B] mb-1">{config.welcome}</h2>
            <p className="text-sm text-[#64748B] mb-7">{config.subtitle}</p>

            {/* Demo credentials hint */}
            <button type="button" onClick={fillDemo}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-dashed mb-6 cursor-pointer transition hover:opacity-80 text-left"
              style={{ borderColor: config.accent, backgroundColor: config.accentLight }}>
              <div>
                <p className="text-xs font-semibold m-0" style={{ color: config.accent }}>{config.hint.label}</p>
                <p className="text-xs text-[#64748B] m-0 mt-0.5">{config.hint.email}</p>
              </div>
              <span className="text-xs font-semibold shrink-0" style={{ color: config.accent }}>
                Fill in →
              </span>
            </button>

            <InputField
              label="Email"
              type="email"
              placeholder={config.placeholder}
              value={form.email}
              onChange={handle('email')}
              autoComplete="email"
              error={errors.email}
            />

            {/* Password */}
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs font-semibold text-[#1E293B]">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handle('password')}
                  autoComplete="current-password"
                  style={{ height: 'var(--input-h-desktop)', borderRadius: 'var(--radius-md)' }}
                  className={`w-full px-3.5 pr-10 border bg-white text-sm text-[#1E293B] font-[inherit] outline-none transition
                    ${errors.password
                      ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#FFF1F0]'
                      : 'border-[#E2E8F0] focus:border-[#0A4174] focus:ring-2 focus:ring-[#ECFEFF]'}`}
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && errors.password.trim() && (
                <p className="text-xs text-[#DC2626] mt-0.5">{errors.password}</p>
              )}
            </div>

            <div className="text-right mb-5">
              <a href="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: config.accent }}>
                Forgot password?
              </a>
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-11 rounded-xl text-white text-sm font-semibold transition disabled:opacity-60 cursor-pointer border-0"
              style={{ backgroundColor: config.accent }}>
              {loading ? 'Signing in…' : `Sign in to ${config.welcome}`}
            </button>

            {role === 'PATIENT' && (
              <p className="text-sm text-center text-[#64748B] mt-6">
                Don't have an account?{' '}
                <button type="button" onClick={() => navigate('/register')}
                  className="font-semibold hover:underline cursor-pointer bg-transparent border-0"
                  style={{ color: config.accent }}>
                  Sign up
                </button>
              </p>
            )}

            <p className="text-xs text-center text-[#94A3B8] mt-4">
              Wrong portal?{' '}
              <button type="button" onClick={() => navigate('/login')}
                className="hover:underline bg-transparent border-0 cursor-pointer text-[#64748B]">
                Go back to role selection
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
