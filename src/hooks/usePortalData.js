import { useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Carga todos los datos del portal:
 * areas → categorias → enlaces
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
            id, categoria_id, titulo, url, orden, valor_icono, tipo_desarrollo
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

    const areasEnriquecidas = (data ?? []).map(area => ({
      ...area,
      categorias: (area.categorias ?? []).map(cat => ({
        ...cat,
        enlaces: (cat.enlaces ?? []).map(enlace => ({
          ...enlace,
          categoria: { titulo: cat.titulo, area: { nombre: area.nombre } },
        })),
      })),
    }))

    setAreas(areasEnriquecidas)
    setLoading(false)
  }, [])

  const allEnlaces = areas.flatMap(a => a.categorias.flatMap(c => c.enlaces))

  return { areas, allEnlaces, loading, error, refresh: fetchData }
}
