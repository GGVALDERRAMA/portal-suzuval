import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import {
  DndContext, closestCenter,
  PointerSensor, TouchSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext, arrayMove, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import Header from '../components/layout/Header'
import AdminBanner from '../components/layout/AdminBanner'
import AreaSection from '../components/dashboard/AreaSection'
import { SkeletonArea } from '../components/ui/SkeletonCard'
import AreaForm from '../components/admin/AreaForm'
import { useAuth } from '../contexts/AuthContext'
import { usePortalData } from '../hooks/usePortalData'
import { supabase } from '../supabaseClient'

export default function DashboardPage() {
  const { isAdmin, toast } = useAuth()
  const { areas, allEnlaces, loading, error, refresh } = usePortalData()
  const [addAreaOpen, setAddAreaOpen] = useState(false)

  // ── Estado local ordenado (optimistic DnD) ──────────────
  const [localAreas, setLocalAreas] = useState([])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    const sorted = [...areas].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    setLocalAreas(sorted)
  }, [areas])

  // ── Sensores DnD ────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 250, tolerance: 8 } }),
  )
  const [activeAreaId, setActiveAreaId] = useState(null)

  function handleDragStart(event) {
    setActiveAreaId(event.active.id)
  }

  async function handleDragEnd(event) {
    setActiveAreaId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIdx = localAreas.findIndex(a => a.id === active.id)
    const newIdx = localAreas.findIndex(a => a.id === over.id)
    const reordered = arrayMove(localAreas, oldIdx, newIdx)
    setLocalAreas(reordered)

    try {
      await Promise.all(
        reordered.map((area, idx) =>
          supabase.from('areas').update({ orden: idx * 10 }).eq('id', area.id)
        )
      )
    } catch {
      toast('Error al guardar el orden de las áreas', 'error')
      setLocalAreas(areas)
    }
  }

  const activeArea = activeAreaId ? localAreas.find(a => a.id === activeAreaId) : null

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Header allEnlaces={allEnlaces} onAddArea={() => setAddAreaOpen(true)} />

      {/* Franja admin */}
      <AdminBanner />

      {/* Contenido principal */}
      <main style={{ flex: 1, padding: '2rem 1.75rem', maxWidth: 1400, margin: '0 auto', width: '100%' }}>

        {/* Estado de error */}
        {error && (
          <div style={{
            padding: '1rem 1.25rem',
            background: '#fef2f2',
            border: '1.5px solid #fecaca',
            borderRadius: '.875rem',
            color: '#dc2626',
            fontSize: '.875rem',
            marginBottom: '1.5rem',
          }}>
            Error al cargar datos: {error}
          </div>
        )}

        {/* Skeletons mientras carga */}
        {loading && (
          <>
            <SkeletonArea />
            <SkeletonArea />
            <SkeletonArea />
          </>
        )}

        {/* Sin áreas */}
        {!loading && !error && localAreas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
            <h2 style={{ color: '#475569', fontWeight: 600, marginBottom: '.5rem' }}>
              No hay áreas configuradas
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '.875rem', marginBottom: '1.5rem' }}>
              {isAdmin
                ? 'Comienza añadiendo un Área desde el header o el botón de abajo.'
                : 'Contacta al administrador del portal.'}
            </p>
            {isAdmin && (
              <button className="btn-primary" onClick={() => setAddAreaOpen(true)}>
                <Plus size={15} />
                Crear primera Área
              </button>
            )}
          </div>
        )}

        {/* ── Áreas con DnD ────────────────────────────── */}
        {!loading && localAreas.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localAreas.map(a => a.id)}
              strategy={verticalListSortingStrategy}
            >
              {localAreas.map(area => (
                <AreaSection
                  key={area.id}
                  area={area}
                  onRefresh={refresh}
                />
              ))}
            </SortableContext>

            {/* Ghost mientras arrastra */}
            <DragOverlay>
              {activeArea && (
                <div style={{
                  background: '#fff',
                  borderRadius: '1rem',
                  padding: '1rem 1.25rem',
                  boxShadow: '0 16px 40px rgba(37,99,235,.2)',
                  border: '2px dashed #93c5fd',
                  opacity: .92,
                  cursor: 'grabbing',
                }}>
                  <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                    {activeArea.nombre}
                  </span>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '.75rem 1.75rem',
        borderTop: '1px solid #e2e8f0',
        textAlign: 'center',
        fontSize: '.75rem',
        color: '#94a3b8',
        background: '#fff',
      }}>
        Portal Suzuval © {new Date().getFullYear()} — Centro de Aplicaciones Corporativas
      </footer>

      {/* Modal nueva área */}
      <AreaForm
        isOpen={addAreaOpen}
        onClose={() => setAddAreaOpen(false)}
        onRefresh={refresh}
      />
    </div>
  )
}
