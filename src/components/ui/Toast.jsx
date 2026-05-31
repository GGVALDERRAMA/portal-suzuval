import { useAuth } from '../../contexts/AuthContext'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  info:    Info,
}

export default function Toast() {
  const { toasts } = useAuth()

  return (
    <div className="toast-container">
      {toasts.map(t => {
        const Icon = ICONS[t.type] ?? Info
        return (
          <div key={t.id} className={`toast toast-${t.type} ${t.exiting ? 'exit' : ''}`}>
            <Icon size={18} strokeWidth={2.5} style={{ flexShrink: 0 }} />
            <span>{t.message}</span>
          </div>
        )
      })}
    </div>
  )
}
