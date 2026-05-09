import Reveal from '../ui/Reveal'
import useWindowWidth from '../../hooks/useWindowWidth'

const TESTIMONIALS = [
  { quote: "Before DiaCare, I had no idea what was causing my spikes. Now I can see exactly how my meals affect my glucose.", name: 'Marie K.', role: 'Type 2 patient' },
  { quote: "I manage over 80 patients. DiaCare shows me who needs attention today — I catch problems before they become emergencies.", name: 'Dr. James O.', role: 'Endocrinologist' },
  { quote: "Reporting that used to take days now takes minutes. The admin dashboard is exactly what our clinic needed.", name: 'Sandra T.', role: 'Clinic Administrator' },
]

export default function Testimonials() {
  const width = useWindowWidth()
  const isMobile = width < 640
  const isTablet = width >= 640 && width < 1024
  const cols = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'
  const padding = width < 768 ? '4rem' : width < 1024 ? '5rem' : '8rem'

  return (
    <section id="testimonials" style={{ backgroundColor: 'var(--color-bg)', padding: `${padding} var(--page-margin-desktop)` }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{ color: 'var(--color-primary-600)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Testimonials</p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1, letterSpacing: '-0.03em' }}>Trusted by patients & clinicians</h2>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '1.5rem', alignItems: 'stretch' }}>
          {TESTIMONIALS.map(({ quote, name, role }, i) => (
            <Reveal key={name} delay={i * 100} style={{ height: '100%' }}>
              <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-2xl)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%', boxSizing: 'border-box' }}>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '4rem', lineHeight: 0.8, color: 'var(--color-primary-400)', opacity: 0.6, userSelect: 'none' }}>"</span>
                <p style={{ fontSize: '1rem', color: 'var(--color-text)', lineHeight: 1.75, fontStyle: 'italic', flex: 1 }}>{quote}</p>
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.2rem' }}>{name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>{role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
