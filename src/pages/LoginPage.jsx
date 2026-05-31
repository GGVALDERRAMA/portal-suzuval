import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="login-bg">
      {/* Fondo decorativo */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,.18) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', right: '-5%',
          width: 600, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,.12) 0%, transparent 70%)',
        }} />
      </div>

      <div className="login-card" style={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{
          width: 68, height: 68,
          background: 'linear-gradient(135deg, #0f2044 0%, #1e3a6e 100%)',
          borderRadius: '1.1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 8px 24px rgba(15,32,68,.25)',
        }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.9"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.6"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.6"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.3"/>
          </svg>
        </div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 .4rem' }}>
          Portal Suzuval
        </h1>
        <p style={{ color: '#64748b', fontSize: '.875rem', margin: '0 0 2rem', lineHeight: 1.5 }}>
          Centro de Aplicaciones Corporativas.<br />
          Acceso exclusivo para colaboradores Suzuval.
        </p>

        {/* Botón Google */}
        <button
          onClick={signInWithGoogle}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '.75rem',
            padding: '.85rem 1.5rem',
            background: '#fff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '.875rem',
            fontSize: '.9rem',
            fontWeight: 600,
            color: '#334155',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,.06)',
            transition: 'box-shadow .2s, border-color .2s, transform .1s',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.1)'
            e.currentTarget.style.borderColor = '#cbd5e1'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.06)'
            e.currentTarget.style.borderColor = '#e2e8f0'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(.98)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {/* Google SVG logo */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Iniciar sesión con Google
        </button>

        <p style={{ marginTop: '1.5rem', fontSize: '.75rem', color: '#94a3b8', lineHeight: 1.5 }}>
          Solo se permiten cuentas <strong>@suzuval.cl</strong>.<br />
          Si tu cuenta es de otro dominio, el acceso será denegado.
        </p>
      </div>
    </div>
  )
}
