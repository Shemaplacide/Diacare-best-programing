import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

export default function NewChatModal({ users, onSelect, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef          = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase()) ||
    u.role.toLowerCase().includes(query.toLowerCase())
  )

  const roleColor = (role) => {
    if (role === 'DOCTOR')  return { bg: '#EFF6FF', text: '#1D4ED8' }
    if (role === 'ADMIN')   return { bg: '#FEF3C7', text: '#92400E' }
    if (role === 'PATIENT') return { bg: '#F0FDF4', text: '#166534' }
    return { bg: '#F1F5F9', text: '#64748B' }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 bg-[#0A4174]">
          <p className="text-white font-semibold text-base m-0">New Chat</p>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border-0 cursor-pointer text-white hover:bg-white/30 transition">
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-[#E9EDEF]">
          <div className="flex items-center gap-2 bg-[#F0F2F5] rounded-xl px-3 py-2">
            <Search size={15} className="text-[#8696A0] shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name or role…"
              className="flex-1 bg-transparent border-0 outline-none text-sm text-[#1E293B] placeholder-[#8696A0]"
            />
          </div>
        </div>

        {/* User list */}
        <div className="overflow-y-auto" style={{ maxHeight: 360 }}>
          {filtered.length === 0 && (
            <p className="text-center text-sm text-[#8696A0] py-8">No users found</p>
          )}
          {filtered.map(u => {
            const initials = u.username.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
            const { bg, text } = roleColor(u.role)
            return (
              <button key={u.email} onClick={() => onSelect(u)}
                className="w-full flex items-center gap-3 px-4 py-3 border-0 bg-white hover:bg-[#F5F6F6] cursor-pointer transition text-left">
                <div className="w-11 h-11 rounded-full bg-[#0A4174] text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1E293B] m-0 truncate">{u.username}</p>
                  <p className="text-xs text-[#8696A0] m-0 truncate">{u.email}</p>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: bg, color: text }}>
                  {u.role}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
