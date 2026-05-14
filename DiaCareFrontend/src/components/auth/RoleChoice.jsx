import { Shield, Stethoscope, UserRound } from 'lucide-react'

const ROLE_OPTIONS = [
  { value: 'PATIENT', label: 'Patient', icon: UserRound },
  { value: 'DOCTOR', label: 'Doctor', icon: Stethoscope },
  { value: 'ADMIN', label: 'Admin', icon: Shield },
]

export default function RoleChoice({ value, onChange, className = '' }) {
  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {ROLE_OPTIONS.map(option => {
        const Icon = option.icon
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`h-11 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer
              ${active
                ? 'bg-[#0A4174] border-[#0A4174] text-white'
                : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#0A4174] hover:text-[#0A4174]'}`}
          >
            <Icon size={15} />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
