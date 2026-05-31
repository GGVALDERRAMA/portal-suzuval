import { useState } from 'react'
import { ExternalLink, ArrowUpRight, Plus, Pencil, Trash2 } from 'lucide-react'
import Modal from '../ui/Modal'
import ConfirmDialog from '../ui/ConfirmDialog'
import EnlaceForm from '../admin/EnlaceForm'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../supabaseClient'

export default function EnlacesModal({ isOpen, onClose, categoria, onRefresh }) {
  const { isAdmin, toast } = useAuth()
  const [addOpen, setAddOpen]         = useState(false)
  const [editTarget, setEditTarget]   = useState(null)
  const [delTarget, setDelTarget]     = useState(null)
  const [deleting, setDeleting]       = useState(false)

  const enlaces = categoria?.enlaces ?? []

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

  if (!categoria) return null

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={categoria.titulo}
        width="w-full max-w-md"
      >
        <div style={{ padding: '1.25rem 1.5rem' }}>
          {/* Descripción */}
          {categoria.descripcion && (
            <p style={{ fontSize: '.8rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>
              {categoria.descripcion}
            </p>
          )}

          {/* Lista de enlaces */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {enlaces.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                {isAdmin ? (
                  <>
                    <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🔗</div>
                    <p style={{ color: '#64748b', fontSize: '.875rem', fontWeight: 600, marginBottom: '.25rem' }}>
                      Sin enlaces todavía
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '.8rem' }}>
                      Haz clic en "Agregar Enlace" para añadir el primero.
                    </p>
                  </>
                ) : (
                  <p style={{ color: '#94a3b8', fontSize: '.875rem' }}>
                    No hay enlaces disponibles en esta categoría.
                  </p>
                )}
              </div>
            ) : (
              enlaces.map(enlace => (
                <div key={enlace.id} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <a
                    href={enlace.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="enlace-row"
                    style={{ flex: 1 }}
                    onClick={onClose}
                  >
                    <span style={{
                      width: 32, height: 32, borderRadius: '.5rem',
                      background: '#dbeafe',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <ArrowUpRight size={15} color="#2563eb" />
                    </span>
                    <span style={{ flex: 1, fontSize: '.875rem' }}>{enlace.titulo}</span>
                    <ExternalLink size={13} style={{ color: '#cbd5e1' }} />
                  </a>

                  {/* Acciones admin */}
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn-icon"
                        title="Editar enlace"
                        onClick={() => setEditTarget(enlace)}
                        style={{ background: '#dbeafe', color: '#2563eb' }}
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        className="btn-icon"
                        title="Eliminar enlace"
                        onClick={() => setDelTarget(enlace)}
                        style={{ background: '#fee2e2', color: '#ef4444' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Botón agregar enlace (admin) */}
          {isAdmin && (
            <button
              className="btn-primary"
              onClick={() => setAddOpen(true)}
              style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
            >
              <Plus size={15} />
              Agregar Enlace
            </button>
          )}
        </div>
      </Modal>


      {/* Formulario agregar enlace */}
      <EnlaceForm
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        categoriaId={categoria.id}
        onRefresh={onRefresh}
      />

      {/* Formulario editar enlace */}
      <EnlaceForm
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        categoriaId={categoria.id}
        initialData={editTarget}
        onRefresh={onRefresh}
      />

      {/* Confirm eliminar enlace */}
      <ConfirmDialog
        isOpen={!!delTarget}
        onClose={() => setDelTarget(null)}
        onConfirm={handleDelete}
        title={delTarget?.titulo}
        loading={deleting}
      />
    </>
  )
}
