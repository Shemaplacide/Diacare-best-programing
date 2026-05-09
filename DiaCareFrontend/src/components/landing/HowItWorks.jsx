import { useState } from 'react'
import { UserRound, ClipboardList, Bell, ShieldCheck, LineChart, HeartPulse } from 'lucide-react'
import heroImg from '../../assets/hero.png'
import Reveal from '../ui/Reveal'
import useWindowWidth from '../../hooks/useWindowWidth'

const FLOWS = {
  patient: [
    { icon: UserRound,  step: '01', title: 'Create account',     desc: 'Sign up in minutes. Share your diabetes type, medications, and health goals.' },
    { icon: HeartPulse, step: '02', title: 'Meet your doctor',   desc: 'Get linked to your care team. They can view your data and adjust your plan in real time.', dark: true },
    { icon: LineChart,  step: '03', title: 'Track your glucose', desc: 'Log readings and meals. DiaCare surfaces patterns so you always know where you stand.' },
  ],
  doctor: [
    { icon: ShieldCheck,   step: '01', title: 'Register & verify', desc: 'Create your account, pick your specialization, and get verified before going live.' },
    { icon: ClipboardList, step: '02', title: 'Manage patients',   desc: 'View glucose logs, labs, prescriptions, and meal plans — all in one place.', dark: true },
    { icon: Bell,          step: '03', title: 'Monitor & act',     desc: 'Get alerts on critical readings. Track trends and schedule follow-ups from your dashboard.' },
  ],
}

function DarkStepCard({ Icon, step, title, desc }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-2xl)', height: '100%', boxSizing: 'border-box' }}>
      <img src={heroImg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,29,57,0.80)' }} />
      <span style={{ position: 'absolute', top: '-0.5rem', right: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '5rem', fontWeight: 800, color: 'rgba(255,255,255,0.08)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>{step}</span>
      <div style={{ position: 'relative', zIndex: 1, padding: '2rem', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <Icon size={22} color="var(--color-primary-400)" />
        </div>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--color-primary-400)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Step {step}</p>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.6rem', lineHeight: 1.3 }}>{title}</h3>
        <p style={{ font: 'var(--text-small)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{desc}</p>
      </div>
    </div>
  )
}

function LightStepCard({ Icon, step, title, desc }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderTop: '3px solid var(--color-primary-800)', borderRadius: 'var(--radius-2xl)', padding: '2rem', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,29,57,0.06)', height: '100%', boxSizing: 'border-box' }}>
      <span style={{ position: 'absolute', top: '-0.5rem', right: '1.25rem', fontFamily: 'var(--font-mono)', fontSize: '5rem', fontWeight: 800, color: 'var(--color-border)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>{step}</span>
      <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-primary-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
        <Icon size={22} color="#fff" />
      </div>
      <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--color-primary-600)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Step {step}</p>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.6rem', lineHeight: 1.3 }}>{title}</h3>
      <p style={{ font: 'var(--text-small)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{desc}</p>
    </div>
  )
}

export default function HowItWorks() {
  const [active, setActive] = useState('patient')
  const width = useWindowWidth()
  const isMobile = width < 640
  const isTablet = width >= 640 && width < 1024
  const padding = width < 768 ? '4rem' : width < 1024 ? '5rem' : '8rem'
  const cols = isMobile ? '1fr' : 'repeat(3, 1fr)'

  return (
    <section id="how-it-works" style={{ backgroundColor: 'var(--color-bg)', padding: `${padding} var(--page-margin-desktop)` }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', gap: '1.5rem' }}>
          <Reveal>
            <div>
              <p style={{ color: 'var(--color-primary-600)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>How it works</p>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>First reading to full control</h2>
              <p style={{ font: 'var(--text-small)', color: 'var(--color-text-muted)', maxWidth: '380px', fontSize: '0.95rem' }}>Three steps — whether you're managing your health or caring for others.</p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ display: 'inline-flex', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-full)', padding: '4px', border: '1px solid var(--color-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
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
          {FLOWS[active].map((s, i) => (
            <Reveal key={s.step} delay={i * 120} style={{ height: '100%' }}>
              {s.dark ? <DarkStepCard Icon={s.icon} step={s.step} title={s.title} desc={s.desc} /> : <LightStepCard Icon={s.icon} step={s.step} title={s.title} desc={s.desc} />}
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}
