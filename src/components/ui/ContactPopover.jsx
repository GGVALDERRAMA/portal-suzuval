import { useState, useEffect, useRef } from 'react'
import { X, Mail, Phone, Copy, Check, User } from 'lucide-react'

/**
 * Tarjeta flotante de contacto — aparece anclada al elemento clickeado.
 * Props:
 *   contact  - { nombre, email, telefono }
 *   anchor   - DOMRect del elemento que disparó el click
 *   onClose  - fn()
 */
export default function ContactPopover({ contact, anchor, onClose }) {
  const ref = useRef(null)
  const [copied, setCopied] = useState(null)  // 'email' | 'phone'

  const CARD_W = 288

  // Calcular posición: aparece debajo del anchor, centrado
  const pos = (() => {
    if (!anchor) return { left: '50%', top: '50%' }
    let left = anchor.left + anchor.width / 2 - CARD_W / 2
    let top  = anchor.bottom + 10

    // Ajustar si sale por los bordes
    if (left < 8) left = 8
    if (left + CARD_W > window.innerWidth - 8) left = window.innerWidth - CARD_W - 8
    if (top + 240 > window.innerHeight - 8) top = anchor.top - 240 - 10
    return { left, top }
  })()

  // Cerrar con ESC
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Cerrar al click fuera
  useEffect(() => {
    const onDown = e => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    const t = setTimeout(() => document.addEventListener('mousedown', onDown), 80)
    return () => { clearTimeout(t); document.removeEventListener('mousedown', onDown) }
  }, [onClose])

  async function copy(text, tipo) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(tipo)
      setTimeout(() => setCopied(null), 2000)
    } catch { /* silencioso */ }
  }

  // Avatar con iniciales
  const initials = contact.nombre
    ? contact.nombre.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?'

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: pos.left,
        top: pos.top,
        width: CARD_W,
        zIndex: 500,
        background: '#fff',
        borderRadius: '1rem',
        boxShadow: '0 20px 60px rgba(15,32,68,.2), 0 4px 16px rgba(15,32,68,.1)',
        border: '1.5px solid #e2e8f0',
        overflow: 'hidden',
        animation: 'contactPopIn .2s cubic-bezier(.34,1.56,.64,1)',
      }}
    >
      {/* ── Header azul ─────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f2044 0%, #2563eb 100%)',
        padding: '1rem 1rem .85rem',
        display: 'flex', alignItems: 'center', gap: '.75rem',
        position: 'relative',
      }}>
        {/* Avatar */}
        <div style={{
          width: 46, height: 46, borderRadius: '50%',
          background: 'rgba(255,255,255,.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '1.05rem', color: '#fff', flexShrink: 0,
          border: '2px solid rgba(255,255,255,.3)',
        }}>
          {initials}
        </div>

        {/* Nombre */}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '.9rem', color: '#fff', lineHeight: 1.3 }}>
            {contact.nombre || 'Contacto'}
          </div>
          <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.65)', marginTop: '.1rem' }}>
            Contacto directo
          </div>
        </div>

        {/* Cerrar */}
        <button
          onClick={onClose}
          title="Cerrar"
          style={{
            width: 28, height: 28, borderRadius: '.4rem',
            background: 'rgba(255,255,255,.15)', border: 'none',
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background .15s', flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.28)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'}
        >
          <X size={14} />
        </button>
      </div>

      {/* ── Cuerpo ──────────────────────────── */}
      <div style={{ padding: '.9rem 1rem' }}>

        {/* Email */}
        {contact.email && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '.65rem',
            marginBottom: '.55rem', padding: '.55rem .65rem',
            background: '#f8fafc', borderRadius: '.625rem',
            border: '1px solid #f1f5f9',
          }}>
            <Mail size={15} color="#2563eb" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '.8rem', color: '#0f172a', fontWeight: 500, wordBreak: 'break-all' }}>
              {contact.email}
            </span>
            <button
              onClick={() => copy(contact.email, 'email')}
              title={copied === 'email' ? '¡Copiado!' : 'Copiar correo'}
              style={{
                width: 28, height: 28, borderRadius: '.4rem',
                background: copied === 'email' ? '#dcfce7' : '#f1f5f9',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all .15s',
              }}
            >
              {copied === 'email'
                ? <Check size={13} color="#16a34a" strokeWidth={2.5} />
                : <Copy size={13} color="#64748b" />
              }
            </button>
          </div>
        )}

        {/* Teléfono */}
        {contact.telefono && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '.65rem',
            padding: '.55rem .65rem',
            background: '#f8fafc', borderRadius: '.625rem',
            border: '1px solid #f1f5f9',
          }}>
            <Phone size={15} color="#2563eb" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '.8rem', color: '#0f172a', fontWeight: 500 }}>
              {contact.telefono}
            </span>
            <button
              onClick={() => copy(contact.telefono, 'phone')}
              title={copied === 'phone' ? '¡Copiado!' : 'Copiar teléfono'}
              style={{
                width: 28, height: 28, borderRadius: '.4rem',
                background: copied === 'phone' ? '#dcfce7' : '#f1f5f9',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all .15s',
              }}
            >
              {copied === 'phone'
                ? <Check size={13} color="#16a34a" strokeWidth={2.5} />
                : <Copy size={13} color="#64748b" />
              }
            </button>
          </div>
        )}

        {/* Sin datos */}
        {!contact.email && !contact.telefono && (
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '.8rem', margin: 0 }}>
            Sin información de contacto disponible.
          </p>
        )}
      </div>
    </div>
  )
}
