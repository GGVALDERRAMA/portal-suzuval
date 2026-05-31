import { useState, useEffect, useRef } from 'react'
import Modal from '../ui/Modal'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../supabaseClient'
import { Upload, ImageIcon, Type } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

const LUCIDE_SUGGESTIONS = [
  'Link', 'Car', 'ShoppingCart', 'Users', 'BarChart2', 'FileText',
  'Settings', 'Monitor', 'Headphones', 'BookOpen', 'Briefcase',
  'Building2', 'CreditCard', 'Database', 'Globe', 'Home', 'Mail',
  'Package', 'Phone', 'Printer', 'Shield', 'Star', 'Truck', 'Wrench',
]

export default function CategoriaForm({ isOpen, onClose, areaId, initialData, onRefresh }) {
  const { toast } = useAuth()
  const isEdit = !!initialData
  const fileRef = useRef(null)

  const [titulo, setTitulo]           = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipoIcono, setTipoIcono]     = useState('lucide')
  const [valorIcono, setValorIcono]   = useState('Link')
  const [file, setFile]               = useState(null)
  const [preview, setPreview]         = useState(null)
  const [uploading, setUploading]     = useState(false)
  const [saving, setSaving]           = useState(false)

  useEffect(() => {
    if (isOpen && initialData) {
      setTitulo(initialData.titulo ?? '')
      setDescripcion(initialData.descripcion ?? '')
      setTipoIcono(initialData.tipo_icono ?? 'lucide')
      setValorIcono(initialData.valor_icono ?? 'Link')
      setFile(null)
      setPreview(initialData.tipo_icono === 'imagen' ? initialData.valor_icono : null)
    } else if (!isOpen) {
      resetForm()
    }
  }, [isOpen, initialData])

  function resetForm() {
    setTitulo('')
    setDescripcion('')
    setTipoIcono('lucide')
    setValorIcono('Link')
    setFile(null)
    setPreview(null)
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function uploadImage() {
    if (!file) return valorIcono // ya tiene URL existente

    setUploading(true)
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('iconos')
      .upload(filename, file, { upsert: false })

    if (uploadError) {
      setUploading(false)
      throw new Error('Error al subir imagen: ' + uploadError.message)
    }

    const { data: urlData } = supabase.storage
      .from('iconos')
      .getPublicUrl(filename)

    setUploading(false)
    return urlData.publicUrl
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!titulo.trim()) return

    setSaving(true)
    let iconUrl = valorIcono

    try {
      if (tipoIcono === 'imagen' && file) {
        iconUrl = await uploadImage()
      }

      const payload = {
        area_id: areaId,
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        tipo_icono: tipoIcono,
        valor_icono: tipoIcono === 'lucide' ? valorIcono : iconUrl,
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

  // Preview del ícono Lucide seleccionado
  const IconPreview = LucideIcons[valorIcono] ?? null

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

        {/* Selector de tipo de ícono */}
        <div>
          <label className="form-label">Tipo de Ícono</label>
          <div style={{ display: 'flex', gap: '.75rem' }}>
            {[
              { value: 'lucide', label: 'Ícono Lucide', Icon: Type },
              { value: 'imagen', label: 'Imagen (PNG/JPG)', Icon: ImageIcon },
            ].map(({ value, label, Icon }) => (
              <label
                key={value}
                style={{
                  flex: 1,
                  display: 'flex', alignItems: 'center', gap: '.5rem',
                  padding: '.55rem .85rem',
                  border: `1.5px solid ${tipoIcono === value ? '#2563eb' : '#e2e8f0'}`,
                  borderRadius: '.625rem',
                  cursor: 'pointer',
                  background: tipoIcono === value ? '#eff6ff' : '#fff',
                  transition: 'all .15s',
                  fontSize: '.825rem',
                  fontWeight: 500,
                  color: tipoIcono === value ? '#2563eb' : '#64748b',
                }}
              >
                <input
                  type="radio" name="tipo_icono" value={value}
                  checked={tipoIcono === value}
                  onChange={() => setTipoIcono(value)}
                  style={{ display: 'none' }}
                />
                <Icon size={14} />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Campo según tipo de ícono */}
        {tipoIcono === 'lucide' ? (
          <div>
            <label className="form-label">Nombre del ícono Lucide</label>
            <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
              <input
                className="form-input"
                type="text"
                value={valorIcono}
                onChange={e => setValorIcono(e.target.value)}
                placeholder="Ej: Car, Users, FileText..."
                style={{ flex: 1 }}
              />
              {IconPreview && (
                <div style={{
                  width: 44, height: 44, borderRadius: '.625rem',
                  background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <IconPreview size={22} color="#2563eb" />
                </div>
              )}
            </div>
            {/* Sugerencias */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem', marginTop: '.5rem' }}>
              {LUCIDE_SUGGESTIONS.map(name => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setValorIcono(name)}
                  style={{
                    padding: '.2rem .55rem',
                    borderRadius: '.375rem',
                    border: `1px solid ${valorIcono === name ? '#2563eb' : '#e2e8f0'}`,
                    background: valorIcono === name ? '#dbeafe' : '#f8fafc',
                    color: valorIcono === name ? '#2563eb' : '#64748b',
                    fontSize: '.72rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className="form-label">Imagen del ícono</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {preview && (
                <img src={preview} alt="Preview" className="upload-preview" />
              )}
              <button
                type="button"
                className="btn-ghost"
                onClick={() => fileRef.current?.click()}
                style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}
              >
                <Upload size={14} />
                {file ? 'Cambiar imagen' : 'Seleccionar imagen'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
            {file && (
              <p style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: '.4rem' }}>
                {file.name} ({(file.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </div>
        )}


        <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', paddingTop: '.5rem' }}>
          <button type="button" className="btn-ghost" onClick={onClose} disabled={saving || uploading}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={saving || uploading}>
            {uploading ? 'Subiendo imagen...' : saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear Categoría'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
