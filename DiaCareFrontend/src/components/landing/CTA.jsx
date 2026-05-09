import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import heroImg from '../../assets/hero.png'
import Reveal from '../ui/Reveal'

export default function CTA() {
  return (
    <section style={{
      position: 'relative',
      backgroundColor: 'var(--color-primary-900)',
      padding: '5rem var(--page-margin-desktop)',
      overflow: 'hidden',
    }}>

      {/* Faint bg image */}
      <img
        src={heroImg}
        alt=""
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          opacity: 0.08,
        }}
      />

      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: '720px', margin: '0 auto',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      }}>

        <Reveal delay={0}>
          <p style={{
            color: 'var(--color-primary-400)',
            fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            marginBottom: '1rem',
          }}>
            Start today
          </p>
        </Reveal>

        <Reveal delay={100}>
          <h2 style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
            fontWeight: 900, color: '#fff',
            lineHeight: 1.08, letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
          }}>
            Ready to take control of your diabetes?
          </h2>
        </Reveal>

        <Reveal delay={200}>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '1.05rem', lineHeight: 1.75,
            maxWidth: '680px', marginBottom: '2.5rem',
          }}>
            Join thousands of patients and doctors already using DiaCare to make smarter, faster, more confident decisions every day.
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              backgroundColor: 'var(--color-primary-400)',
              color: 'var(--color-primary-900)',
              fontWeight: 700, fontSize: '0.9rem',
              padding: '0 2rem', height: 'var(--btn-h-lg)',
              borderRadius: 'var(--radius-xl)', textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(123,189,232,0.25)',
            }}>
              Get started free <ArrowRight size={16} />
            </Link>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center',
              border: '2px solid rgba(255,255,255,0.25)',
              color: '#fff', fontWeight: 600, fontSize: '0.9rem',
              padding: '0 2rem', height: 'var(--btn-h-lg)',
              borderRadius: 'var(--radius-xl)', textDecoration: 'none',
            }}>
              Sign in
            </Link>
          </div>
        </Reveal>

      </div>
    </section>
  )
}
