import { useEffect, useCallback } from 'react'
import { X } from 'lucide-react'

/**
 * Modal base reutilizable.
 * Props:
 *   isOpen   - boolean
 *   onClose  - función para cerrar
 *   title    - string (opcional)
 *   width    - clase Tailwind de ancho (default: 'w-full max-w-lg')
 *   children - contenido
 */
export default function Modal({ isOpen, onClose, title, width = 'w-full max-w-lg', children }) {
  // Cerrar con Escape
  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKey])

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`modal-box ${width}`} onClick={e => e.stopPropagation()}>
        {/* Header del modal */}
        {title && (
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-700 text-slate-800">{title}</h2>
            <button
              onClick={onClose}
              className="btn-icon text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
