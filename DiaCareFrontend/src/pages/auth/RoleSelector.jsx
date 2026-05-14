import { useNavigate } from 'react-router-dom'
import { Shield, Stethoscope, User, UserPlus } from 'lucide-react'
import Logo from '../../components/ui/Logo'

const ROLES = [
  {
    key:         'admin',
    label:       'Administrator',
    description: 'Manage users, reports, staff, and system operations',
    icon:        <Shield size={26} />,
    color:       '#7C3AED',
    bg:          '#F5F3FF',
    border:      '#DDD6FE',
    loginPath:   '/login/admin',
  },
  {
    key:         'doctor',
    label:       'Medical Staff',
    description: 'Access patient records, appointments, and care tools',
    icon:        <Stethoscope size={26} />,
    color:       '#0A4174',
    bg:          '#EFF6FF',
    border:      '#BFDBFE',
    loginPath:   '/login/doctor',
  },
  {
    key:         'patient',
    label:       'Patient',
    description: 'View your health data, appointments, and messages',
    icon:        <User size={26} />,
    color:       '#059669',
    bg:          '#ECFDF5',
    border:      '#A7F3D0',
    loginPath:   '/login/patient',
  },
]

export default function RoleSelector() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001D39] via-[#0A4174] to-[#49769F] flex flex-col items-center justify-center px-4 py-12">

      <div className="mb-8">
        <Logo size={44} showName nameClass="text-white text-3xl" />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to DiaCare</h1>
        <p className="text-white/70 text-base">Select your role to sign in. Only patients can create public accounts.</p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-6">
        {ROLES.map(r => (
          <div
            key={r.key}
            className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white border-2 text-center"
            style={{ borderColor: r.border }}>

            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: r.bg, color: r.color }}>
              {r.icon}
            </div>

            <div>
              <p className="font-bold text-[#1E293B] text-base mb-1">{r.label}</p>
              <p className="text-xs text-[#64748B] leading-relaxed">{r.description}</p>
            </div>

            {/* Two action buttons per card */}
            <div className="flex flex-col gap-2 w-full mt-auto">
              <button
                onClick={() => navigate(r.loginPath)}
                className="w-full py-2 rounded-xl text-sm font-semibold border-0 cursor-pointer transition hover:opacity-90"
                style={{ backgroundColor: r.color, color: '#fff' }}>
                Sign In
              </button>
              {r.key === 'patient' && (
                <button
                  onClick={() => navigate('/register')}
                  className="w-full py-2 rounded-xl text-sm font-semibold border-2 cursor-pointer transition hover:opacity-80 bg-transparent"
                  style={{ borderColor: r.color, color: r.color }}>
                  Create Account
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom register shortcut */}
      <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 w-full max-w-3xl">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <UserPlus size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-white text-sm font-semibold m-0">New patient?</p>
          <p className="text-white/65 text-xs m-0">Patients can register here. Doctor and admin accounts are created by an administrator.</p>
        </div>
        <button
          onClick={() => navigate('/register')}
          className="shrink-0 px-4 py-2 rounded-xl bg-white text-[#0A4174] text-sm font-semibold border-0 cursor-pointer hover:bg-[#F8FAFB] transition">
          Get Started
        </button>
      </div>
    </div>
  )
}
