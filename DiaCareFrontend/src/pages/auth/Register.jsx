import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Eye, EyeOff } from 'lucide-react'
import AuthLayout from './AuthLayout'
import InputField from '../../components/ui/InputField'
import Button from '../../components/ui/Button'
import SocialButton from '../../components/ui/SocialButton'
import { SPECIALIZATIONS } from '../../constants/auth'
import { register } from '../../api/auth'
import { authStore } from '../../store/authStore'
import { validateRegister } from '../../utils/validate'

const MAX_ATTEMPTS = 5
const LOCKOUT_MS   = 60 * 1000

export default function Register() {
  const navigate              = useNavigate()
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [isDoctor, setIsDoctor] = useState(false)
  const [errors, setErrors]   = useState({})
  const attempts = useRef(0)
  const lockedAt = useRef(null)

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    licenseNumber: '', specialization: '', hospital: '',
  })

  const handle = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (lockedAt.current && Date.now() - lockedAt.current < LOCKOUT_MS) {
      const secs = Math.ceil((LOCKOUT_MS - (Date.now() - lockedAt.current)) / 1000)
      toast.error(`Too many attempts. Try again in ${secs}s`)
      return
    }

    const fieldErrors = validateRegister(form, isDoctor, {
      licenseNumber: form.licenseNumber,
      specialization: form.specialization,
      hospital: form.hospital,
    })
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return }

    setLoading(true)
    try {
      const payload = {
        name:     form.name.trim(),
        email:    form.email.trim(),
        password: form.password,
        ...(isDoctor && {
          is_doctor:      true,
          license_number: form.licenseNumber.trim(),
          specialization: form.specialization,
          hospital:       form.hospital.trim(),
        }),
      }

      const { data } = await register(payload)
      authStore.setToken(data.access_token)
      authStore.setUser(data.user)
      attempts.current = 0
      lockedAt.current = null
      toast.success('Account created successfully')
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
        else toast.error(err.response?.data?.message ?? 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col">
        <h2 className="text-3xl font-bold tracking-tight text-[#1E293B] mb-1">Create account</h2>
        <p className="text-sm text-[#64748B] mb-7">Join DiaCare and start managing patients</p>

        <InputField label="Full Name" type="text"  placeholder="Jane Smith"      value={form.name}  onChange={handle('name')}  autoComplete="name"  error={errors.name} />
        <InputField label="Email"     type="email" placeholder="you@diacare.com" value={form.email} onChange={handle('email')} autoComplete="email" error={errors.email} />

        {/* Password with show/hide */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-[#1E293B]">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handle('password')}
              autoComplete="new-password"
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
          {errors.password && <p className="text-xs text-[#DC2626] mt-0.5">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-semibold text-[#1E293B]">Confirm Password</label>
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={handle('confirmPassword')}
            autoComplete="new-password"
            style={{ height: 'var(--input-h-desktop)', borderRadius: 'var(--radius-md)' }}
            className={`w-full px-3.5 border bg-white text-sm text-[#1E293B] font-[inherit] outline-none transition
              ${errors.confirmPassword
                ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#FFF1F0]'
                : 'border-[#E2E8F0] focus:border-[#0A4174] focus:ring-2 focus:ring-[#ECFEFF]'}`}
          />
          {errors.confirmPassword && <p className="text-xs text-[#DC2626] mt-0.5">{errors.confirmPassword}</p>}
        </div>

        {/* Doctor checkbox */}
        <label className="flex items-center gap-3 mb-5 cursor-pointer select-none">
          <div
            onClick={() => { setIsDoctor(p => !p); setErrors({}) }}
            style={{ borderRadius: 'var(--radius-sm)', width: 18, height: 18, minWidth: 18 }}
            className={`border-2 flex items-center justify-center transition
              ${isDoctor ? 'bg-[#0A4174] border-[#0A4174]' : 'bg-white border-[#CBD5E1]'}`}
          >
            {isDoctor && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-sm font-medium text-[#1E293B]">I am a licensed medical professional</span>
        </label>

        {/* Doctor extra fields */}
        {isDoctor && (
          <div className="flex flex-col p-4 rounded-xl bg-[#EFF6F8] border border-[#BDD8E9] mb-4 gap-1">
            <p className="text-xs font-semibold text-[#0A4174] mb-2">Medical credentials</p>

            <InputField
              label="License Number"
              type="text"
              placeholder="e.g. MD-123456"
              value={form.licenseNumber}
              onChange={handle('licenseNumber')}
              error={errors.licenseNumber}
            />

            {/* Specialization select */}
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs font-semibold text-[#1E293B]">Specialization</label>
              <select
                value={form.specialization}
                onChange={handle('specialization')}
                style={{ height: 'var(--input-h-desktop)', borderRadius: 'var(--radius-md)' }}
                className={`px-3.5 border bg-white text-sm text-[#1E293B] font-[inherit] outline-none transition w-full
                  ${errors.specialization
                    ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#FFF1F0]'
                    : 'border-[#E2E8F0] focus:border-[#0A4174] focus:ring-2 focus:ring-[#ECFEFF]'}`}
              >
                <option value="">Select specialization</option>
                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.specialization && <p className="text-xs text-[#DC2626] mt-0.5">{errors.specialization}</p>}
            </div>

            <InputField
              label="Hospital / Clinic"
              type="text"
              placeholder="e.g. Kigali University Hospital"
              value={form.hospital}
              onChange={handle('hospital')}
              error={errors.hospital}
            />
          </div>
        )}

        <Button type="submit" full disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-[#E2E8F0]" />
          <span className="text-xs text-[#94A3B8] font-medium">or sign up with</span>
          <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>

        <div className="flex gap-2">
          <SocialButton provider="google" onClick={() => toast.info('Google sign-up coming soon')} />
          <SocialButton provider="apple"  onClick={() => toast.info('Apple sign-up coming soon')} />
        </div>

        <p className="text-sm text-center text-[#64748B] mt-6">
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/login')}
            className="text-[#0A4174] font-semibold hover:underline cursor-pointer bg-transparent border-0">
            Sign in
          </button>
        </p>
      </form>
    </AuthLayout>
  )
}
