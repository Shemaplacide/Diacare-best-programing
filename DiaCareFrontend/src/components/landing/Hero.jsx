import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import heroImg from '../../assets/hero.png'
import Reveal from '../ui/Reveal'
import useWindowWidth from '../../hooks/useWindowWidth'

export default function Hero() {
  const width = useWindowWidth()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024

  return (
    <section style={{
      position: 'relative',
      height: isMobile ? '80svh' : '100svh',
      minHeight: isMobile ? '500px' : '600px',
      overflow: 'hidden',
    }}>

      <img
        src={heroImg}
        alt="DiaCare"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
        }}
      />

      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: 'rgba(0, 29, 57, 0.58)',
      }} />

      <div style={{
        position: 'absolute', inset: 0, zIndex: 10,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', alignItems: 'center',
      }}>
        <div style={{
          maxWidth: '1200px', width: '100%', margin: '0 auto',
          padding: `0 ${isMobile ? 'var(--page-margin-mobile)' : 'var(--page-margin-desktop)'}`,
          paddingBottom: isMobile ? '3rem' : isTablet ? '4rem' : '7rem',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}>

          <Reveal delay={0}>
            <h1 style={{
              fontSize: isMobile ? 'clamp(2rem, 8vw, 2.75rem)' : 'clamp(2.5rem, 6vw, 5.5rem)',
              fontFamily: 'var(--font-sans)',
              fontWeight: 900, color: '#fff',
              lineHeight: 1.1, letterSpacing: '-0.03em',
              marginBottom: '1.25rem', maxWidth: '850px',
            }}>
              Your Glucose Patterns.{' '}
              <span style={{ color: 'var(--color-primary-400)' }}>Your Control.</span>
            </h1>
          </Reveal>

          <Reveal delay={150}>
            <p style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: isMobile ? '0.95rem' : '1.1rem', lineHeight: 1.75,
              maxWidth: '540px', marginBottom: isMobile ? '1.75rem' : '2.5rem',
            }}>
              Living with diabetes means making dozens of decisions every day. DiaCare gives you the clarity to make each one with confidence.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                backgroundColor: 'var(--color-primary-800)',
                color: '#fff',
                fontWeight: 700, fontSize: '0.9rem',
                padding: '0 2rem', height: 'var(--btn-h-lg)',
                borderRadius: 'var(--radius-xl)', textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(10,65,116,0.4)',
              }}>
                Get started free <ArrowRight size={16} />
              </Link>
              <a href="#how-it-works" style={{
                display: 'inline-flex', alignItems: 'center',
                border: '2px solid rgba(255,255,255,0.4)',
                color: '#fff', fontWeight: 600, fontSize: '0.9rem',
                padding: '0 2rem', height: 'var(--btn-h-lg)',
                borderRadius: 'var(--radius-xl)', textDecoration: 'none',
              }}>
                See how it works
              </a>
            </div>
          </Reveal>

        </div>
      </div>

    </section>
  )
}
