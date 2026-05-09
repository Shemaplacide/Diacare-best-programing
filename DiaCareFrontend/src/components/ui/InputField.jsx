import React from 'react'

export default function InputField({ label, type = 'text', placeholder, value, onChange, name, autoComplete, error }) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      {label && <label className="text-xs font-semibold text-[#1E293B]">{label}</label>}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        style={{ height: 'var(--input-h-desktop)', borderRadius: 'var(--radius-md)' }}
        className={`px-3.5 border bg-white text-sm text-[#1E293B] font-[inherit] outline-none transition w-full
          ${error
            ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#FFF1F0]'
            : 'border-[#E2E8F0] focus:border-[#0A4174] focus:ring-2 focus:ring-[#ECFEFF]'
          }`}
      />
      {error && <p className="text-xs text-[#DC2626] mt-0.5">{error}</p>}
    </div>
  )
}
