import { useState, useEffect, useMemo } from 'react'
import Modal from '../ui/Modal'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../supabaseClient'
import * as LucideIcons from 'lucide-react'
import { Search, Check } from 'lucide-react'
import { ICON_CATALOG } from './iconCatalog'

export default function CategoriaForm({ isOpen, onClose, areaId, initialData, onRefresh }) {
  const { toast } = useAuth()
  const isEdit = !!initialData

  const [titulo,      setTitulo]      = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [valorIcono,  setValorIcono]  = useState('Link')
  const [iconSearch,  setIconSearch]  = useState('')
  const [saving,      setSaving]      = useState(false)

  useEffect(() => {
    if (isOpen && initialData) {
      setTitulo(initialData.titulo ?? '')
      setDescripcion(initialData.descripcion ?? '')
      setValorIcono(initialData.valor_icono ?? 'Link')
      setIconSearch('')
    } else if (!isOpen) {
      resetForm()
    }
  }, [isOpen, initialData])

  function resetForm() {
    setTitulo('')
    setDescripcion('')
    setValorIcono('Link')
    setIconSearch('')
  }

  const filteredCatalog = useMemo(() => {
    if (!iconSearch.trim()) return ICON_CATALOG
    const q = iconSearch.toLowerCase()
    return ICON_CATALOG.map(g => ({
      ...g,
      icons: g.icons.filter(n => n.toLowerCase().includes(q)),
    })).filter(g => g.icons.length > 0)
  }, [iconSearch])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!titulo.trim()) return

    setSaving(true)
    try {
      const payload = {
        area_id:     areaId,
        titulo:      titulo.trim(),
        descripcion: descripcion.trim() || null,
        tipo_icono:  'lucide',
        valor_icono: valorIcono,
      }

      let error
      if (isEdit) {
        ;({ error } = await supabase.from('categorias').update(payload).eq('id', initialData.id))
      } else {
        ;({ error } = await supabase.from('categorias').insert(payload))
      }

      if (error) throw new Error(error.message)

      toast(isEdit ? 'Categoría actualizada' : 'Categoría creada', 'success')
      onClose()
      onRefresh()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const PreviewIcon = LucideIcons[valorIcono] ?? LucideIcons['Link']

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
      width="w-full max-w-md"
    >
      <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        <div>
          <label className="form-label">Título *</label>
          <input className="form-input" type="text" value={titulo}
            onChange={e => setTitulo(e.target.value)} placeholder="Ej: Ventas Vehículos" required autoFocus />
        </div>

        <div>
          <label className="form-label">Descripción</label>
          <textarea className="form-input" value={descripcion}
            onChange={e => setDescripcion(e.target.value)} placeholder="Descripción breve..." rows={2} />
        </div>

        {/* ── Selector de ícono ───────────────── */}
        <div>
          <label className="form-label">Ícono</label>

          {/* Buscador */}
          <div style={{ position: 'relative', marginBottom: '.65rem' }}>
            <Search size={14} style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            <input
              className="form-input"
              type="text"
              value={iconSearch}
              onChange={e => setIconSearch(e.target.value)}
              placeholder="Buscar ícono... (Car, Users, FileText...)"
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>

          {/* Banner del ícono seleccionado */}
          {valorIcono && (() => {
            const Ic = LucideIcons[valorIcono]
            return Ic ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.6rem .9rem', background: '#eff6ff', borderRadius: '.625rem', border: '1.5px solid #bfdbfe', marginBottom: '.65rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: '.5rem', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Ic size={18} color="#2563eb" strokeWidth={1.75} />
                </div>
                <span style={{ fontWeight: 600, fontSize: '.825rem', color: '#1e40af' }}>
                  Seleccionado: <code style={{ background: '#dbeafe', padding: '.1rem .4rem', borderRadius: '.25rem' }}>{valorIcono}</code>
                </span>
              </div>
            ) : null
          })()}

          {/* Grilla por categorías */}
          <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
            {filteredCatalog.map(group => (
              <div key={group.group}>
                <div style={{ fontSize: '.62rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '.4rem' }}>
                  {group.group}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))', gap: '.3rem' }}>
                  {group.icons.map(name => {
                    const Ic = LucideIcons[name]
                    if (!Ic) return null
                    const isActive = valorIcono === name
                    return (
                      <button
                        key={name}
                        type="button"
                        title={name}
                        onClick={() => setValorIcono(name)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          gap: '.2rem', padding: '.45rem .2rem',
                          borderRadius: '.5rem', border: `1.5px solid ${isActive ? '#2563eb' : '#e2e8f0'}`,
                          background: isActive ? '#dbeafe' : '#f8fafc',
                          cursor: 'pointer', transition: 'all .12s', position: 'relative',
                        }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f0f7ff' }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc' }}
                      >
                        <Ic size={18} color={isActive ? '#2563eb' : '#475569'} strokeWidth={1.75} />
                        <span style={{ fontSize: '.5rem', color: isActive ? '#2563eb' : '#94a3b8', textAlign: 'center', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                          {name}
                        </span>
                        {isActive && (
                          <span style={{ position: 'absolute', top: 2, right: 2, width: 12, height: 12, background: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={8} color="#fff" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            {filteredCatalog.length === 0 && (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '1.5rem 0', fontSize: '.8rem', margin: 0 }}>
                Sin resultados para "{iconSearch}"
              </p>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', paddingTop: '.5rem' }}>
          <button type="button" className="btn-ghost" onClick={onClose} disabled={saving}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear Categoría'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
