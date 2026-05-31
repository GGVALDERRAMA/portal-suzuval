import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../supabaseClient'
import * as LucideIcons from 'lucide-react'

/* Íconos sugeridos para enlaces */
const LINK_ICON_SUGGESTIONS = [
  { group: '📎 Acciones',    icons: ['ArrowUpRight','ExternalLink','Link','Link2','Share2','Download','Clipboard','Copy','Send','BookMarked'] },
  { group: '📄 Documentos',  icons: ['FileText','File','Files','FileSearch','ClipboardList','BookOpen','Notebook','NotepadText','Archive','FolderOpen'] },
  { group: '💰 Finanzas',    icons: ['DollarSign','Receipt','CreditCard','Wallet','BarChart2','TrendingUp','PieChart','Calculator','Banknote','ShoppingCart'] },
  { group: '🚗 Automotriz',  icons: ['Car','CarFront','Truck','Gauge','Fuel','Wrench','Package','Boxes','BarChart3','ClipboardCheck'] },
  { group: '⚙️ Gestión',     icons: ['Settings','Settings2','ListChecks','Table','Database','Server','Monitor','Grid3x3','LayoutDashboard','Kanban'] },
  { group: '👥 Personas',    icons: ['Users','User','UserCheck','Contact','Phone','Mail','GraduationCap','BadgeCheck','Award','Star'] },
]

const TYPE_TABS = [
  { id: 'url',      label: '🌐 Enlace / URL' },
  { id: 'contacto', label: '👤 Tarjeta Contacto' },
]

