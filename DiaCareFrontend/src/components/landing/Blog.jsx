import { ArrowRight } from 'lucide-react'
import Reveal from '../ui/Reveal'
import useWindowWidth from '../../hooks/useWindowWidth'

const POSTS = [
  { tag: 'Nutrition',  title: 'Meal timing and your glucose',  excerpt: 'When you eat matters almost as much as what you eat — especially for managing post-meal spikes.', date: 'May 12, 2025', readTime: '4 min' },
  { tag: 'Clinical',   title: 'HbA1c vs daily readings',       excerpt: 'Understanding the difference helps you have better, more productive conversations with your doctor.', date: 'Apr 28, 2025', readTime: '5 min' },
  { tag: 'Technology', title: 'Is a CGM right for you?',       excerpt: 'Continuous glucose monitors are more accessible than ever — but they are not for everyone.', date: 'Apr 10, 2025', readTime: '6 min' },
]

export default function Blog() {
  const width = useWindowWidth()
  const isMobile = width < 640
  const isTablet = width >= 640 && width < 1024
  const cols = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'
  const padding = width < 768 ? '4rem' : width < 1024 ? '5rem' : '6rem'

  return (
    <section id="blog" style={{ backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: `${padding} var(--page-margin-desktop)` }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ color: 'var(--color-primary-600)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>From the blog</p>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.15, letterSpacing: '-0.02em' }}>Insights for better care</h2>
            </div>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary-800)', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}>
              View all <ArrowRight size={14} />
            </a>
          </div>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: cols, gap: '1.25rem' }}>
          {POSTS.map(({ tag, title, excerpt, date, readTime }, i) => (
            <Reveal key={title} delay={i * 100}>
              <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '140px', backgroundColor: 'var(--color-primary-900)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'var(--color-primary-400)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{tag}</span>
                </div>
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                  <h3 style={{ font: 'var(--text-h3)', color: 'var(--color-text)', lineHeight: 1.35 }}>{title}</h3>
                  <p style={{ font: 'var(--text-small)', color: 'var(--color-text-muted)', lineHeight: 1.6, flex: 1 }}>{excerpt}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                    <span style={{ font: 'var(--text-micro)', color: 'var(--color-text-subtle)' }}>{date} · {readTime}</span>
                    <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary-800)', fontWeight: 600, fontSize: '0.78rem', textDecoration: 'none' }}>Read <ArrowRight size={12} /></a>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
