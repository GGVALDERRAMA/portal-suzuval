import { useState, useEffect, useMemo } from 'react'
import Modal from '../ui/Modal'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../supabaseClient'
import * as LucideIcons from 'lucide-react'
import { Search, Check } from 'lucide-react'
import { ICON_CATALOG } from './iconCatalog'

export default function EnlaceForm({ isOpen, onClose, categoriaId, initialData, onRefresh }) {
  const { toast } = useAuth()
  const isEdit = !!initialData

  const [titulo,         setTitulo]         = useState('')
  const [url,            setUrl]            = useState('')
  const [valorIcono,     setValorIcono]     = useState('ArrowUpRight')
  const [iconSearch,     setIconSearch]     = useState('')
  const [tipoDesarrollo, setTipoDesarrollo] = useState('')
  const [saving,         setSaving]         = useState(false)

  useEffect(() => {
    if (isOpen && initialData) {
      setTitulo(initialData.titulo ?? '')
      setUrl(initialData.url ?? '')
      setValorIcono(initialData.valor_icono ?? 'ArrowUpRight')
      setIconSearch('')
      setTipoDesarrollo(initialData.tipo_desarrollo ?? '')
    } else if (!isOpen) {
      setTitulo('')
      setUrl('')
      setValorIcono('ArrowUpRight')
      setIconSearch('')
      setTipoDesarrollo('')
    }
  }, [isOpen, initialData])

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
    if (!titulo.trim() || !url.trim()) return

    setSaving(true)
    try {
      const payload = {
        categoria_id:    categoriaId,
        titulo:          titulo.trim(),
        url:             url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`,
        valor_icono:     valorIcono,
        tipo_desarrollo: tipoDesarrollo || null,
      }

      let error
      if (isEdit) {
        ;({ error } = await supabase.from('enlaces').update(payload).eq('id', initialData.id))
      } else {
        ;({ error } = await supabase.from('enlaces').insert(payload))
      }

      if (error) throw new Error(error.message)

      toast(isEdit ? 'Enlace actualizado' : 'Enlace creado', 'success')
      onClose()
      onRefresh()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const PreviewIcon = LucideIcons[valorIcono] ?? LucideIcons['ArrowUpRight']

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Enlace' : 'Nuevo Enlace'} width="w-full max-w-md">
      <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Título */}
        <div>
          <label className="form-label">Título *</label>
          <input
            className="form-input"
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Ej: Lista de Precios, Inventario..."
            required
            autoFocus
          />
        </div>

        {/* URL */}
        <div>
          <label className="form-label">URL *</label>
          <input
            className="form-input"
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://..."
            required
          />
        </div>

        {/* Tipo de desarrollo */}
        <div>
          <label className="form-label">Tipo de desarrollo</label>
          <div style={{ display: 'flex', gap: '.6rem' }}>
            {[
              { value: 'externo', label: '🌐 Desarrollo Externo' },
              { value: 'interno', label: '🏠 Desarrollo Interno' },
            ].map(({ value, label }) => {
              const active = tipoDesarrollo === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTipoDesarrollo(active ? '' : value)}
                  style={{
                    flex: 1, padding: '.5rem .75rem',
                    borderRadius: '.625rem',
                    border: `1.5px solid ${active ? '#2563eb' : '#e2e8f0'}`,
                    background: active ? '#eff6ff' : '#f8fafc',
                    color: active ? '#1d4ed8' : '#64748b',
                    fontWeight: 600, fontSize: '.8rem',
                    cursor: 'pointer', transition: 'all .15s', textAlign: 'center',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
          {tipoDesarrollo && (
            <button
              type="button"
              onClick={() => setTipoDesarrollo('')}
              style={{ marginTop: '.35rem', fontSize: '.72rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              ✕ Limpiar selección
            </button>
          )}
        </div>

        {/* Ícono */}
        <div>
          <label className="form-label">Ícono</label>

          <div style={{ position: 'relative', marginBottom: '.65rem' }}>
            <Search size={14} style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            <input
              className="form-input"
              type="text"
              value={iconSearch}
              onChange={e => setIconSearch(e.target.value)}
              placeholder="Buscar ícono..."
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>

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

          <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
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
                        key={name} type="button" title={name}
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
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear enlace'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
