import { ShieldCheck } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminBanner() {
  const { isAdmin, user } = useAuth()
  if (!isAdmin) return null

  return (
    <div className="admin-banner" style={{ padding: '.4rem 1.75rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '.5rem',
        maxWidth: 1400,
        margin: '0 auto',
      }}>
        <ShieldCheck size={15} color="#fff" strokeWidth={2.5} />
        <span style={{ color: '#fff', fontSize: '.8rem', fontWeight: 600 }}>
          Modo Administrador activo — {user?.email}
        </span>
      </div>
    </div>
  )
}
