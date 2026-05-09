import { useEffect, useRef } from 'react'

export default function Reveal({ children, delay = 0, className = '', style = {} }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); observer.disconnect() } },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ ...(delay ? { transitionDelay: `${delay}ms` } : {}), ...style }}
    >
      {children}
    </div>
  )
}
