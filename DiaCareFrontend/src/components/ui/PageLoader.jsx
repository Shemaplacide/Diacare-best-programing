import Logo from './Logo'

export default function PageLoader() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      backgroundColor: '#fff',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '1.5rem',
    }}>
      {/* Logo with pulse ring */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer pulse ring */}
        <span style={{
          position: 'absolute',
          width: '72px', height: '72px', borderRadius: '50%',
          border: '2px solid var(--color-primary-200)',
          animation: 'loaderPulse 1.6s ease-out infinite',
        }} />
        {/* Inner ring */}
        <span style={{
          position: 'absolute',
          width: '56px', height: '56px', borderRadius: '50%',
          border: '1.5px solid var(--color-primary-400)',
          animation: 'loaderPulse 1.6s ease-out infinite 0.3s',
        }} />
        <Logo size={38} showName={false} />
      </div>

      {/* Brand name */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-sans)', fontWeight: 800,
          fontSize: '1.25rem', letterSpacing: '-0.02em',
          color: 'var(--color-primary-900)', marginBottom: '0.25rem',
        }}>DiaCare</p>
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: '0.8rem',
          color: 'var(--color-text-subtle)', fontWeight: 400,
          letterSpacing: '0.04em',
        }}>Loading your experience…</p>
      </div>

      <style>{`
        @keyframes loaderPulse {
          0%   { transform: scale(0.85); opacity: 0.8; }
          60%  { transform: scale(1.15); opacity: 0.2; }
          100% { transform: scale(0.85); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
