import { useState } from 'react'
import { Activity, Bell, CalendarCheck, ClipboardList, FileText, HeartPulse, LineChart, Pill, ShieldCheck, Users } from 'lucide-react'
import Reveal from '../ui/Reveal'
import useWindowWidth from '../../hooks/useWindowWidth'

const FEATURES = {
  patient: [
    { icon: Activity,      title: 'Glucose tracking',  desc: 'Log readings and visualize trends with intelligent pattern detection.' },
    { icon: Bell,          title: 'Smart alerts',      desc: 'Know when your glucose goes out of range — before it matters.' },
    { icon: Pill,          title: 'Prescriptions',     desc: 'View active prescriptions, dosage, and refill history.' },
    { icon: CalendarCheck, title: 'Appointments',      desc: 'Book and track visits with your care team.' },
    { icon: HeartPulse,    title: 'Meal plans',        desc: 'Personalized plans built around your glucose targets.' },
    { icon: FileText,      title: 'Lab results',       desc: 'HbA1c, lipid panel, kidney function — all in one place.' },
  ],
  doctor: [
    { icon: Users,         title: 'Patient panel',     desc: 'Full list with status, last reading, and risk flags at a glance.' },
    { icon: LineChart,     title: 'Glucose data',      desc: 'Real-time and historical readings for every patient.' },
    { icon: Bell,          title: 'Critical alerts',   desc: 'Instant notifications for dangerous glucose levels.' },
    { icon: ClipboardList, title: 'Clinical notes',    desc: 'Structured notes tied to each patient visit.' },
    { icon: CalendarCheck, title: 'Schedule',          desc: 'Weekly calendar view with patient queue management.' },
    { icon: ShieldCheck,   title: 'Labs & reports',    desc: 'Order tests, review results, generate progress reports.' },
  ],
}

function AccentCard({ Icon, title, desc }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#fff', border: '1px solid var(--color-border)', borderTop: '3px solid var(--color-primary-600)', borderRadius: 'var(--radius-xl)', boxShadow: '0 4px 24px rgba(10,65,116,0.07)', height: '100%', boxSizing: 'border-box' }}>
      <span style={{ position: 'absolute', width: '160px', height: '160px', borderRadius: '50%', border: '1px solid rgba(10,65,116,0.07)', top: '-55px', right: '-55px', pointerEvents: 'none' }} />
      <span style={{ position: 'absolute', width: '100px', height: '100px', borderRadius: '50%', border: '1px solid rgba(10,65,116,0.05)', top: '-20px', right: '-20px', pointerEvents: 'none' }} />
      <span style={{ position: 'absolute', width: '90px', height: '90px', borderRadius: '50%', border: '1px solid rgba(73,118,159,0.08)', bottom: '-28px', left: '-28px', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '1.75rem', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-primary-200) 100%)', border: '1px solid var(--color-primary-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <Icon size={19} color="var(--color-primary-800)" />
        </div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>{title}</h3>
        <p style={{ font: 'var(--text-small)', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>{desc}</p>
      </div>
    </div>
  )
}

function LightCard({ Icon, title, desc }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', boxShadow: '0 2px 12px rgba(0,29,57,0.04)', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--color-info-bg) 0%, #fff 100%)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
        <Icon size={19} color="var(--color-primary-800)" />
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ font: 'var(--text-small)', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>{desc}</p>
    </div>
  )
}

export default function Features() {
  const [active, setActive] = useState('patient')
  const width = useWindowWidth()
  const isMobile = width < 640
  const isTablet = width >= 640 && width < 1024
  const cols = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'
  const padding = width < 768 ? '4rem' : '8rem'

  return (
    <section id="features" style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: `${padding} var(--page-margin-desktop)` }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ display: 'flex', flexDirection: width < 768 ? 'column' : 'row', alignItems: width < 768 ? 'flex-start' : 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', gap: '1.5rem' }}>
          <Reveal>
            <div>
              <p style={{ color: 'var(--color-primary-600)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Features</p>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>Built for your role</h2>
              <p style={{ font: 'var(--text-small)', color: 'var(--color-text-muted)', maxWidth: '360px', fontSize: '0.95rem' }}>Every tool purpose-built — no clutter, no compromise.</p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ display: 'inline-flex', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-full)', padding: '4px', border: '1px solid var(--color-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                {['patient', 'doctor'].map(role => (
                  <button key={role} onClick={() => setActive(role)} style={{ padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s', backgroundColor: active === role ? 'var(--color-primary-800)' : 'transparent', color: active === role ? '#fff' : 'var(--color-text-muted)' }}>
                    {role === 'patient' ? 'Patients' : 'Doctors'}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '1.25rem', alignItems: 'stretch' }}>
          {FEATURES[active].map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 70} style={{ height: '100%' }}>
              {i % 2 !== 0 ? <AccentCard Icon={Icon} title={title} desc={desc} /> : <LightCard Icon={Icon} title={title} desc={desc} />}
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}
