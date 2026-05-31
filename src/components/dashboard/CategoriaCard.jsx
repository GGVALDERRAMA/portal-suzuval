import { useState } from 'react'
import { Pencil, Trash2, ImagePlus, GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAuth } from '../../contexts/AuthContext'
import CategoriaIcon from '../ui/CategoriaIcon'
import ConfirmDialog from '../ui/ConfirmDialog'
import CategoriaForm from '../admin/CategoriaForm'
import IconPickerModal from '../admin/IconPickerModal'
import { supabase } from '../../supabaseClient'

export default function CategoriaCard({ categoria, isSelected, onCardClick, onRefresh }) {
  const { isAdmin, toast } = useAuth()
  const [editOpen,       setEditOpen]       = useState(false)
  const [confirmOpen,    setConfirmOpen]    = useState(false)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [deleting,       setDeleting]       = useState(false)

  // ── Sortable ───────────────────────────────────────────
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: categoria.id })

  const wrapStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity:  isDragging ? 0.4 : 1,
    position: 'relative',
    zIndex:   isDragging ? 20 : 'auto',
  }

  const enlaces = categoria.enlaces ?? []

  async function handleDelete() {
    setDeleting(true)
    const { error } = await supabase.from('categorias').delete().eq('id', categoria.id)
    setDeleting(false)
    setConfirmOpen(false)
    if (error) {
      toast('Error al eliminar la categoría: ' + error.message, 'error')
    } else {
      toast(`Categoría "${categoria.titulo}" eliminada`, 'success')
      onRefresh()
    }
  }

  function stopProp(e) { e.stopPropagation() }

  return (
    <>
      <div ref={setNodeRef} style={wrapStyle}>
        <div
          className={`cat-card p-4 ${isSelected ? 'selected' : ''}`}
          onClick={() => onCardClick(categoria.id)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onCardClick(categoria.id)}
          style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', minHeight: 130, position: 'relative' }}
        >
          {/* ── Grip handle (DENTRO del cat-card para que el hover funcione) */}
          {isAdmin && (
            <button
              {...attributes}
              {...listeners}
              className="cat-drag-handle"
              title="Arrastrar para reordenar"
              tabIndex={-1}
              onClick={stopProp}
            >
              <GripVertical size={14} />
            </button>
          )}

          {/* Ícono */}
          <div className="cat-card__icon-wrap" style={isSelected ? { background: '#bfdbfe' } : {}}>
            <CategoriaIcon tipoIcono={categoria.tipo_icono} valorIcono={categoria.valor_icono} />
          </div>

          {/* Texto */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontWeight: 700, fontSize: '.9rem', lineHeight: 1.3,
              color: isSelected ? '#1e40af' : '#0f172a',
              marginBottom: '.2rem',
            }}>
              {categoria.titulo}
            </div>
            {categoria.descripcion && (
              <div style={{ fontSize: '.775rem', color: '#64748b', lineHeight: 1.5 }}>
                {categoria.descripcion}
              </div>
            )}
          </div>

          {/* Badge de enlaces */}
          <div style={{
            fontSize: '.7rem', fontWeight: 500,
            color: isSelected ? '#2563eb' : (enlaces.length === 0 && isAdmin ? '#f59e0b' : '#94a3b8'),
          }}>
            {isSelected
              ? '▲ Abierto'
              : enlaces.length === 0
                ? (isAdmin ? '＋ Sin enlaces' : 'Sin enlaces')
                : `${enlaces.length} ${enlaces.length === 1 ? 'enlace' : 'enlaces'}`
            }
          </div>

          {/* Botones admin */}
          {isAdmin && (
            <div className="admin-card-actions" onClick={stopProp}>
              <button
                className="btn-icon"
                title="Cambiar ícono"
                onClick={() => setIconPickerOpen(true)}
                style={{ background: '#dcfce7', color: '#16a34a' }}
              >
                <ImagePlus size={12} />
              </button>
              <button
                className="btn-icon"
                title="Editar categoría"
                onClick={() => setEditOpen(true)}
                style={{ background: '#dbeafe', color: '#2563eb' }}
              >
                <Pencil size={12} />
              </button>
              <button
                className="btn-icon"
                title="Eliminar categoría"
                onClick={() => setConfirmOpen(true)}
                style={{ background: '#fee2e2', color: '#ef4444' }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      <IconPickerModal
        isOpen={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        categoria={categoria}
        onRefresh={onRefresh}
      />
      <CategoriaForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        areaId={categoria.area_id}
        initialData={categoria}
        onRefresh={onRefresh}
      />
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title={categoria.titulo}
        loading={deleting}
      />
    </>
  )
}
