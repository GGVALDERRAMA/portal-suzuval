import { useState, useEffect } from 'react'
import { ChevronDown, Pencil, Trash2, Plus, GripVertical } from 'lucide-react'
import {
  DndContext, closestCenter,
  PointerSensor, TouchSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAuth } from '../../contexts/AuthContext'
import CategoriaCard from './CategoriaCard'
import LinksPanel from './LinksPanel'
import ConfirmDialog from '../ui/ConfirmDialog'
import AreaForm from '../admin/AreaForm'
import CategoriaForm from '../admin/CategoriaForm'
import { supabase } from '../../supabaseClient'

export default function AreaSection({ area, onRefresh }) {
  const { isAdmin, toast } = useAuth()

  // ── Sortable (para el DnD de áreas en DashboardPage) ──
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: area.id })

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    position: 'relative',
    zIndex: isDragging ? 30 : 'auto',
  }

  // Estado de colapso — persistido en localStorage por área
  const storageKey = `portal-area-collapsed-${area.id}`
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(storageKey) === 'true'
  })

  // Categoría seleccionada (para LinksPanel inline)
  const [selectedCatId, setSelectedCatId] = useState(null)

  // Modales admin del área
  const [editOpen, setEditOpen]       = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [addCatOpen, setAddCatOpen]   = useState(false)
  const [deleting, setDeleting]       = useState(false)

  // Estado local ordenado — optimistic DnD
  const rawCats = area.categorias ?? []
  const [localCats, setLocalCats] = useState(() =>
    [...rawCats].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
  )
  useEffect(() => {
    setLocalCats([...( area.categorias ?? [])].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)))
  }, [area.categorias])

  const selectedCat = localCats.find(c => c.id === selectedCatId) ?? null

  // ── Sensores DnD ──────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 6 } }),
  )
  const [activeCatId, setActiveCatId] = useState(null)

  function handleCatDragStart(event) { setActiveCatId(event.active.id) }

  async function handleCatDragEnd(event) {
    setActiveCatId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIdx = localCats.findIndex(c => c.id === active.id)
    const newIdx = localCats.findIndex(c => c.id === over.id)
    const reordered = arrayMove(localCats, oldIdx, newIdx)
    setLocalCats(reordered)

    try {
      await Promise.all(
        reordered.map((cat, idx) =>
          supabase.from('categorias').update({ orden: idx * 10 }).eq('id', cat.id)
        )
      )
    } catch {
      toast('Error al guardar el orden', 'error')
      setLocalCats(rawCats)
    }
  }

  function toggleCollapse() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(storageKey, String(next))
    if (next) setSelectedCatId(null) // cerrar panel al colapsar
  }

  function handleCardClick(catId) {
    // Si el mismo card → cerrar panel
    setSelectedCatId(prev => prev === catId ? null : catId)
  }

  async function handleDeleteArea() {
    setDeleting(true)
    const { error } = await supabase.from('areas').delete().eq('id', area.id)
    setDeleting(false)
    setConfirmOpen(false)
    if (error) {
      toast('Error al eliminar el área: ' + error.message, 'error')
    } else {
      toast(`Área "${area.nombre}" eliminada`, 'success')
      onRefresh()
    }
  }

  return (
    <section ref={setNodeRef} style={{ ...sortableStyle, marginBottom: '2rem' }}>

      {/* ── Encabezado del área ─────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', marginBottom: '.5rem' }}>

        {/* Grip handle — solo admin */}
        {isAdmin && (
          <button
            {...attributes}
            {...listeners}
            className="area-drag-handle"
            title="Arrastrar para reordenar área"
            tabIndex={-1}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 24, height: 24, background: 'transparent',
              border: 'none', cursor: 'grab', color: '#cbd5e1',
            }}
          >
            <GripVertical size={15} />
          </button>
        )}

        {/* Chevron colapsable */}
        <button
          onClick={toggleCollapse}
          title={collapsed ? 'Expandir' : 'Colapsar'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 26, height: 26, borderRadius: '.4rem',
            background: 'transparent', border: 'none',
            cursor: 'pointer', color: '#64748b', flexShrink: 0,
            transition: 'background .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <ChevronDown
            size={17}
            style={{
              transition: 'transform .25s ease',
              transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            }}
          />
        </button>

        {/* Título */}
        <h2
          onClick={toggleCollapse}
          style={{
            fontSize: '1.05rem', fontWeight: 700, color: '#0f172a',
            margin: 0, cursor: 'pointer', userSelect: 'none',
          }}
        >
          {area.nombre}
        </h2>

        {/* Badge contador */}
        <span style={{
          background: '#f1f5f9', color: '#64748b',
          borderRadius: '9999px', padding: '.15rem .55rem',
          fontSize: '.72rem', fontWeight: 600,
        }}>
          {localCats.length}
        </span>

        {/* Acciones admin */}
        {isAdmin && (
          <div style={{ display: 'flex', gap: 4, marginLeft: '.25rem' }}>
            <button
              className="btn-icon"
              title="Editar área"
              onClick={() => setEditOpen(true)}
              style={{ background: '#dbeafe', color: '#2563eb' }}
            >
              <Pencil size={12} />
            </button>
            <button
              className="btn-icon"
              title="Eliminar área"
              onClick={() => setConfirmOpen(true)}
              style={{ background: '#fee2e2', color: '#ef4444' }}
            >
              <Trash2 size={12} />
            </button>
            <button
              className="btn-icon"
              title="Nueva categoría"
              onClick={() => setAddCatOpen(true)}
              style={{ background: '#dcfce7', color: '#16a34a' }}
            >
              <Plus size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Línea separadora */}
      <div className="area-divider" style={{ marginBottom: '1rem' }} />

      {/* ── Contenido colapsable ────────────────────── */}
      <div className={`collapsible-content ${collapsed ? 'collapsed' : 'expanded'}`}>
        <div> {/* Wrapper necesario para la animación CSS grid */}

          {localCats.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '.85rem', fontStyle: 'italic', padding: '.5rem 0' }}>
              {isAdmin ? 'Sin categorías. Haz clic en "+" para añadir.' : 'Sin categorías disponibles.'}
            </p>
          ) : (
            <>
              {/* Grid de tarjetas con DnD */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleCatDragStart}
                onDragEnd={handleCatDragEnd}
              >
                <SortableContext items={localCats.map(c => c.id)} strategy={rectSortingStrategy}>
                  <div className="cat-grid">
                    {localCats.map(cat => (
                      <CategoriaCard
                        key={cat.id}
                        categoria={cat}
                        isSelected={selectedCatId === cat.id}
                        onCardClick={handleCardClick}
                        onRefresh={onRefresh}
                      />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeCatId && (() => {
                    const cat = localCats.find(c => c.id === activeCatId)
                    return cat ? (
                      <div className="cat-card p-4" style={{ opacity: 1, boxShadow: '0 12px 32px rgba(37,99,235,.22)', cursor: 'grabbing', minHeight: 130, display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                        <div className="cat-card__icon-wrap" />
                        <div style={{ fontWeight: 700, fontSize: '.9rem', color: '#0f172a' }}>{cat.titulo}</div>
                      </div>
                    ) : null
                  })()}
                </DragOverlay>
              </DndContext>

              {/* Panel de enlaces inline (aparece cuando hay selección) */}
              {selectedCat && (
                <LinksPanel
                  categoria={selectedCat}
                  onRefresh={onRefresh}
                  onClose={() => setSelectedCatId(null)}
                />
              )}
            </>
          )}

        </div>
      </div>

      {/* ── Modales admin ───────────────────────────── */}
      <AreaForm
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={area}
        onRefresh={onRefresh}
      />
      <CategoriaForm
        isOpen={addCatOpen}
        onClose={() => setAddCatOpen(false)}
        areaId={area.id}
        onRefresh={onRefresh}
      />
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteArea}
        title={area.nombre}
        loading={deleting}
      />
    </section>
  )
}
