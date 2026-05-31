import { useState, useRef, useEffect } from 'react'
import { Search, X, ArrowUpRight, Layers } from 'lucide-react'

/**
 * Buscador global "Deep Search" — busca directamente en enlaces (nivel 3)
 * Props:
 *   allEnlaces - array plano de { id, titulo, url, categoria: { titulo, area: { nombre } } }
 */
export default function SearchBar({ allEnlaces = [] }) {
  const [query, setQuery]       = useState('')
  const [open, setOpen]         = useState(false)
  const inputRef                = useRef(null)
  const wrapRef                 = useRef(null)

  // Filtrado
  const results = query.trim().length < 2
    ? []
    : allEnlaces.filter(e =>
        e.titulo.toLowerCase().includes(query.toLowerCase()) ||
        e.categoria?.titulo?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  // Tecla Escape
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur() }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  function handleSelect(url) {
    window.open(url, '_blank', 'noopener,noreferrer')
    setQuery('')
    setOpen(false)
  }

  function clear() {
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', maxWidth: 520 }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search
          size={16}
          style={{ position: 'absolute', left: '1rem', color: 'rgba(255,255,255,.6)', pointerEvents: 'none' }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          placeholder="Buscar aplicación o enlace..."
          className="search-input"
          style={{
            width: '100%',
            paddingLeft: '2.5rem',
            paddingRight: query ? '2.5rem' : '1rem',
            paddingTop: '.55rem',
            paddingBottom: '.55rem',
            borderRadius: '9999px',
            fontSize: '.875rem',
          }}
          autoComplete="off"
        />
        {query && (
          <button
            onClick={clear}
            style={{ position: 'absolute', right: '1rem', color: 'rgba(255,255,255,.7)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {open && query.trim().length >= 2 && (
        <div className="search-dropdown">
          {results.length === 0 ? (
            <div style={{ padding: '1rem 1.25rem', color: '#94a3b8', fontSize: '.875rem', textAlign: 'center' }}>
              Sin resultados para "{query}"
            </div>
          ) : (
            <>
              <div style={{ padding: '.5rem .75rem .25rem', fontSize: '.7rem', fontWeight: 700, letterSpacing: '.08em', color: '#94a3b8', textTransform: 'uppercase' }}>
                {results.length} resultado{results.length !== 1 ? 's' : ''}
              </div>
              {results.map(e => (
                <div
                  key={e.id}
                  className="search-result-item"
                  onClick={() => handleSelect(e.url)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '.5rem', background: '#dbeafe', flexShrink: 0 }}>
                    <ArrowUpRight size={15} color="#2563eb" />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {e.titulo}
                    </div>
                    {e.categoria && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem', fontSize: '.75rem', color: '#94a3b8', marginTop: 1 }}>
                        <Layers size={11} />
                        <span>{e.categoria.area?.nombre} › {e.categoria.titulo}</span>
                      </div>
                    )}
                  </div>
                  <ArrowUpRight size={14} style={{ color: '#cbd5e1', flexShrink: 0 }} />
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
