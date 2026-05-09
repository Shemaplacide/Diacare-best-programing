import React from 'react'

const variants = {
  primary: 'bg-[#0A4174] hover:bg-[#001D39] text-white',
  outline: 'bg-transparent border border-[#0A4174] text-[#0A4174] hover:bg-[#ECFEFF]',
  ghost:   'bg-transparent text-[#64748B] hover:bg-[#EFF6F8]',
  danger:  'bg-[#DC2626] hover:bg-[#b91c1c] text-white',
}

const heights = {
  sm: 'var(--btn-h-sm)',
  md: 'var(--btn-h-md)',
  lg: 'var(--btn-h-lg)',
}

export default function Button({ children, onClick, type = 'button', variant = 'primary', size = 'lg', full = false, disabled = false, className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ height: heights[size], borderRadius: 'var(--radius-md)' }}
      className={`inline-flex items-center justify-center gap-2 px-5 text-sm font-semibold transition cursor-pointer border-0
        ${variants[variant]} ${full ? 'w-full' : ''} ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  )
}
