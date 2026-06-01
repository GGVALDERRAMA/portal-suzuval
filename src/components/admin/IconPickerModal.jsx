import { useState, useMemo } from 'react'
import Modal from '../ui/Modal'
import * as LucideIcons from 'lucide-react'
import { Search, Check } from 'lucide-react'
import { ICON_CATALOG } from './iconCatalog'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../contexts/AuthContext'



/**
 * Modal de selección de ícono para categorías.
 * Usa el picker visual unificado (Lucide) igual al resto de la app.
 */
export default function IconPickerModal({ isOpen, onClose, categoria, onRefresh }) {
  const { toast } = useAuth()

  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(categoria?.valor_icono ?? 'Link')
  const [saving,   setSaving]   = useState(false)

  // Filtrado de íconos por búsqueda
  const filteredCatalog = useMemo(() => {
    if (!search.trim()) return ICON_CATALOG
    const q = search.toLowerCase()
    return ICON_CATALOG.map(group => ({
      ...group,
      icons: group.icons.filter(name => name.toLowerCase().includes(q)),
    })).filter(group => group.icons.length > 0)
  }, [search])

  async function handleSave() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('categorias')
        .update({ tipo_icono: 'lucide', valor_icono: selected })
        .eq('id', categoria.id)

      if (error) throw new Error(error.message)

      toast('Ícono actualizado correctamente', 'success')
      onClose()
      onRefresh()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Ícono" width="w-full max-w-xl">
      <div style={{ padding: '1rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Búsqueda */}
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
          <input
            className="form-input"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar ícono... (Car, Users, FileText...)"
            style={{ paddingLeft: '2.25rem' }}
            autoFocus
          />
        </div>

        {/* Banner del ícono seleccionado */}
        {selected && (() => {
          const Ic = LucideIcons[selected]
          return Ic ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.65rem 1rem', background: '#eff6ff', borderRadius: '.625rem', border: '1.5px solid #bfdbfe' }}>
              <div style={{ width: 38, height: 38, borderRadius: '.5rem', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ic size={20} color="#2563eb" />
              </div>
              <span style={{ fontWeight: 600, fontSize: '.875rem', color: '#1e40af' }}>
                Seleccionado: <code style={{ background: '#dbeafe', padding: '.1rem .4rem', borderRadius: '.25rem' }}>{selected}</code>
              </span>
            </div>
          ) : null
        })()}

        {/* Grid de íconos agrupados */}
        <div style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredCatalog.map(group => (
            <div key={group.group}>
              <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '.5rem' }}>
                {group.group}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))', gap: '.35rem' }}>
                {group.icons.map(name => {
                  const Ic = LucideIcons[name]
                  if (!Ic) return null
                  const isActive = selected === name
                  return (
                    <button
                      key={name}
                      title={name}
                      onClick={() => setSelected(name)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: '.25rem', padding: '.5rem .25rem',
                        borderRadius: '.5rem', border: `1.5px solid ${isActive ? '#2563eb' : '#e2e8f0'}`,
                        background: isActive ? '#dbeafe' : '#f8fafc',
                        cursor: 'pointer', transition: 'all .12s',
                        position: 'relative',
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f0f7ff' }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc' }}
                    >
                      <Ic size={20} color={isActive ? '#2563eb' : '#475569'} strokeWidth={1.75} />
                      <span style={{ fontSize: '.55rem', color: isActive ? '#2563eb' : '#94a3b8', textAlign: 'center', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                        {name}
                      </span>
                      {isActive && (
                        <span style={{ position: 'absolute', top: 3, right: 3, width: 14, height: 14, background: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={9} color="#fff" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          {filteredCatalog.length === 0 && (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0', fontSize: '.875rem' }}>
              Sin resultados para "{search}"
            </p>
          )}
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
          <button className="btn-ghost" onClick={onClose} disabled={saving}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Aplicar ícono'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
