import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { useAuth } from '../../contexts/AuthContext'
import ConfirmDialog from '../ui/ConfirmDialog'
import EnlaceForm from '../admin/EnlaceForm'
import SortableLinkCard from './SortableLinkCard'
import { supabase } from '../../supabaseClient'

export default function LinksPanel({ categoria, onRefresh, onClose }) {
  const { isAdmin, toast } = useAuth()
  const [addOpen,    setAddOpen]    = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [delTarget,  setDelTarget]  = useState(null)
  const [deleting,   setDeleting]   = useState(false)
  const [activeId,   setActiveId]   = useState(null)
  const [localLinks, setLocalLinks] = useState([])

  useEffect(() => {
    const sorted = [...(categoria?.enlaces ?? [])].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    setLocalLinks(sorted)
  }, [categoria])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 6 } }),
  )

  async function handleDragEnd(event) {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = localLinks.findIndex(l => l.id === active.id)
    const newIdx = localLinks.findIndex(l => l.id === over.id)
    const reordered = arrayMove(localLinks, oldIdx, newIdx)
    setLocalLinks(reordered)
    try {
      await Promise.all(
        reordered.map((link, idx) =>
          supabase.from('enlaces').update({ orden: idx * 10 }).eq('id', link.id)
        )
      )
    } catch {
      toast('Error al guardar el orden', 'error')
      setLocalLinks(localLinks)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    const { error } = await supabase.from('enlaces').delete().eq('id', delTarget.id)
    setDeleting(false)
    setDelTarget(null)
    if (error) {
      toast('Error al eliminar: ' + error.message, 'error')
    } else {
      toast(`"${delTarget.titulo}" eliminado`, 'success')
      onRefresh()
    }
  }

  const activeLink = activeId ? localLinks.find(l => l.id === activeId) : null

  return (
    <>
      <div className="links-panel">
        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem' }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '.95rem', color: '#1e40af', margin: 0, lineHeight: 1.3 }}>
              {categoria.titulo}
            </h3>
            {categoria.descripcion && (
              <p style={{ fontSize: '.775rem', color: '#64748b', margin: '.25rem 0 0', lineHeight: 1.5 }}>
                {categoria.descripcion}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexShrink: 0 }}>
            {isAdmin && (
              <button
                className="btn-primary"
                onClick={() => setAddOpen(true)}
                style={{ padding: '.38rem .85rem', fontSize: '.8rem', gap: '.35rem' }}
              >
                <Plus size={13} />
                Agregar enlace
              </button>
            )}
            <button
              onClick={onClose}
              title="Cerrar panel"
              style={{
                width: 30, height: 30, borderRadius: '.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(37,99,235,.1)', border: 'none',
                color: '#2563eb', cursor: 'pointer', transition: 'background .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,99,235,.1)'}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Contenido */}
        {localLinks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.75rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>🔗</div>
            <p style={{ color: '#64748b', fontWeight: 600, fontSize: '.875rem', margin: '0 0 .25rem' }}>
              Sin enlaces todavía
            </p>
            <p style={{ color: '#94a3b8', fontSize: '.8rem', margin: 0 }}>
              {isAdmin ? 'Haz clic en "Agregar enlace" para crear el primero.' : 'Contacta al administrador del portal.'}
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={e => setActiveId(e.active.id)}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={localLinks.map(l => l.id)} strategy={rectSortingStrategy}>
              <div className="links-sub-grid">
                {localLinks.map(enlace => (
                  <SortableLinkCard
                    key={enlace.id}
                    enlace={enlace}
                    onEdit={setEditTarget}
                    onDelete={setDelTarget}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeLink && (
                <div className="link-sub-card" style={{ boxShadow: '0 8px 24px rgba(37,99,235,.25)', opacity: 1, cursor: 'grabbing' }}>
                  <span className="link-sub-card__icon" style={{ background: '#dbeafe' }} />
                  <span style={{ flex: 1, fontWeight: 600, fontSize: '.855rem', color: '#0f172a' }}>
                    {activeLink.titulo}
                  </span>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <EnlaceForm isOpen={addOpen}       onClose={() => setAddOpen(false)}    categoriaId={categoria.id} onRefresh={onRefresh} />
      <EnlaceForm isOpen={!!editTarget}  onClose={() => setEditTarget(null)}  categoriaId={categoria.id} initialData={editTarget} onRefresh={onRefresh} />
      <ConfirmDialog isOpen={!!delTarget} onClose={() => setDelTarget(null)} onConfirm={handleDelete} title={delTarget?.titulo} loading={deleting} />
    </>
  )
}
