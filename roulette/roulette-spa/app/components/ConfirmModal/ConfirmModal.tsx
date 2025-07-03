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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-neutral-900 text-white rounded-lg ml-6 mr-6 p-6 max-w-sm w-full shadow-xl border border-neutral-700'>
        <h2 className='text-lg font-semibold mb-4'>{title}</h2>
        <p className='text-sm text-neutral-300'>{message}</p>
        <div className='flex justify-end gap-4 mt-6'>
          <button
            onClick={onClose}
            className='text-sm text-white px-4 py-2 rounded-md border border-white/10 hover:bg-white/10 transition'
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className='text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition'
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
