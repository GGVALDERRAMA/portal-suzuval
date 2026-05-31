import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

/**
 * Modal de confirmación de eliminación.
 * Props:
 *   isOpen    - boolean
 *   onClose   - función para cancelar
 *   onConfirm - función para confirmar
 *   title     - título del elemento a eliminar
 *   loading   - boolean (mientras espera la respuesta)
 */
export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} width="w-full max-w-sm">
      <div className="p-6 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mx-auto mb-4">
          <AlertTriangle size={26} className="text-red-500" />
        </div>
        <h3 className="text-lg font-700 text-slate-800 mb-1">¿Eliminar registro?</h3>
        <p className="text-sm text-slate-500 mb-5">
          Vas a eliminar <span className="font-600 text-slate-700">"{title}"</span>.
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3 justify-center">
          <button className="btn-ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
