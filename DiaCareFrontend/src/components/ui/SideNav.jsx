import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { ADMIN_NAV } from '../../constants/nav'
import Logo from './Logo'
import { useSignOut } from '../../utils/useSignOut'
<<<<<<< HEAD

export default function Sidebar({ collapsed, onNavClick }) {
  const signOut = useSignOut()
=======
import { useChatUnread } from '../../hooks/useChatUnread'

export default function Sidebar({ collapsed, onNavClick }) {
  const signOut    = useSignOut()
  const chatUnread = useChatUnread()
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-200 overflow-hidden"
      style={{
        width: collapsed ? '64px' : 'var(--sidebar-w)',
        minWidth: collapsed ? '64px' : 'var(--sidebar-w)',
        backgroundColor: 'var(--color-sidebar-bg)',
      }}
    >
      <div className="flex items-center gap-3 shrink-0 overflow-hidden"
        style={{ height: 'var(--nav-top-h)', padding: '0 1rem', borderBottom: '1px solid #ffffff1a' }}>
        <Logo size={32} showName={!collapsed} nameClass="text-white text-base" />
      </div>

      <nav className="flex-1 flex flex-col gap-0.5 p-2 overflow-y-auto overflow-x-hidden">
        {ADMIN_NAV.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end ?? false}
            title={collapsed ? item.label : undefined}
            className="sidebar-link"
            onClick={onNavClick}
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
              transition: 'background 0.15s, color 0.15s',
              height: 'var(--nav-item-h)',
            })}
          >
<<<<<<< HEAD
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
=======
            <span className="shrink-0 relative">
              {item.icon}
              {item.href === '/chat' && chatUnread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {chatUnread > 99 ? '99+' : chatUnread}
                </span>
              )}
            </span>
            {!collapsed && <span className="flex-1">{item.label}</span>}
            {!collapsed && item.href === '/chat' && chatUnread > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {chatUnread > 99 ? '99+' : chatUnread}
              </span>
            )}
>>>>>>> 1729564dac2176c3a5655aceb9823bf29bd8e4f9
          </NavLink>
        ))}
      </nav>

      <div className="shrink-0 p-2" style={{ borderTop: '1px solid #ffffff1a' }}>
        <button
          onClick={signOut}
          title={collapsed ? 'Sign out' : undefined}
          className="sidebar-link flex items-center gap-3 w-full rounded-md cursor-pointer bg-transparent border-0 transition"
          style={{
            padding: collapsed ? '0.65rem' : '0.6rem 0.75rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
            color: 'var(--color-sidebar-text)', fontSize: '0.875rem',
            height: 'var(--nav-item-h)',
          }}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}
