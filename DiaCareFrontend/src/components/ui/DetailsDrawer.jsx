import { X } from 'lucide-react'

export default function DetailsDrawer({ open, onClose, title, subtitle, icon, hero, profile, sections = [], footer, children }) {
  if (!open) return null

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: '#00000040', zIndex: 60 }} />

      <div style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 'min(440px, 100vw)', backgroundColor: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)', zIndex: 70, display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px #00000014' }}>

        {hero && (
          <div style={{ position: 'relative', height: 200, flexShrink: 0, overflow: 'hidden' }}>
            <img src={hero} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #00000070 0%, transparent 50%)' }} />
            <button onClick={onClose} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '7px', border: 'none', backgroundColor: '#00000050', cursor: 'pointer', color: '#fff', backdropFilter: 'blur(4px)' }}>
              <X size={15} />
            </button>
          </div>
        )}

        {!hero && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
            {icon && (
              <div style={{ width: '38px', height: '38px', borderRadius: '9px', backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {icon}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</p>
              {subtitle && <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{subtitle}</p>}
            </div>
            <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '7px', border: '1px solid var(--color-border)', background: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', flexShrink: 0 }}>
              <X size={15} />
            </button>
          </div>
        )}

        {hero && (
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)' }}>{title}</p>
            {subtitle && <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{subtitle}</p>}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {profile && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${profile.length}, 1fr)`, gap: '0.65rem' }}>
              {profile.map((stat, i) => (
                <div key={i} style={{ backgroundColor: 'var(--color-bg-muted)', border: '1px solid var(--color-border)', borderRadius: '9px', padding: '0.75rem 1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '1.25rem', fontWeight: 700, color: stat.color ?? 'var(--color-text)' }}>{stat.value}</p>
                  {stat.sub && <p style={{ margin: '0.1rem 0 0', fontSize: '0.7rem', color: 'var(--color-text-subtle)' }}>{stat.sub}</p>}
                </div>
              ))}
            </div>
          )}

          {sections.map((section, si) => (
            <div key={si}>
              {section.heading && (
                <p style={{ margin: '0 0 0.6rem', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {section.heading}
                </p>
              )}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: '9px', overflow: 'hidden' }}>
                {section.rows.map((row, ri) => (
                  <div
                    key={ri}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.65rem 1rem', borderBottom: ri < section.rows.length - 1 ? '1px solid var(--color-border)' : 'none', backgroundColor: ri % 2 !== 0 ? 'var(--color-bg-subtle)' : 'transparent' }}
                  >
                    <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text)', textAlign: 'right' }}>{row.value ?? '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {children}
        </div>

        {footer && (
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.65rem', flexWrap: 'wrap', flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>
    </>
  )
}

export const drawerPrimaryBtn = (color = 'var(--color-primary-800)') => ({
  display: 'flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
  backgroundColor: color, color: '#fff',
  fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit',
})

export const drawerOutlineBtn = (color = 'var(--color-text-muted)') => ({
  display: 'flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.5rem 1rem', borderRadius: '8px',
  border: `1px solid ${color}30`, backgroundColor: 'transparent',
  color, fontWeight: 500, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'inherit',
})
