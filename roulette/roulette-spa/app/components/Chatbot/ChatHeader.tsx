import React, { useState } from "react"
import { Trash2, X } from "lucide-react"
import { ConfirmModal } from "../ConfirmModal/ConfirmModal"

type ChatHeaderProps = {
  title: string
  onClose?: () => void
  onClear?: () => void
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ title, onClose, onClear }) => {
  const [showModal, setShowModal] = useState(false)
  const confirmMessage = "Es-tu sûr de vouloir vider la conversation ?"

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 bg-gray-700 border-b">
        <h2 className="text-sm font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-gray-600 rounded" onClick={() => setShowModal(true)}>
            <Trash2 size={16} />
          </button>
          <button className="p-1 hover:bg-gray-600 rounded" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
      </div>
      <ConfirmModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => {
          setShowModal(false)
          onClear?.()
        }}
        message={confirmMessage}
      />
    </>
  )
}
