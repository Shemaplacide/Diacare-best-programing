import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, subtitle, children, footer, width = 480 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} className="fixed inset-0 bg-black/40 z-60 flex items-center justify-center" />

      {/* Modal */}
      <div
        className="fixed z-70 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: `min(${width}px, calc(100vw - 32px))`, maxHeight: 'calc(100vh - 48px)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E2E8F0] shrink-0">
          <div className="flex-1 min-w-0">
            <p className="m-0 font-bold text-[#1E293B] text-base">{title}</p>
            {subtitle && <p className="m-0 text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#E2E8F0] bg-transparent cursor-pointer text-[#64748B] hover:bg-[#F8FAFB] transition shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#E2E8F0] shrink-0 flex-wrap">
            {footer}
          </div>
        )}
      </div>
    </>
  )
}
