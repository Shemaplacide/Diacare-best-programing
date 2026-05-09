import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, LogOut, User, Settings, Check } from 'lucide-react'
import { authStore } from '../../store/authStore'
import { PAGE_TITLES } from '../../constants/nav'
import Logo from './Logo'

export default function Header({ onToggleSidebar }) {
  const { pathname } = useLocation()
  const navigate     = useNavigate()
  const title        = PAGE_TITLES[pathname] ?? 'Dashboard'
  const user         = authStore.getUser()

  const fullName = user?.name ?? 'Doctor'
  const initials = fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const [notifOpen,   setNotifOpen]   = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [currentTime, setCurrentTime] = useState(Date.now())

  const notifRef   = useRef(null)
  const profileRef = useRef(null)

  const unread = notifications.filter(n => !n.read).length

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Live timestamp ticker
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))

  const signOut = () => {
    authStore.clear()
    navigate('/login')
  }

  const fmtTime = (ts) => {
    const diff = Math.floor((currentTime - new Date(ts).getTime()) / 1000)
    if (diff < 60)    return `${diff}s ago`
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <header
      className="flex items-center justify-between shrink-0 sticky top-0 z-30 bg-white border-b border-[#E2E8F0]"
      style={{ height: 'var(--nav-top-h)', padding: '0 1.25rem', gap: '1rem' }}
    >
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className={iconBtn} aria-label="Toggle sidebar">
          <Menu size={20} />
        </button>
        {/* Show logo on mobile, page title on desktop */}
        <div className="hidden sm:block">
          <span className="font-semibold text-[#1E293B]" style={{ fontSize: '0.9375rem' }}>{title}</span>
        </div>
        <div className="sm:hidden">
          <Logo size={26} showName nameClass="text-[#001D39] text-sm" />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-1">

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(v => !v); setProfileOpen(false) }}
            className={`${iconBtn} relative`}
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#0A4174]" />
            )}
          </button>

          {notifOpen && (
            <div className={dropdown} style={{ width: 320, right: 0 }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
                <span className="text-sm font-semibold text-[#1E293B]">
                  Notifications
                  {unread > 0 && <span className="ml-2 bg-[#0A4174] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unread}</span>}
                </span>
                {unread > 0 && (
                  <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-[#0A4174] font-medium bg-transparent border-0 cursor-pointer">
                    <Check size={12} /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-sm text-[#64748B] py-6">No notifications</p>
                ) : notifications.map((n, i) => (
                  <div key={i} className="flex gap-3 px-4 py-2.5 border-b border-[#E2E8F0]">
                    <span className="w-2 h-2 rounded-full bg-[#0A4174] shrink-0 mt-1.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1E293B] m-0">{n.title}</p>
                      <p className="text-xs text-[#64748B] m-0 truncate">{n.message}</p>
                    </div>
                    <span className="text-xs text-[#94A3B8] shrink-0">{fmtTime(n.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-7 bg-[#E2E8F0] mx-1" />

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setProfileOpen(v => !v); setNotifOpen(false) }}
            className="flex items-center gap-2 bg-transparent border-0 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-[#F8FAFB] transition"
            aria-label="Profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-[#0A4174] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="header-profile-text text-left leading-tight">
              <p className="m-0 text-sm font-semibold text-[#1E293B] whitespace-nowrap">{fullName}</p>
              <p className="m-0 text-xs text-[#64748B]">{user?.specialization ?? 'Medical Staff'}</p>
            </div>
            <ChevronDown
              size={14}
              className="header-profile-text text-[#94A3B8] transition-transform duration-200"
              style={{ transform: profileOpen ? 'rotate(180deg)' : 'none' }}
            />
          </button>

          {profileOpen && (
            <div className={dropdown} style={{ minWidth: 180, right: 0 }}>
              <a href="/profile"  className={menuItem}><User size={14} /> My Profile</a>
              <a href="/settings" className={menuItem}><Settings size={14} /> Settings</a>
              <div className="h-px bg-[#E2E8F0] my-1" />
              <button onClick={signOut} className={`${menuItem} w-full border-0 cursor-pointer text-[#DC2626]`}>
                <LogOut size={14} /> Sign out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}

const iconBtn = 'flex items-center justify-center w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer text-[#64748B] hover:bg-[#F8FAFB] transition'
const dropdown = 'absolute top-[calc(100%+8px)] bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-50 overflow-hidden'
const menuItem = 'flex items-center gap-2 px-4 py-2 text-sm text-[#1E293B] no-underline bg-transparent hover:bg-[#F8FAFB] whitespace-nowrap w-full text-left transition'