export default function EnlaceForm({ isOpen, onClose, categoriaId, initialData, onRefresh }) {
  const { toast } = useAuth()
  const isEdit = !!initialData

  // Tipo de enlace
  const [tipoEnlace, setTipoEnlace] = useState('url')

  // Campos comunes
  const [titulo,     setTitulo]     = useState('')
  const [valorIcono, setValorIcono] = useState('ArrowUpRight')
  const [iconSearch, setIconSearch] = useState('')
  const [saving,     setSaving]     = useState(false)

  // Campos URL
  const [url, setUrl] = useState('')

  // Campos Contacto
  const [cNombre,   setCNombre]   = useState('')
  const [cEmail,    setCEmail]    = useState('')
  const [cTelefono, setCTelefono] = useState('')

  useEffect(() => {
    if (isOpen && initialData) {
      const tipo = initialData.tipo_enlace ?? 'url'
      setTipoEnlace(tipo)
      setTitulo(initialData.titulo ?? '')
      setValorIcono(initialData.valor_icono ?? (tipo === 'contacto' ? 'Contact' : 'ArrowUpRight'))
      setIconSearch('')

      if (tipo === 'contacto') {
        setCNombre(initialData.contacto_nombre ?? '')
        const rawEmail = (initialData.url ?? '').replace(/^mailto:/i, '')
        setCEmail(rawEmail)
        setCTelefono(initialData.contacto_telefono ?? '')
        setUrl('')
      } else {
        setUrl(initialData.url ?? '')
        setCNombre('')
        setCEmail('')
        setCTelefono('')
      }
    } else if (!isOpen) {
      setTipoEnlace('url')
      setTitulo('')
      setUrl('')
      setValorIcono('ArrowUpRight')
      setIconSearch('')
      setCNombre('')
      setCEmail('')
      setCTelefono('')
    }
  }, [isOpen, initialData])

  // Al cambiar de tipo, ajustar el ícono por defecto
  function handleTabChange(tipo) {
    setTipoEnlace(tipo)
    if (tipo === 'contacto' && valorIcono === 'ArrowUpRight') setValorIcono('Contact')
    if (tipo === 'url'      && valorIcono === 'Contact')      setValorIcono('ArrowUpRight')
  }

  function normalizeUrl(raw) {
    const v = raw.trim()
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `mailto:${v}`
    if (/^[+\d][\d\s\-().]{5,}$/.test(v))      return `tel:${v.replace(/\s/g,'')}`
    if (!/^https?:\/\//i.test(v) && !v.startsWith('mailto:') && !v.startsWith('tel:')) {
      return `https://${v}`
    }
    return v
  }

  function detectType(raw) {
    const v = raw.trim()
    if (!v) return null
    if (/^mailto:/i.test(v) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'email'
    if (/^tel:/i.test(v)    || /^[+\d][\d\s\-().]{5,}$/.test(v))     return 'teléfono'
    return 'url'
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!titulo.trim()) return

    setSaving(true)
    let error

    let payload
    if (tipoEnlace === 'contacto') {
      if (!cEmail.trim() && !cTelefono.trim()) {
        toast('Ingresa al menos un correo o teléfono', 'error')
        setSaving(false)
        return
      }
      payload = {
        categoria_id:      categoriaId,
        titulo:            titulo.trim(),
        tipo_enlace:       'contacto',
        url:               cEmail.trim() ? `mailto:${cEmail.trim()}` : '',
        contacto_nombre:   cNombre.trim() || null,
        contacto_telefono: cTelefono.trim() || null,
        valor_icono:       valorIcono,
      }
    } else {
      if (!url.trim()) { setSaving(false); return }
      payload = {
        categoria_id:      categoriaId,
        titulo:            titulo.trim(),
        tipo_enlace:       'url',
        url:               normalizeUrl(url),
        contacto_nombre:   null,
        contacto_telefono: null,
        valor_icono:       valorIcono,
      }
    }

    if (isEdit) {
      ;({ error } = await supabase.from('enlaces').update(payload).eq('id', initialData.id))
    } else {
      ;({ error } = await supabase.from('enlaces').insert(payload))
    }

    setSaving(false)
    if (error) {
      toast('Error: ' + error.message, 'error')
    } else {
      toast(isEdit ? 'Enlace actualizado' : 'Enlace creado', 'success')
      onClose()
      onRefresh()
    }
  }

  const filtered = iconSearch.trim()
    ? LINK_ICON_SUGGESTIONS.map(g => ({
        ...g,
        icons: g.icons.filter(n => n.toLowerCase().includes(iconSearch.toLowerCase())),
      })).filter(g => g.icons.length > 0)
    : LINK_ICON_SUGGESTIONS

  const PreviewIcon = LucideIcons[valorIcono] ?? LucideIcons['ArrowUpRight']

  const TAB_STYLE = (active) => ({
    flex: 1, padding: '.45rem', border: 'none', borderRadius: '.45rem',
    fontWeight: 600, fontSize: '.8rem', cursor: 'pointer',
    background: active ? '#2563eb' : 'transparent',
    color: active ? '#fff' : '#64748b',
    transition: 'all .15s',
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Editar Enlace' : 'Nuevo Enlace'} width="w-full max-w-md">
      <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Tabs tipo de enlace */}
        <div style={{ display: 'flex', gap: '.2rem', background: '#f1f5f9', borderRadius: '.6rem', padding: '.2rem' }}>
          {TYPE_TABS.map(t => (
            <button key={t.id} type="button" style={TAB_STYLE(tipoEnlace === t.id)} onClick={() => handleTabChange(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Título */}
        <div>
          <label className="form-label">Título *</label>
          <input
            className="form-input"
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder={tipoEnlace === 'contacto' ? 'Ej: Jefe de Ventas, Jefe de RRHH...' : 'Ej: Lista de Precios, Inventario...'}
            required
            autoFocus
          />
        </div>

        {/* ── MODO URL ──────────────────────────── */}
        {tipoEnlace === 'url' && (
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
        )}

        {/* ── MODO CONTACTO ─────────────────────── */}
        {tipoEnlace === 'contacto' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', padding: '.85rem', background: '#f0f7ff', borderRadius: '.75rem', border: '1.5px solid #bfdbfe' }}>
            <div>
              <label className="form-label">Nombre completo</label>
              <input
                className="form-input"
                type="text"
                value={cNombre}
                onChange={e => setCNombre(e.target.value)}
                placeholder="Ej: Juan González"
              />
            </div>
            <div>
              <label className="form-label">Correo electrónico</label>
              <input
                className="form-input"
                type="email"
                value={cEmail}
                onChange={e => setCEmail(e.target.value)}
                placeholder="jgonzalez@suzuval.cl"
              />
            </div>
            <div>
              <label className="form-label">Teléfono</label>
              <input
                className="form-input"
                type="text"
                value={cTelefono}
                onChange={e => setCTelefono(e.target.value)}
                placeholder="+56 9 1234 5678"
              />
            </div>
            <p style={{ fontSize: '.72rem', color: '#1e40af', margin: 0 }}>
              💡 Al hacer clic aparecerá una tarjeta con esta información — sin abrir el cliente de correo.
            </p>
          </div>
        )}

        {/* ── Selector de ícono ───────────────── */}
        <div>
          <label className="form-label">Ícono</label>
          <div style={{ display: 'flex', gap: '.65rem', alignItems: 'center', marginBottom: '.65rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '.625rem', flexShrink: 0, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #bfdbfe' }}>
              <PreviewIcon size={22} color="#2563eb" strokeWidth={1.75} />
            </div>
            <input
              className="form-input"
              type="text"
              value={iconSearch}
              onChange={e => setIconSearch(e.target.value)}
              placeholder="Buscar ícono..."
              style={{ flex: 1 }}
            />
          </div>
          <div style={{ maxHeight: 180, overflowY: 'auto', border: '1.5px solid #e2e8f0', borderRadius: '.625rem', padding: '.65rem', display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
            {filtered.map(group => (
              <div key={group.group}>
                <div style={{ fontSize: '.62rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: '.35rem' }}>
                  {group.group}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem' }}>
                  {group.icons.map(name => {
                    const Ic = LucideIcons[name]
                    if (!Ic) return null
                    const active = valorIcono === name
                    return (
                      <button key={name} type="button" title={name} onClick={() => setValorIcono(name)}
                        style={{ width: 36, height: 36, borderRadius: '.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${active ? '#2563eb' : '#e2e8f0'}`, background: active ? '#dbeafe' : '#f8fafc', cursor: 'pointer', transition: 'all .12s' }}
                        onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f0f7ff' }}
                        onMouseLeave={e => { if (!active) e.currentTarget.style.background = '#f8fafc' }}
                      >
                        <Ic size={17} color={active ? '#2563eb' : '#64748b'} strokeWidth={1.75} />
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>


        <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', paddingTop: '.5rem' }}>
          <button type="button" className="btn-ghost" onClick={onClose} disabled={saving}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
