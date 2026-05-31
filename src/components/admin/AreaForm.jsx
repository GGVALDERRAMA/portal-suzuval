import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../supabaseClient'

export default function AreaForm({ isOpen, onClose, initialData, onRefresh }) {
  const { toast } = useAuth()
  const isEdit = !!initialData

  const [nombre, setNombre]   = useState('')
  const [orden, setOrden]     = useState(0)
  const [saving, setSaving]   = useState(false)

  // Poblar el formulario al editar
  useEffect(() => {
    if (isOpen && initialData) {
      setNombre(initialData.nombre ?? '')
      setOrden(initialData.orden ?? 0)
    } else if (!isOpen) {
      setNombre('')
      setOrden(0)
    }
  }, [isOpen, initialData])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nombre.trim()) return

    setSaving(true)
    let error

    if (isEdit) {
      ;({ error } = await supabase.from('areas').update({ nombre: nombre.trim(), orden: Number(orden) }).eq('id', initialData.id))
    } else {
      ;({ error } = await supabase.from('areas').insert({ nombre: nombre.trim(), orden: Number(orden) }))
    }

    setSaving(false)
    if (error) {
      toast('Error: ' + error.message, 'error')
    } else {
      toast(isEdit ? 'Área actualizada' : 'Área creada', 'success')
      onClose()
      onRefresh()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Área' : 'Nueva Área'} width="w-full max-w-sm">
      <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="form-label">Nombre del Área *</label>
          <input
            className="form-input"
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej: Ventas, Sistemas, RRHH..."
            required
            autoFocus
          />
        </div>
        <div>
          <label className="form-label">Orden (posición en el dashboard)</label>
          <input
            className="form-input"
            type="number"
            value={orden}
            onChange={e => setOrden(e.target.value)}
            min={0}
          />
        </div>
        <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', paddingTop: '.5rem' }}>
          <button type="button" className="btn-ghost" onClick={onClose} disabled={saving}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear Área'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
