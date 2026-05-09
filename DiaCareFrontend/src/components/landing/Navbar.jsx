import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, BookOpen, Users, HelpCircle, Stethoscope, MessageSquare, Menu, X } from 'lucide-react'
import Logo from '../ui/Logo'
import useWindowWidth from '../../hooks/useWindowWidth'

const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const NAV_LINKS = [
  { label: 'How it works', id: 'how-it-works' },
  { label: 'Features',     id: 'features' },
  { label: 'Testimonials', id: 'testimonials' },
  { label: 'Contact',      id: 'contact' },
]

const RESOURCES = [
  { icon: BookOpen,      label: 'Blog',          id: 'blog',         desc: 'Insights on diabetes care' },
  { icon: Stethoscope,   label: 'For Clinicians', id: 'how-it-works', desc: 'Tools built for care teams' },
  { icon: Users,         label: 'Testimonials',  id: 'testimonials', desc: 'Stories from real users' },
  { icon: MessageSquare, label: 'Contact',        id: 'contact',      desc: 'Get in touch with our team' },
  { icon: HelpCircle,    label: 'FAQ',            id: 'faq',          desc: 'Common questions answered' },
]

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [dropdown, setDropdown]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropRef = useRef(null)
  const width = useWindowWidth()
  const isMobile = width < 768

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on resize to desktop
  useEffect(() => { if (!isMobile) setMobileOpen(false) }, [isMobile])

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const linkColor = scrolled ? 'var(--color-text-muted)' : 'rgba(255,255,255,0.82)'

  const handleMobileNav = (id) => { scrollTo(id); setMobileOpen(false) }

  return (
    <>
      <header
        data-scrolled={String(scrolled)}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          height: 'var(--nav-top-h)',
          backgroundColor: scrolled || mobileOpen ? 'var(--color-surface)' : 'transparent',
          borderBottom: scrolled || mobileOpen ? '1px solid var(--color-border)' : '1px solid transparent',
          transition: 'background-color 0.3s ease, border-color 0.3s ease',
        }}
      >
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '0 var(--page-margin-desktop)',
          height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Logo size={34} showName nameClass="text-lg font-bold" color={scrolled || mobileOpen ? 'var(--color-text)' : '#fff'} />

          {/* Desktop nav */}
          {!isMobile && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
              {NAV_LINKS.map(({ label, id }) => (
                <button key={id} onClick={() => scrollTo(id)} className="nav-link"
                  style={{ color: linkColor, background: 'none', border: 'none', cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
              <div ref={dropRef} style={{ position: 'relative' }}>
                <button onClick={() => setDropdown(p => !p)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-md)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.875rem', fontWeight: 500, color: linkColor, transition: 'color 0.2s',
                }}>
                  Resources <ChevronDown size={13} style={{ transition: 'transform 0.2s', transform: dropdown ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                {dropdown && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)', boxShadow: '0 16px 48px rgba(0,29,57,0.12)',
                    padding: '0.5rem', minWidth: '260px', zIndex: 100,
                  }}>
                    {RESOURCES.map(({ icon: Icon, label, id, desc }) => (
                      <button key={label} onClick={() => { scrollTo(id); setDropdown(false) }} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                        padding: '0.75rem 0.875rem', borderRadius: 'var(--radius-lg)',
                        background: 'none', border: 'none', cursor: 'pointer',
                        width: '100%', textAlign: 'left', transition: 'background 0.15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{
                          width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-info-bg)', border: '1px solid var(--color-border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Icon size={14} color="var(--color-primary-800)" />
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.1rem' }}>{label}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          )}

          {/* Desktop CTA / Mobile hamburger */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {!isMobile && (
              <>
                <Link to="/login" style={{
                  padding: '0 1.25rem', height: 'var(--btn-h-sm)',
                  display: 'inline-flex', alignItems: 'center', borderRadius: 'var(--radius-md)',
                  border: `1px solid ${scrolled ? 'var(--color-border-strong)' : 'rgba(255,255,255,0.4)'}`,
                  color: scrolled ? 'var(--color-text)' : '#fff',
                  fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
                  transition: 'color 0.3s, border-color 0.3s',
                }}>Sign in</Link>
                <Link to="/register" style={{
                  padding: '0 1.25rem', height: 'var(--btn-h-sm)',
                  display: 'inline-flex', alignItems: 'center', borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-800)', color: '#fff',
                  fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none',
                  boxShadow: scrolled ? '0 2px 8px rgba(10,65,116,0.25)' : 'none',
                }}>Get started</Link>
              </>
            )}
            {isMobile && (
              <button onClick={() => setMobileOpen(p => !p)} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem',
                color: scrolled || mobileOpen ? 'var(--color-text)' : '#fff',
                display: 'flex', alignItems: 'center',
              }}>
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {isMobile && mobileOpen && (
        <div style={{
          position: 'fixed', top: 'var(--nav-top-h)', left: 0, right: 0, bottom: 0,
          backgroundColor: 'var(--color-surface)', zIndex: 49,
          display: 'flex', flexDirection: 'column',
          padding: '1.5rem var(--page-margin-desktop)',
          overflowY: 'auto',
        }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '2rem' }}>
            {NAV_LINKS.map(({ label, id }) => (
              <button key={id} onClick={() => handleMobileNav(id)} style={{
                textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                padding: '0.875rem 0', fontSize: '1.1rem', fontWeight: 600,
                color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)',
                fontFamily: 'var(--font-sans)',
              }}>{label}</button>
            ))}
          </nav>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/login" onClick={() => setMobileOpen(false)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: 'var(--btn-h-lg)', borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border-strong)',
              color: 'var(--color-text)', fontSize: '0.95rem', fontWeight: 500,
              textDecoration: 'none',
            }}>Sign in</Link>
            <Link to="/register" onClick={() => setMobileOpen(false)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: 'var(--btn-h-lg)', borderRadius: 'var(--radius-xl)',
              backgroundColor: 'var(--color-primary-800)', color: '#fff',
              fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none',
            }}>Get started free</Link>
          </div>
        </div>
      )}
    </>
  )
}
