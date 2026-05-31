import { useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Carga todos los datos del portal en una sola consulta anidada:
 * areas → categorias → enlaces
 * También devuelve un array plano de todos los enlaces para el buscador.
 */
export function usePortalData() {
  const [areas, setAreas]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('areas')
      .select(`
        id, nombre, orden,
        categorias (
          id, area_id, titulo, descripcion, tipo_icono, valor_icono, orden,
          enlaces (
            id, categoria_id, titulo, url, orden, valor_icono,
            tipo_enlace, contacto_nombre, contacto_telefono
          )
        )
      `)
      .order('orden', { ascending: true })
      .order('orden', { ascending: true, foreignTable: 'categorias' })
      .order('orden', { ascending: true, foreignTable: 'categorias.enlaces' })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    // Enriquecer los enlaces con referencia a su categoría y área (para el buscador)
    const areasEnriquecidas = (data ?? []).map(area => ({
      ...area,
      categorias: (area.categorias ?? []).map(cat => ({
        ...cat,
        enlaces: (cat.enlaces ?? []).map(enlace => ({
          ...enlace,
          categoria: {
            titulo: cat.titulo,
            area: { nombre: area.nombre },
          },
        })),
      })),
    }))

    setAreas(areasEnriquecidas)
    setLoading(false)
  }, [])

  // Array plano de todos los enlaces (para el deep search)
  const allEnlaces = areas.flatMap(area =>
    area.categorias.flatMap(cat => cat.enlaces)
  )

  return { areas, allEnlaces, loading, error, refresh: fetchData }
}
