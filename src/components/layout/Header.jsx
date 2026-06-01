import { LogOut, Plus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import SearchBar from '../search/SearchBar'

export default function Header({ allEnlaces, onAddArea }) {
  const { user, isAdmin, signOut } = useAuth()

  return (
    <header className="portal-header">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '.85rem 1.75rem',
        maxWidth: 1400,
        margin: '0 auto',
      }}>
        {/* Logo + Título */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexShrink: 0 }}>
          <div style={{
            width: 38, height: 38,
            borderRadius: '.625rem',
            overflow: 'hidden',
            flexShrink: 0,
            border: '2px solid rgba(255,255,255,.25)',
          }}>
            <img
              src="/logo-suzuval.png"
              alt="Logo Suzuval"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
            />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
              Portal Suzuval
            </div>
            <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '.65rem', fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Centro de Aplicaciones
            </div>
          </div>
        </div>

        {/* Buscador centrado */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 1.5rem' }}>
          <SearchBar allEnlaces={allEnlaces} />
        </div>

        {/* Acciones derecha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexShrink: 0 }}>
          {/* Botón añadir área (solo admin) */}
          {isAdmin && (
            <button
              onClick={onAddArea}
              title="Nueva Área"
              style={{
                display: 'flex', alignItems: 'center', gap: '.4rem',
                padding: '.45rem .9rem',
                background: 'rgba(255,255,255,.15)',
                border: '1.5px solid rgba(255,255,255,.25)',
                borderRadius: '.625rem',
                color: '#fff', fontSize: '.8rem', fontWeight: 600,
                cursor: 'pointer',
                transition: 'background .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'}
            >
              <Plus size={14} />
              Añadir Área
            </button>
          )}

          {/* Avatar + email */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)' }}
              />
            ) : (
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: '.8rem',
              }}>
                {user?.email?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Sign out */}
          <button
            onClick={signOut}
            title="Cerrar sesión"
            style={{
              display: 'flex', alignItems: 'center',
              padding: '.45rem',
              background: 'transparent',
              border: 'none',
              borderRadius: '.5rem',
              color: 'rgba(255,255,255,.6)',
              cursor: 'pointer',
              transition: 'color .15s, background .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,.1)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.6)'; e.currentTarget.style.background = 'transparent' }}
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  )
}
