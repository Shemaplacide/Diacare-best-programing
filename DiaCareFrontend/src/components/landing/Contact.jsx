import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import heroImg from '../../assets/hero.png'
import Reveal from '../ui/Reveal'
import useWindowWidth from '../../hooks/useWindowWidth'

const CONTACT_INFO = [
  { icon: Mail,   label: 'Email us',   value: 'hello@diacare.io',  sub: 'We reply within 24 hours' },
  { icon: Phone,  label: 'Call us',    value: '+1 (800) 342-2273', sub: 'Mon–Fri, 9am–6pm EST' },
  { icon: MapPin, label: 'Our office', value: 'Kigali, Rwanda',    sub: 'KG 123 St, Gasabo' },
]

const SOCIALS = [
  {
    label: 'Twitter / X',
    href: 'https://twitter.com/diacare',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/diacare',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/diacare',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/diacare',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
  },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const width = useWindowWidth()
  const isMobile = width < 768
  const isTablet = width >= 768 && width < 1024
  const padding = isMobile ? '4rem' : isTablet ? '5rem' : '8rem'

  const handle = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))
  const handleSubmit = (e) => { e.preventDefault(); setSent(true) }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    height: '42px', padding: '0 0.875rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem', fontFamily: 'var(--font-sans)',
    color: 'var(--color-text)', backgroundColor: '#fff',
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  return (
    <section id="contact" style={{
      backgroundColor: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      padding: `${padding} var(--page-margin-desktop)`,
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        <Reveal>
          <div style={{ marginBottom: '4rem' }}>
            <p style={{
              color: 'var(--color-primary-600)', fontSize: '0.72rem', fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.75rem',
            }}>Contact</p>
            <h2 style={{
              fontSize: 'clamp(2.25rem, 4vw, 3rem)', fontWeight: 800,
              color: 'var(--color-text)', lineHeight: 1.1, letterSpacing: '-0.03em',
              marginBottom: '0.75rem',
            }}>Get in touch</h2>
            <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', maxWidth: '400px', lineHeight: 1.7 }}>
              Have a question or want to learn more? We'd love to hear from you.
            </p>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.6fr', gap: '2rem', alignItems: 'stretch' }}>

          {/* Left — dark filled panel */}
          <Reveal delay={0} style={{ height: '100%' }}>
            <div style={{
              position: 'relative', overflow: 'hidden',
              borderRadius: 'var(--radius-2xl)',
              height: '100%', boxSizing: 'border-box',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* bg image + overlay */}
              <img src={heroImg} alt="" style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center',
              }} />
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,29,57,0.88)' }} />

              {/* Decorative circles */}
              <span style={{ position: 'absolute', width: '260px', height: '260px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)', top: '-80px', right: '-80px', pointerEvents: 'none' }} />
              <span style={{ position: 'absolute', width: '160px', height: '160px', borderRadius: '50%', border: '1px solid rgba(123,189,232,0.08)', bottom: '-40px', left: '-40px', pointerEvents: 'none' }} />

              <div style={{
                position: 'relative', zIndex: 1,
                padding: '2.5rem', display: 'flex', flexDirection: 'column',
                height: '100%', boxSizing: 'border-box',
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{
                    color: 'var(--color-primary-400)', fontSize: '0.72rem', fontWeight: 700,
                    letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.75rem',
                  }}>Reach us</p>
                  <h3 style={{
                    fontSize: '1.5rem', fontWeight: 800, color: '#fff',
                    lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: '0.75rem',
                  }}>We're here<br />to help</h3>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: '2rem' }}>
                    Our team is available to answer your questions and support your care journey.
                  </p>

                  {/* Contact info items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {CONTACT_INFO.map(({ icon: Icon, label, value, sub }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: 'var(--radius-md)', flexShrink: 0,
                          backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon size={15} color="var(--color-primary-400)" />
                        </div>
                        <div>
                          <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.15rem' }}>{label}</p>
                          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', marginBottom: '0.1rem' }}>{value}</p>
                          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social icons */}
                <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '1rem' }}>Follow us</p>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {SOCIALS.map(({ label, href, icon }) => (
                      <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} style={{
                        width: '38px', height: '38px', borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'rgba(255,255,255,0.65)', textDecoration: 'none',
                        transition: 'background-color 0.2s, color 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(123,189,232,0.18)'; e.currentTarget.style.color = 'var(--color-primary-400)' }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
                      >
                        {icon}
                      </a>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </Reveal>

          {/* Right — form */}
          <Reveal delay={150} style={{ height: '100%' }}>
            {sent ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '4rem 2rem', textAlign: 'center', height: '100%', boxSizing: 'border-box',
                backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-2xl)', gap: '1rem',
              }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  backgroundColor: 'var(--color-success-bg)', border: '1px solid #bbf7d0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Send size={22} color="var(--color-success)" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)' }}>Message sent!</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', maxWidth: '280px', lineHeight: 1.65 }}>
                  Thanks for reaching out. We'll get back to you within 24 hours.
                </p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }} style={{
                  marginTop: '0.5rem', padding: '0 1.5rem', height: '38px',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                  backgroundColor: '#fff', fontSize: '0.875rem', fontWeight: 500,
                  color: 'var(--color-text-muted)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                }}>Send another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{
                backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-2xl)', padding: '2.5rem',
                display: 'flex', flexDirection: 'column', gap: '1.25rem',
                height: '100%', boxSizing: 'border-box',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text)' }}>Full name</label>
                    <input style={inputStyle} placeholder="Jane Smith" value={form.name} onChange={handle('name')} required
                      onFocus={e => { e.target.style.borderColor = 'var(--color-primary-600)'; e.target.style.boxShadow = '0 0 0 3px var(--color-primary-50)' }}
                      onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text)' }}>Email</label>
                    <input type="email" style={inputStyle} placeholder="you@example.com" value={form.email} onChange={handle('email')} required
                      onFocus={e => { e.target.style.borderColor = 'var(--color-primary-600)'; e.target.style.boxShadow = '0 0 0 3px var(--color-primary-50)' }}
                      onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text)' }}>Subject</label>
                  <input style={inputStyle} placeholder="How can we help?" value={form.subject} onChange={handle('subject')} required
                    onFocus={e => { e.target.style.borderColor = 'var(--color-primary-600)'; e.target.style.boxShadow = '0 0 0 3px var(--color-primary-50)' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text)' }}>Message</label>
                  <textarea rows={6}
                    style={{ ...inputStyle, height: '100%', minHeight: '140px', padding: '0.75rem 0.875rem', resize: 'none', lineHeight: 1.6 }}
                    placeholder="Tell us more about your question or project…"
                    value={form.message} onChange={handle('message')} required
                    onFocus={e => { e.target.style.borderColor = 'var(--color-primary-600)'; e.target.style.boxShadow = '0 0 0 3px var(--color-primary-50)' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none' }} />
                </div>

                <button type="submit" style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  height: 'var(--btn-h-md)', borderRadius: 'var(--radius-xl)',
                  backgroundColor: 'var(--color-primary-800)', color: '#fff',
                  fontSize: '0.9rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)', boxShadow: '0 4px 16px rgba(10,65,116,0.25)',
                }}>
                  Send message <Send size={15} />
                </button>
              </form>
            )}
          </Reveal>

        </div>
      </div>
    </section>
  )
}
