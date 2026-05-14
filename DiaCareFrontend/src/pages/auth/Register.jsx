import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Eye, EyeOff } from 'lucide-react'
import AuthLayout from './AuthLayout'
import InputField from '../../components/ui/InputField'
import Button from '../../components/ui/Button'
import SocialButton from '../../components/ui/SocialButton'
import { register } from '../../api/auth'
import { getAllDoctors } from '../../api/doctor'
import { authStore } from '../../store/authStore'
import { validateRegister } from '../../utils/validate'

const MAX_ATTEMPTS = 5
const LOCKOUT_MS   = 60 * 1000

export default function Register() {
  const navigate              = useNavigate()
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})
  const [doctors, setDoctors] = useState([])
  const attempts = useRef(0)
  const lockedAt = useRef(null)

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    licenseNumber: '', specialization: '', hospital: '',
    diabetesType: '', dateOfBirth: '', phoneNumber: '', hasAllergies: 'NO', allergyDetails: '',
    preferredDoctorPublicId: '',
  })

  useEffect(() => {
    getAllDoctors()
      .then(r => setDoctors(r.data ?? []))
      .catch(() => setDoctors([]))
  }, [])

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

    const role = 'PATIENT'
    const isDoctor = false
    const fieldErrors = validateRegister(form, isDoctor, {
      licenseNumber: form.licenseNumber,
      specialization: form.specialization,
      hospital: form.hospital,
    }, role)
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return }

    setLoading(true)
    try {
      const payload = {
        name:     form.name.trim(),
        email:    form.email.trim(),
        password: form.password,
        role: 'PATIENT',
        ...(role === 'PATIENT' && {
          diabetesType: form.diabetesType,
          dateOfBirth: form.dateOfBirth || null,
          phoneNumber: form.phoneNumber.trim(),
          hasAllergies: form.hasAllergies === 'YES',
          allergyDetails: form.hasAllergies === 'YES' ? form.allergyDetails.trim() : '',
          preferredDoctorPublicId: form.preferredDoctorPublicId || null,
        }),
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
        <p className="text-sm text-[#64748B] mb-5">Create your patient account</p>

        <InputField label="Full Name" type="text"  placeholder="Jane Smith"      value={form.name}  onChange={handle('name')}  autoComplete="name"  error={errors.name} />
        <InputField label="Email"     type="email" placeholder="you@diacare.com" value={form.email} onChange={handle('email')} autoComplete="email" error={errors.email} />

        <div className="flex flex-col p-4 rounded-xl bg-[#EFF6F8] border border-[#BDD8E9] mb-4 gap-1">
            <p className="text-xs font-semibold text-[#0A4174] mb-2">Patient information</p>

            <InputField
              label="Telephone Number"
              type="tel"
              placeholder="+250 78 000 0000"
              value={form.phoneNumber}
              onChange={handle('phoneNumber')}
              error={errors.phoneNumber}
            />

            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs font-semibold text-[#1E293B]">Diabetes Type</label>
              <select
                value={form.diabetesType}
                onChange={handle('diabetesType')}
                style={{ height: 'var(--input-h-desktop)', borderRadius: 'var(--radius-md)' }}
                className={`px-3.5 border bg-white text-sm text-[#1E293B] font-[inherit] outline-none transition w-full
                  ${errors.diabetesType
                    ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#FFF1F0]'
                    : 'border-[#E2E8F0] focus:border-[#0A4174] focus:ring-2 focus:ring-[#ECFEFF]'}`}
              >
                <option value="">Select diabetes type</option>
                <option value="TYPE_1">Type 1</option>
                <option value="TYPE_2">Type 2</option>
                <option value="GESTATIONAL">Gestational</option>
                <option value="PREDIABETES">Prediabetes</option>
                <option value="Unknown">I am not sure</option>
              </select>
              {errors.diabetesType && <p className="text-xs text-[#DC2626] mt-0.5">{errors.diabetesType}</p>}
            </div>

            <InputField
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={handle('dateOfBirth')}
              error={errors.dateOfBirth}
            />

            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs font-semibold text-[#1E293B]">Preferred Doctor</label>
              <select
                value={form.preferredDoctorPublicId}
                onChange={handle('preferredDoctorPublicId')}
                style={{ height: 'var(--input-h-desktop)', borderRadius: 'var(--radius-md)' }}
                className={`px-3.5 border bg-white text-sm text-[#1E293B] font-[inherit] outline-none transition w-full
                  ${errors.preferredDoctorPublicId
                    ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#FFF1F0]'
                    : 'border-[#E2E8F0] focus:border-[#0A4174] focus:ring-2 focus:ring-[#ECFEFF]'}`}
              >
                <option value="">{doctors.length === 0 ? 'No doctors available yet' : 'Select a doctor'}</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.user?.publicId}>
                    Dr. {doctor.user?.username} - {doctor.specialization}
                  </option>
                ))}
              </select>
              {errors.preferredDoctorPublicId && <p className="text-xs text-[#DC2626] mt-0.5">{errors.preferredDoctorPublicId}</p>}
            </div>

            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs font-semibold text-[#1E293B]">Do you have allergies?</label>
              <select
                value={form.hasAllergies}
                onChange={handle('hasAllergies')}
                style={{ height: 'var(--input-h-desktop)', borderRadius: 'var(--radius-md)' }}
                className="px-3.5 border border-[#E2E8F0] bg-white text-sm text-[#1E293B] font-[inherit] outline-none transition w-full focus:border-[#0A4174] focus:ring-2 focus:ring-[#ECFEFF]"
              >
                <option value="NO">No</option>
                <option value="YES">Yes</option>
              </select>
            </div>

            {form.hasAllergies === 'YES' && (
              <InputField
                label="Allergy Details"
                type="text"
                placeholder="e.g. Penicillin, peanuts"
                value={form.allergyDetails}
                onChange={handle('allergyDetails')}
                error={errors.allergyDetails}
              />
            )}
        </div>

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
