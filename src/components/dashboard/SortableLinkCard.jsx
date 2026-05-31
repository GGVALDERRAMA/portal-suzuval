import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Trash2 } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { ArrowUpRight, ExternalLink } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function SortableLinkCard({ enlace, onEdit, onDelete, onContactClick }) {
  const { isAdmin } = useAuth()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: enlace.id })

  const wrapStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity:  isDragging ? 0.4 : 1,
    position: 'relative',
    zIndex:   isDragging ? 10 : 'auto',
  }

  const EnlaceIcon = LucideIcons[enlace.valor_icono] ?? ArrowUpRight
  const esContacto = enlace.tipo_enlace === 'contacto'

  function stopProp(e) { e.stopPropagation(); e.preventDefault() }

  const gripHandle = isAdmin && (
    <button
      {...attributes}
      {...listeners}
      className="link-drag-handle"
      title="Arrastrar para reordenar"
      tabIndex={-1}
      onClick={stopProp}
    >
      <GripVertical size={13} />
    </button>
  )

  const adminActions = isAdmin && (
    <div className="link-admin-actions">
      <button
        className="btn-icon"
        title="Editar enlace"
        onClick={e => { e.preventDefault(); e.stopPropagation(); onEdit(enlace) }}
        style={{ background: '#dbeafe', color: '#2563eb', width: 24, height: 24 }}
      >
        <Pencil size={10} />
      </button>
      <button
        className="btn-icon"
        title="Eliminar enlace"
        onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete(enlace) }}
        style={{ background: '#fee2e2', color: '#ef4444', width: 24, height: 24 }}
      >
        <Trash2 size={10} />
      </button>
    </div>
  )

  return (
    <div ref={setNodeRef} style={wrapStyle} className="link-card-wrap">
      {esContacto ? (
        <button
          className="link-sub-card"
          style={{ position: 'relative' }}
          onClick={e => {
            e.preventDefault()
            const rect = e.currentTarget.getBoundingClientRect()
            onContactClick({ anchor: rect, enlace })
          }}
        >
          {/* Grip dentro del botón para que hover funcione */}
          {gripHandle}
          <span className="link-sub-card__icon">
            <EnlaceIcon size={16} color="#2563eb" strokeWidth={1.75} />
          </span>
          <span style={{ flex: 1, fontWeight: 600, fontSize: '.855rem', lineHeight: 1.3, color: '#0f172a' }}>
            {enlace.titulo}
          </span>
          {adminActions}
        </button>
      ) : (
        <a
          href={enlace.url}
          target="_blank"
          rel="noopener noreferrer"
          className="link-sub-card"
          style={{ position: 'relative' }}
        >
          {/* Grip dentro del <a> para que hover funcione */}
          {gripHandle}
          <span className="link-sub-card__icon">
            <EnlaceIcon size={16} color="#2563eb" strokeWidth={1.75} />
          </span>
          <span style={{ flex: 1, fontWeight: 600, fontSize: '.855rem', lineHeight: 1.3, color: '#0f172a' }}>
            {enlace.titulo}
          </span>
          <ExternalLink size={12} style={{ color: '#cbd5e1', flexShrink: 0 }} />
          {adminActions}
        </a>
      )}
    </div>
  )
}
