import { JSX } from 'react'

/**
 * Props for the HeaderBar component.
 */
interface ConfirmModalProps {
  title?: string
  open: boolean
  message: string
  onClose: () => void
  cancelText?: string
  confirmText?: string
  onConfirm: () => void
}

/**
 * ConfirmModal component displays a confirmation dialog with a message and two buttons: confirm and cancel.
 */
export const ConfirmModal = ({
  open,
  onClose,
  message,
  onConfirm,
  title = 'Confirmation',
  cancelText = 'Annuler',
  confirmText = 'Confirmer'
}: ConfirmModalProps): JSX.Element | undefined => {
  if (!open) return undefined

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-xl shadow-2xl border border-white/10 w-full max-w-md mx-4 p-6">
        <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
        <p className="text-sm text-white/70">{message}</p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-white/10 text-white/80 hover:bg-white/5 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-500 text-white transition shadow-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
