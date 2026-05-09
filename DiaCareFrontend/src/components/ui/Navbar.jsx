import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      height: 'var(--nav-top-h)',
      backgroundColor: scrolled ? 'var(--color-surface)' : 'transparent',
      borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 var(--page-margin-desktop)',
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo size={34} showName nameClass="text-lg font-bold" />

        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <a href="#how-it-works" className="nav-link" style={{ color: scrolled ? 'var(--color-text-muted)' : 'rgba(255,255,255,0.8)' }}>How it works</a>
          <a href="#features"     className="nav-link" style={{ color: scrolled ? 'var(--color-text-muted)' : 'rgba(255,255,255,0.8)' }}>Features</a>
        </nav>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/login" style={{
            padding: '0 1.25rem', height: 'var(--btn-h-sm)',
            display: 'inline-flex', alignItems: 'center',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${scrolled ? 'var(--color-border-strong)' : 'rgba(255,255,255,0.4)'}`,
            color: scrolled ? 'var(--color-text)' : '#fff',
            fontSize: '0.875rem', fontWeight: 500,
            textDecoration: 'none',
            transition: 'color 0.3s, border-color 0.3s',
          }}>Sign in</Link>
          <Link to="/register" style={{
            padding: '0 1.25rem', height: 'var(--btn-h-sm)',
            display: 'inline-flex', alignItems: 'center',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-800)',
            color: '#fff',
            fontSize: '0.875rem', fontWeight: 600,
            textDecoration: 'none',
          }}>Get started</Link>
        </div>
      </div>
    </header>
  )
}
