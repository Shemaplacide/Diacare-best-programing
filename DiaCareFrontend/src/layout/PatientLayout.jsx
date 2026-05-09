import { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Menu, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react'
import { authStore } from '../store/authStore'
import { PATIENT_NAV, PATIENT_PAGE_TITLES } from '../constants/patientNav'
import Logo from '../components/ui/Logo'
<<<<<<< HEAD
=======
import { useChatUnread } from '../hooks/useChatUnread'
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

const MOBILE_BP = 768
const TABLET_BP = 1024

function PatientSidebar({ collapsed, onNavClick }) {
<<<<<<< HEAD
  const navigate = useNavigate()
  const signOut  = () => { authStore.clear(); navigate('/login') }
=======
  const navigate   = useNavigate()
  const signOut    = () => { authStore.clear(); navigate('/login') }
  const chatUnread = useChatUnread()
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

  return (
    <aside className="flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-200 overflow-hidden"
      style={{ width: collapsed ? '64px' : 'var(--sidebar-w)', minWidth: collapsed ? '64px' : 'var(--sidebar-w)', backgroundColor: 'var(--color-sidebar-bg)' }}>
      <div className="flex items-center gap-3 shrink-0 overflow-hidden"
        style={{ height: 'var(--nav-top-h)', padding: '0 1rem', borderBottom: '1px solid #ffffff1a' }}>
        <Logo size={32} showName={!collapsed} nameClass="text-white text-base" />
      </div>

      <nav className="flex-1 flex flex-col gap-0.5 p-2 overflow-y-auto overflow-x-hidden">
        {PATIENT_NAV.map(item => (
          <NavLink key={item.href} to={item.href} end={item.end ?? false}
            title={collapsed ? item.label : undefined} onClick={onNavClick} className="sidebar-link"
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: collapsed ? '0.65rem' : '0.6rem 0.75rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: '6px',
              borderLeft: isActive ? '3px solid var(--color-primary-400)' : '3px solid transparent',
              backgroundColor: isActive ? '#ffffff14' : 'transparent',
              color: isActive ? 'var(--color-sidebar-active)' : 'var(--color-sidebar-text)',
              fontSize: '0.875rem', fontWeight: isActive ? 600 : 400,
              textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden',
              transition: 'background 0.15s, color 0.15s', height: 'var(--nav-item-h)',
            })}>
<<<<<<< HEAD
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
=======
            <span className="shrink-0 relative">
              {item.icon}
              {item.href === '/patient/chat' && chatUnread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {chatUnread > 99 ? '99+' : chatUnread}
                </span>
              )}
            </span>
            {!collapsed && <span className="flex-1">{item.label}</span>}
            {!collapsed && item.href === '/patient/chat' && chatUnread > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {chatUnread > 99 ? '99+' : chatUnread}
              </span>
            )}
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 p-2" style={{ borderTop: '1px solid #ffffff1a' }}>
        <button onClick={signOut} title={collapsed ? 'Sign out' : undefined}
          className="sidebar-link flex items-center gap-3 w-full rounded-md cursor-pointer bg-transparent border-0 transition"
          style={{ padding: collapsed ? '0.65rem' : '0.6rem 0.75rem', justifyContent: collapsed ? 'center' : 'flex-start', color: 'var(--color-sidebar-text)', fontSize: '0.875rem', height: 'var(--nav-item-h)' }}>
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}

