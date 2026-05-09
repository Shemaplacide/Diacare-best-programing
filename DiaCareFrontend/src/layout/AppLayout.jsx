import { useState, useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/ui/SideNav'
import Header  from '../components/ui/nav'

const TABLET_BP = 1024
const MOBILE_BP = 768

export default function AppLayout() {
  const [collapsed,    setCollapsed]    = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [isMobile,     setIsMobile]     = useState(window.innerWidth < MOBILE_BP)
  const [isTablet,     setIsTablet]     = useState(window.innerWidth < TABLET_BP)
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

  // Close mobile drawer on route change
  const closeMobile = () => setMobileOpen(false)

  const toggleSidebar = () => {
    if (isMobile) setMobileOpen(p => !p)
    else setCollapsed(p => !p)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFB]">

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          ref={overlayRef}
          onClick={closeMobile}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${isMobile
            ? `fixed top-0 left-0 h-full z-50 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'relative flex-shrink-0'
          }
        `}
      >
        <Sidebar
          collapsed={!isMobile && (isTablet || collapsed)}
          onNavClick={isMobile ? closeMobile : undefined}
        />
      </div>

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />

        <main
          className="flex-1 overflow-y-auto"
          style={{
            padding: isMobile
              ? 'var(--page-margin-mobile)'
              : isTablet
                ? 'var(--page-margin-tablet)'
                : 'var(--page-margin-desktop)',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
