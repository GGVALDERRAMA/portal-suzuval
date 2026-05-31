import * as LucideIcons from 'lucide-react'
import { Link as LinkIcon } from 'lucide-react'

/**
 * Renderiza el ícono de una categoría.
 * tipo_icono: 'lucide' | 'imagen'
 * valor_icono: nombre del componente Lucide o URL pública de Storage
 */
export default function CategoriaIcon({ tipoIcono, valorIcono, size = 22 }) {
  if (tipoIcono === 'imagen' && valorIcono) {
    return (
      <img
        src={valorIcono}
        alt="ícono"
        className="upload-preview"
        style={{ width: size + 12, height: size + 12, borderRadius: '.5rem', objectFit: 'cover', border: 'none' }}
      />
    )
  }

  // Lucide icon — busca el componente por nombre
  const IconComponent = LucideIcons[valorIcono] ?? LinkIcon
  return <IconComponent size={size} color="#2563eb" strokeWidth={1.75} />
}