function PatientHeader({ onToggleSidebar }) {
  const { pathname } = useLocation()
  const navigate     = useNavigate()
  const title        = PATIENT_PAGE_TITLES[pathname] ?? 'Dashboard'
  const user         = authStore.getUser()
  const fullName     = user?.name ?? 'Patient'
  const initials     = fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen,   setNotifOpen]   = useState(false)
  const profileRef = useRef(null)
  const notifRef   = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const signOut  = () => { authStore.clear(); navigate('/login') }
  const iconBtn  = 'flex items-center justify-center w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer text-[#64748B] hover:bg-[#F8FAFB] transition'
  const dropdown = 'absolute top-[calc(100%+8px)] right-0 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-50 overflow-hidden'
  const menuItem = 'flex items-center gap-2 px-4 py-2 text-sm text-[#1E293B] no-underline bg-transparent hover:bg-[#F8FAFB] whitespace-nowrap w-full text-left transition cursor-pointer border-0'

  return (
    <header className="flex items-center justify-between shrink-0 sticky top-0 z-30 bg-white border-b border-[#E2E8F0]"
      style={{ height: 'var(--nav-top-h)', padding: '0 1.25rem', gap: '1rem' }}>
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className={iconBtn}><Menu size={20} /></button>
        <div className="hidden sm:block">
          <span className="font-semibold text-[#1E293B]" style={{ fontSize: '0.9375rem' }}>{title}</span>
        </div>
        <div className="sm:hidden"><Logo size={26} showName nameClass="text-[#001D39] text-sm" /></div>
      </div>

      <div className="flex items-center gap-1">
        <div ref={notifRef} className="relative">
          <button onClick={() => setNotifOpen(v => !v)} className={`${iconBtn} relative`}><Bell size={19} /></button>
          {notifOpen && (
            <div className={dropdown} style={{ width: 300 }}>
              <div className="px-4 py-3 border-b border-[#E2E8F0]">
                <span className="text-sm font-semibold text-[#1E293B]">Notifications</span>
              </div>
              <p className="text-center text-sm text-[#64748B] py-6 m-0">No new notifications</p>
            </div>
          )}
        </div>

        <div className="w-px h-7 bg-[#E2E8F0] mx-1" />

        <div ref={profileRef} className="relative">
          <button onClick={() => setProfileOpen(v => !v)}
            className="flex items-center gap-2 bg-transparent border-0 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-[#F8FAFB] transition">
            <div className="w-8 h-8 rounded-full bg-[#0A4174] text-white flex items-center justify-center text-xs font-bold shrink-0">{initials}</div>
            <div className="header-profile-text text-left leading-tight">
              <p className="m-0 text-sm font-semibold text-[#1E293B] whitespace-nowrap">{fullName}</p>
              <p className="m-0 text-xs text-[#64748B]">Patient</p>
            </div>
            <ChevronDown size={14} className="header-profile-text text-[#94A3B8]"
              style={{ transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {profileOpen && (
            <div className={dropdown} style={{ minWidth: 180 }}>
              <a href="/patient/settings" className={menuItem}><User size={14} /> My Profile</a>
              <a href="/patient/settings" className={menuItem}><Settings size={14} /> Settings</a>
              <div className="h-px bg-[#E2E8F0] my-1" />
              <button onClick={signOut} className={`${menuItem} text-[#DC2626]`}><LogOut size={14} /> Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default function PatientLayout() {
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < MOBILE_BP)
  const [isTablet,   setIsTablet]   = useState(window.innerWidth < TABLET_BP)
  const overlayRef = useRef(null)

  useEffect(() => {
    const handler = () => {
      const w = window.innerWidth
      setIsMobile(w < MOBILE_BP)
      setIsTablet(w < TABLET_BP)
      if (w >= TABLET_BP) { setMobileOpen(false); setCollapsed(false) }
      if (w >= MOBILE_BP && w < TABLET_BP) setCollapsed(true)
    }
    window.addEventListener('resize', handler)
    handler()
    return () => window.removeEventListener('resize', handler)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) setMobileOpen(p => !p)
    else setCollapsed(p => !p)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFB]">
      {isMobile && mobileOpen && (
        <div ref={overlayRef} onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/40 z-40" />
      )}
      <div className={isMobile
        ? `fixed top-0 left-0 h-full z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
        : 'relative flex-shrink-0'}>
        <PatientSidebar collapsed={!isMobile && (isTablet || collapsed)} onNavClick={isMobile ? () => setMobileOpen(false) : undefined} />
      </div>
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <PatientHeader onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto" style={{
          padding: isMobile ? 'var(--page-margin-mobile)' : isTablet ? 'var(--page-margin-tablet)' : 'var(--page-margin-desktop)',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
