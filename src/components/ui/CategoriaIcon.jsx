import * as LucideIcons from 'lucide-react'
import { Link as LinkIcon } from 'lucide-react'

/**
 * Renderiza el ícono de una categoría (siempre Lucide).
 * valor_icono: nombre del componente Lucide (ej: 'Car', 'Users')
 */
export default function CategoriaIcon({ valorIcono, size = 22 }) {
  const IconComponent = LucideIcons[valorIcono] ?? LinkIcon
  return <IconComponent size={size} color="#2563eb" strokeWidth={1.75} />
}
