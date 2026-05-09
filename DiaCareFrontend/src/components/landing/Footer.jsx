import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'
import { BRAND } from '../../constants/auth'
import useWindowWidth from '../../hooks/useWindowWidth'

const LINKS = {
  Product: ['Features', 'How it works', 'Blog', 'Pricing'],
  Company: ['About us', 'Careers', 'Contact', 'Press'],
  Legal:   ['Privacy policy', 'Terms of service', 'Cookie policy'],
}

export default function Footer() {
  const width = useWindowWidth()
  const isMobile = width < 640
  const isTablet = width >= 640 && width < 1024

  return (
    <footer style={{ backgroundColor: 'var(--color-primary-900)', padding: `3.5rem var(--page-margin-desktop) 2rem` }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : isTablet ? '1fr 1fr 1fr' : '2fr 1fr 1fr 1fr',
          gap: isMobile ? '2rem' : '3rem',
          marginBottom: '3rem',
        }}>
          <div>
            <Logo size={32} showName nameClass="text-lg font-bold" color="#fff" />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.75, marginTop: '1rem', maxWidth: '280px' }}>{BRAND.sub}</p>
          </div>
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <p style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>{group}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {items.map(item => (
                  <li key={item}>
                    <a href="#" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                    >{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem',
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between', gap: '1rem',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {['Privacy', 'Terms', 'Cookies'].map(item => (
              <a key={item} href="#" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              >{item}</a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}
