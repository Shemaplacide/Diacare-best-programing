import { useEffect, useRef } from 'react'
import useWindowWidth from '../../hooks/useWindowWidth'

const STATS = [
  { end: 2400, suffix: '+',  label: 'Patients managed',   sub: 'and growing' },
  { end: 98,   suffix: '%',  label: 'Alert accuracy',     sub: 'clinically validated' },
  { end: 24,   suffix: '/7', label: 'Real-time sync',     sub: 'zero downtime' },
  { end: 40,   suffix: '+',  label: 'Specialist doctors', sub: 'across 12 specialties' },
]

function CountUp({ end, suffix, duration = 1800 }) {
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const startTime = performance.now()
        const tick = (now) => {
          const progress = Math.min((now - startTime) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          el.textContent = Math.floor(eased * end).toLocaleString() + suffix
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        observer.disconnect()
      }
    }, { threshold: 0.4 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [end, suffix, duration])

  return (
    <span ref={ref} style={{
      fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: 700,
      color: 'var(--color-primary-800)', lineHeight: 1,
      marginBottom: '0.5rem', letterSpacing: '-0.02em', display: 'block',
    }}>0{suffix}</span>
  )
}

export default function Stats() {
  const width = useWindowWidth()
  const isMobile = width < 640
  const isTablet = width >= 640 && width < 1024

  return (
    <section style={{
      backgroundColor: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      borderBottom: '1px solid var(--color-border)',
      padding: `3rem var(--page-margin-desktop)`,
    }}>
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: isMobile ? '2rem 0' : '0',
      }}>
        {STATS.map((s, i) => (
          <div key={s.label} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', padding: '0 1.5rem',
            borderLeft: isMobile
              ? (i % 2 !== 0 ? '1px solid var(--color-border)' : 'none')
              : (i > 0 ? '1px solid var(--color-border)' : 'none'),
          }}>
            <CountUp end={s.end} suffix={s.suffix} />
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.25rem' }}>{s.label}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-subtle)', fontWeight: 400 }}>{s.sub}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
